import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Camera, Trash2, Edit3, Sparkles, CreditCard, Upload, FileImage, AlertCircle, CheckCircle, Clock, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/ui/Modal'
import ImpulseAlert from '../components/features/ImpulseDetector'
import { useUserData } from '../context/UserDataContext'
import { getCategoryInfo, formatDate, CATEGORIES } from '../utils/helpers'

const CAT_COLORS = { Food:'#FF7043', Grocery:'#00C896', Shopping:'#7C5CFC', Entertainment:'#E91E63', Travel:'#2196F3', Healthcare:'#FF4757', Bills:'#607D8B', Education:'#3F51B5', Others:'#9C27B0' }
const CAT_BG    = { Food:'#FFF3EF', Grocery:'#E6FFF8', Shopping:'#EDE9FF', Entertainment:'#FCE4EC', Travel:'#E3F2FD', Healthcare:'#FFE8EA', Bills:'#ECEFF1', Education:'#E8EAF6', Others:'#F3E5F5' }

/* ── Canvas image preprocessor for optimal OCR ── */
const preprocessImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Downscale large images slightly to keep canvas snappy and fast
        let width = img.width
        let height = img.height
        const maxDim = 1200
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Apply Contrast and Grayscale filter
        const contrast = 80 // Contrast coefficient
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // Grayscale formula
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b
          
          // Contrast adjust
          let newColor = factor * (gray - 128) + 128
          newColor = Math.max(0, Math.min(255, newColor))
          
          data[i]     = newColor // R
          data[i + 1] = newColor // G
          data[i + 2] = newColor // B
        }
        
        ctx.putImageData(imageData, 0, 0)
        
        canvas.toBlob((blob) => {
          resolve({
            blob: blob || file,
            dataUrl: canvas.toDataURL('image/jpeg', 0.95)
          })
        }, 'image/jpeg', 0.95)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

/* ── Receipt parsing regexes (Tesseract Fallback) ── */
function toNum(s) { return parseFloat(String(s).replace(/[₹RsINR,\s]/gi,'').trim()) }

function parseAmount(rawText) {
  const lines = rawText.split('\n').map(l=>l.trim()).filter(Boolean)
  const lastNum = line => {
    const m = [...line.matchAll(/(\d{1,6}(?:[,]\d{3})*(?:\.\d{1,2})?)/g)]
    if (!m.length) return null
    const v = toNum(m[m.length-1][1])
    return (!isNaN(v)&&v>0&&v<9999999)?v:null
  }
  
  // Look for total lines
  for (const line of lines) {
    if (/^(grand\s*total|net\s*total|net\s*payable|total\s*amount|bill\s*total|amount\s*payable|amount\s*due|total\s*bill|total)/i.test(line)) {
      const n=lastNum(line); if(n&&n>=1) return n
    }
  }
  for (const line of lines) {
    if (/\btotal\b/i.test(line)&&!/sub.*total|before/i.test(line)) {
      const n=lastNum(line); if(n&&n>=1) return n
    }
  }
  for (const line of lines) {
    if (/\b(amount|payable|due|net)\b/i.test(line)) {
      const n=lastNum(line); if(n&&n>=1) return n
    }
  }
  const rupeeVals = [...rawText.matchAll(/(?:₹|Rs\.?)\s*(\d{1,6}(?:[,]\d{3})*(?:\.\d{1,2})?)/gi)]
    .map(m=>toNum(m[1])).filter(v=>!isNaN(v)&&v>0&&v<9999999)
  if (rupeeVals.length) return Math.max(...rupeeVals)
  
  const allNums = [...rawText.matchAll(/\b(\d{2,6}(?:\.\d{1,2})?)\b/g)]
    .map(m=>toNum(m[1])).filter(v=>!isNaN(v)&&v>=10&&v<9999999)
  if (allNums.length) return allNums[allNums.length-1]
  return null
}

function parseMerchant(rawText) {
  const lines = rawText.split('\n').map(l=>l.trim()).filter(l=>l.length>=2)
  const isJunk = l => /^\d+$/.test(l)||/^[₹$%@#*]/.test(l)||
    /phone|mobile|tel|fax|email|gst|pan|gstin|cin|www\.|http|@/i.test(l)||
    /^(date|time|invoice|bill\s*no|receipt|address|city|pin|state|table|order|qty|rate|amount|desc|item|total|sub|cgst|sgst|igst|tax)/i.test(l)||
    /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(l)||l.length<3
    
  for (const line of lines.slice(0,12)) {
    if (!isJunk(line)&&line.length<=80) {
      return line.replace(/[^a-zA-Z0-9\s&'.\-]/g,'').trim().substring(0,60)||'Unknown'
    }
  }
  return 'Unknown'
}

function parseDate(rawText) {
  const pats=[
    /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/,
    /\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/,
    /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]*(\d{4})\b/i,
    /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})\b/,
  ]
  for (const p of pats) {
    const m=rawText.match(p)
    if(!m) continue
    try {
      const raw=m[0], parts=raw.split(/[\/\-\.]/)
      if(parts.length===3){
        let year=parts[2],month=parts[1],day=parts[0]
        if(parts[0].length===4){year=parts[0];month=parts[1];day=parts[2]}
        if(year.length===2) year='20'+year
        const d=new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`)
        if(!isNaN(d.getTime())&&d.getFullYear()>=2015&&d.getFullYear()<=2035) return d.toISOString().split('T')[0]
      }
    } catch{}
  }
  return new Date().toISOString().split('T')[0]
}

function parseGST(rawText) {
  const m = rawText.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/)
  return m ? m[0] : null
}

function parseTime(rawText) {
  const m = rawText.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\b/)
  return m ? m[0] : null
}

function parsePaymentMethod(rawText) {
  const lower = rawText.toLowerCase()
  if (lower.includes('upi') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm')) return 'UPI'
  if (lower.includes('card') || lower.includes('visa') || lower.includes('mastercard') || lower.includes('credit') || lower.includes('debit')) return 'Card'
  if (lower.includes('cash')) return 'Cash'
  return null
}

function detectCategory(text, merchant) {
  const c=(text+' '+merchant).toLowerCase()
  if (/hospital|clinic|medical|pharmacy|medicine|diagnostic|pathology|\blab\b|dental|dentist|doctor|surgeon|prescription|tablet|capsule|syrup|apollo|fortis|manipal|medplus|chemist|dispensary|nursing/.test(c)) return 'Healthcare'
  if (/restaurant|cafe|food bill|meal|dinner|lunch|breakfast|swiggy|zomato|domino|pizza|burger|biryani|thali|dhaba|paneer|roti|naan|dosa|chicken|mutton|gulab/.test(c)) return 'Food'
  if (/grocery|supermarket|vegetables|fruits|milk|bread|bigbasket|dmart|blinkit|zepto|kiryana/.test(c)) return 'Grocery'
  if (/electricity|water bill|gas bill|internet|broadband|mobile bill|jio|airtel|bsnl|recharge|wifi|cable/.test(c)) return 'Bills'
  if (/amazon|flipkart|mall|shopping|clothes|garments|shoes|footwear|myntra|ajio/.test(c)) return 'Shopping'
  if (/uber|ola|taxi|cab|auto|bus|train|flight|booking|petrol|fuel|toll|rapido|irctc/.test(c)) return 'Travel'
  if (/school|college|university|tuition|books|stationery|course|udemy|coursera/.test(c)) return 'Education'
  if (/movie|cinema|pvr|inox|netflix|spotify|ticket|game/.test(c)) return 'Entertainment'
  
  // Merchant-only mapping fallback
  const l = merchant.toLowerCase()
  for (const [k,v] of Object.entries({
    swiggy:'Food', zomato:'Food', mcdonalds:'Food', dominos:'Food',
    amazon:'Shopping', flipkart:'Shopping', myntra:'Shopping',
    uber:'Travel', ola:'Travel', rapido:'Travel',
    bigbasket:'Grocery', dmart:'Grocery', blinkit:'Grocery',
  })) {
    if (l.includes(k)) return v
  }
  return 'Others'
}

/* ── Validation Layer helper ── */
const validateTransactionData = (data) => {
  if (!data.merchant || !data.merchant.trim()) {
    toast.error('Verification failed: Merchant name is empty!')
    return false
  }
  if (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
    toast.error('Verification failed: Total amount must be a positive number!')
    return false
  }
  if (!data.date) {
    toast.error('Verification failed: Date is empty!')
    return false
  }
  const dateObj = new Date(data.date)
  if (isNaN(dateObj.getTime())) {
    toast.error('Verification failed: Date is invalid!')
    return false
  }
  if (parseFloat(data.amount) > 1000000) {
    toast.error('Verification failed: Amount is unreasonably high (over ₹10,000,000)!')
    return false
  }
  return true
}

/* ── OCR Receipt Scanner Component ── */
function ReceiptScanner({ onClose, onScannedApprove, onScannedEdit }) {
  const [step, setStep]       = useState('upload') // upload, scanning, result, error
  const [subStep, setSubStep] = useState('review') // review (read-only verification), edit (inputs validation)
  const [preview, setPreview] = useState(null)
  const [prog, setProg]       = useState(0)
  const [msg, setMsg]         = useState('')
  const [result, setResult]   = useState(null)
  const [errMsg, setErr]      = useState('')
  const [method, setMethod]   = useState('')
  const fileRef               = useRef()

  const processFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Upload a JPG, PNG or WEBP image'); return }
    if (file.size > 15*1024*1024) { toast.error('Image too large — use under 15MB'); return }
    
    setStep('scanning')
    setProg(5)
    setMsg('Optimizing image contrast & brightness...')
    
    try {
      const preprocessed = await preprocessImage(file)
      setPreview(preprocessed.dataUrl)
      
      setProg(25)
      setMsg('Sending to AI scanner...')
      
      let scanned = null
      // Try backend GPT-4 Vision
      try {
        const base64 = preprocessed.dataUrl.split(',')[1]
        const resp = await fetch('/api/ai/scan-receipt', { 
          method:'POST', 
          headers:{'Content-Type':'application/json'}, 
          body:JSON.stringify({imageBase64:base64,mimeType:file.type}), 
          signal:AbortSignal.timeout(30000) 
        })
        if (resp.ok) { 
          const d = await resp.json()
          setProg(90)
          if(d.success && d.amount > 0) {
            scanned = d
            setMethod('gpt4')
          } 
        }
      } catch(e) { 
        console.warn('GPT-4 Vision scanning failed, falling back to local OCR') 
      }
      
      // Tesseract fallback
      if (!scanned) {
        setProg(35)
        setMsg('Running local OCR pipeline...')
        let rawText = ''
        try {
          const T = (await import('tesseract.js')).default
          const { data } = await T.recognize(preprocessed.blob, 'eng', {
            logger: m => {
              if (m.status === 'recognizing text') {
                setProg(35 + Math.round(m.progress * 48))
                setMsg(`Scanning patterns... ${Math.round(m.progress * 100)}%`)
              }
            }
          })
          rawText = data.text || ''
        } catch(e) {
          console.error('Tesseract OCR failed:', e)
        }
        
        setProg(85)
        setMsg('Parsing variables...')
        
        if (!rawText || rawText.trim().length < 5) { 
          setStep('error')
          setErr('Could not extract text. Please ensure:\n• Light is even and bright\n• Receipt is flat and readable\n• Camera is aligned properly')
          return 
        }
        
        const amount = parseAmount(rawText)
        const merchant = parseMerchant(rawText)
        const date = parseDate(rawText)
        const gst = parseGST(rawText)
        const time = parseTime(rawText)
        const paymentMethod = parsePaymentMethod(rawText)
        const category = detectCategory(rawText, merchant)
        
        scanned = { 
          merchant, 
          amount: amount || 0, 
          date, 
          gst,
          time,
          paymentMethod,
          category, 
          rawText: rawText.slice(0, 600), 
          confidence: amount ? 0.78 : 0.35 
        }
        setMethod('local')
      }
      
      setProg(100)
      setMsg('Scanned successfully!')
      setResult(scanned)
      setStep('result')
      setSubStep('review')
    } catch(e) {
      console.error('Scanning error:', e)
      setStep('error')
      setErr('Scanning failed. Please check your connection or enter manual details.')
    }
  }

  const handleVerify = () => {
    if (!result) return
    if (!validateTransactionData(result)) return
    onScannedApprove(result)
  }

  const handleTriggerEdit = () => {
    setSubStep('edit')
  }

  const handleFinishEditing = () => {
    if (!validateTransactionData(result)) return
    setSubStep('review')
  }

  const confColor = c => c >= 0.7 ? '#00C896' : c >= 0.5 ? '#FFB300' : '#FF4757'
  const isConfidenceLow = result && result.confidence < 0.6

  return (
    <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:18}}>
      {step === 'upload' && (
        <>
          <div onDrop={e=>{e.preventDefault(); if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0])}} onDragOver={e=>e.preventDefault()} onClick={()=>fileRef.current?.click()}
            style={{border:'2px dashed var(--border)', borderRadius:'var(--radius-lg)', padding:'44px 24px', textAlign:'center', cursor:'pointer', background:'var(--surface)', transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.background='var(--brand-light)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)'}}>
            <FileImage size={44} color="var(--brand)" style={{margin:'0 auto 14px', display:'block'}}/>
            <p style={{fontWeight:800, color:'var(--text-1)', fontSize:'1rem', marginBottom:6}}>Drop receipt image here</p>
            <p style={{fontSize:'0.875rem', color:'var(--text-3)', marginBottom:14}}>or click to browse · JPG, PNG, WEBP · max 15MB</p>
            <div style={{display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:99, background:'var(--brand-light)', border:'1px solid #D8D0FF', fontSize:'0.78rem', fontWeight:700, color:'var(--brand)'}}>
              <Sparkles size={12}/> Grayscale Preprocessor & OCR enabled
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={e=>{if(e.target.files[0]) processFile(e.target.files[0])}}/>
        </>
      )}

      {step === 'scanning' && (
        <div style={{textAlign:'center', padding:'16px 0'}}>
          {preview && <img src={preview} alt="Receipt Preview" style={{maxHeight:180, maxWidth:'100%', borderRadius:'var(--radius)', border:'1.5px solid var(--border)', objectFit:'contain', marginBottom:18}}/>}
          <div style={{width:50, height:50, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--brand)', animation:'spin 0.8s linear infinite', margin:'0 auto 16px'}}/>
          <p style={{fontWeight:700, color:'var(--text-1)', marginBottom:4}}>{msg}</p>
          <div style={{background:'var(--surface)', borderRadius:99, height:8, overflow:'hidden', maxWidth:300, margin:'12px auto 6px'}}>
            <motion.div initial={{width:0}} animate={{width:`${prog}%`}} transition={{duration:0.4}} style={{height:'100%', background:'linear-gradient(90deg,var(--brand),#9B7BFF)', borderRadius:99}}/>
          </div>
          <p style={{fontSize:'0.72rem', color:'var(--text-3)'}}>{prog}%</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {step === 'result' && result && (
        <>
          {preview && <img src={preview} alt="Processed Receipt" style={{maxHeight:120, width:'100%', borderRadius:'var(--radius)', border:'1.5px solid var(--border)', objectFit:'contain'}}/>}
          
          {/* OCR Confidence Warning Badge */}
          {isConfidenceLow ? (
            <div style={{padding:'12px 14px', borderRadius:'var(--radius)', background:'#FFFBEB', border:'1.5px solid #FDE68A', display:'flex', alignItems:'center', gap:10}}>
              <AlertCircle size={18} color="#FFB300"/>
              <div>
                <p style={{fontWeight:800, fontSize:'0.8125rem', color:'#B07D00'}}>We are not confident about this receipt</p>
                <p style={{fontSize:'0.75rem', color:'var(--text-2)', marginTop:1}}>Please verify and edit the details below carefully.</p>
              </div>
            </div>
          ) : (
            <div style={{padding:'10px 14px', borderRadius:'var(--radius)', background:'#E6FFF8', border:'1.5px solid #A7F3D0', display:'flex', alignItems:'center', gap:10}}>
              <CheckCircle size={16} color="#00C896"/>
              <div>
                <p style={{fontWeight:700, fontSize:'0.8125rem', color:'#00C896'}}>{method==='gpt4'?'SpendWise AI scanner':'Local OCR pipeline'} extraction complete</p>
                <p style={{fontSize:'0.75rem', color:'var(--text-2)'}}>Verify the fields before adding transaction</p>
              </div>
            </div>
          )}

          {subStep === 'review' ? (
            /* ── READ ONLY VERIFICATION SCREEN ── */
            <div style={{background:'var(--surface)', border:'1.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px', display:'flex', flexDirection:'column', gap:14}}>
              <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid var(--border)', paddingBottom:10}}>
                <div>
                  <span style={{fontSize:'0.72rem', color:'var(--text-3)', fontWeight:700, textTransform:'uppercase'}}>Merchant</span>
                  <p style={{fontSize:'1.125rem', fontWeight:800, color:'var(--text-1)', marginTop:2}}>{result.merchant}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <span style={{fontSize:'0.72rem', color:'var(--text-3)', fontWeight:700, textTransform:'uppercase'}}>Total Amount</span>
                  <p style={{fontSize:'1.3rem', fontWeight:900, color:'var(--brand)', marginTop:2}}>₹{parseFloat(result.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div>
                  <span style={{fontSize:'0.72rem', color:'var(--text-3)', fontWeight:700, textTransform:'uppercase'}}>Date</span>
                  <p style={{fontSize:'0.875rem', fontWeight:700, color:'var(--text-2)', marginTop:2}}>{formatDate(result.date)}</p>
                </div>
                <div>
                  <span style={{fontSize:'0.72rem', color:'var(--text-3)', fontWeight:700, textTransform:'uppercase'}}>Category</span>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginTop:3}}>
                    <span>{CATEGORIES[result.category]?.icon || '📂'}</span>
                    <span style={{fontSize:'0.875rem', fontWeight:700, color:'var(--text-2)'}}>{result.category}</span>
                  </div>
                </div>
              </div>
              {/* Optional Fields (GST, Time, Payment Method) */}
              {(result.gst || result.time || result.paymentMethod || (result.items && result.items.length > 0)) && (
                <div style={{marginTop:8, borderTop:'1px solid var(--border)', paddingTop:12, display:'flex', flexDirection:'column', gap:8}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                    {result.gst && (
                      <div>
                        <span style={{fontSize:'0.7rem', color:'var(--text-3)', fontWeight:600}}>GST Number</span>
                        <p style={{fontSize:'0.78rem', fontWeight:700, color:'var(--text-2)'}}>{result.gst}</p>
                      </div>
                    )}
                    {result.time && (
                      <div>
                        <span style={{fontSize:'0.7rem', color:'var(--text-3)', fontWeight:600}}>Transaction Time</span>
                        <p style={{fontSize:'0.78rem', fontWeight:700, color:'var(--text-2)', display:'flex', alignItems:'center', gap:4}}><Clock size={11}/> {result.time}</p>
                      </div>
                    )}
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                    {result.paymentMethod && (
                      <div>
                        <span style={{fontSize:'0.7rem', color:'var(--text-3)', fontWeight:600}}>Payment Method</span>
                        <p style={{fontSize:'0.78rem', fontWeight:700, color:'var(--text-2)', display:'flex', alignItems:'center', gap:4}}><CreditCard size={11}/> {result.paymentMethod}</p>
                      </div>
                    )}
                    {result.items && result.items.length > 0 && (
                      <div>
                        <span style={{fontSize:'0.7rem', color:'var(--text-3)', fontWeight:600}}>Items (AI Vision)</span>
                        <p style={{fontSize:'0.78rem', fontWeight:700, color:'var(--text-2)', display:'flex', alignItems:'center', gap:4}}><ShoppingCart size={11}/> {result.items.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── EDITABLE VERIFICATION FIELDS ── */
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div>
                <label className="field-label">Merchant Name</label>
                <input value={result.merchant} onChange={e=>setResult(p=>({...p,merchant:e.target.value,category:detectCategory('',e.target.value)}))} className="input" placeholder="e.g. Apollo Pharmacy, Zomato"/>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
                <div>
                  <label className="field-label">Total Amount (₹)</label>
                  <input type="number" value={result.amount||''} onChange={e=>setResult(p=>({...p,amount:parseFloat(e.target.value)||0}))} className="input" placeholder="0.00" style={{fontWeight:700, color:'var(--brand)'}}/>
                </div>
                <div>
                  <label className="field-label">Date</label>
                  <input type="date" value={result.date} onChange={e=>setResult(p=>({...p,date:e.target.value}))} className="input"/>
                </div>
              </div>
              <div>
                <label className="field-label">Category</label>
                <select value={result.category} onChange={e=>setResult(p=>({...p,category:e.target.value}))} className="input">
                  {Object.keys(CATEGORIES).map(c=><option key={c} value={c}>{CATEGORIES[c].icon} {c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={{display:'flex', gap:10, marginTop:6}}>
            <button onClick={()=>{setStep('upload'); setResult(null); setPreview(null)}} className="btn-secondary" style={{flex:1}}><Upload size={14}/> Reject</button>
            {subStep === 'review' ? (
              <>
                <button onClick={handleTriggerEdit} className="btn-secondary" style={{flex:1}}><Edit3 size={14}/> Edit</button>
                <button onClick={handleVerify} className="btn-primary" style={{flex:2, justifyContent:'center'}}><CheckCircle size={14}/> Approve</button>
              </>
            ) : (
              <button onClick={handleFinishEditing} className="btn-primary" style={{flex:3, justifyContent:'center'}}><CheckCircle size={14}/> Save Verification</button>
            )}
          </div>
        </>
      )}

      {step === 'error' && (
        <div style={{textAlign:'center', padding:'16px 0'}}>
          <div style={{width:50, height:50, borderRadius:'50%', background:'#FFE8EA', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px'}}><AlertCircle size={26} color="var(--danger)"/></div>
          <p style={{fontWeight:700, color:'var(--text-1)', fontSize:'1rem', marginBottom:8}}>OCR Scan Problem</p>
          <p style={{fontSize:'0.875rem', color:'var(--text-3)', marginBottom:20, lineHeight:1.7, whiteSpace:'pre-line'}}>{errMsg}</p>
          <div style={{display:'flex', gap:10, justifyContent:'center'}}>
            <button onClick={()=>{setStep('upload'); setPreview(null)}} className="btn-secondary"><Upload size={14}/> Try Again</button>
            <button onClick={onClose} className="btn-primary" style={{justifyContent:'center'}}>Enter Manually</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Expenses Page ── */
const stag = { hidden:{opacity:0}, show:{opacity:1, transition:{staggerChildren:0.05}} }
const it   = { hidden:{opacity:0, y:12}, show:{opacity:1, y:0, transition:{duration:0.22}} }

const BLANK_FORM = { merchant:'', amount:'', category:'Food', date:new Date().toISOString().split('T')[0], note:'' }

export default function Expenses() {
  const ctx = useUserData()
  const { expenses=[], addExpense, updateExpense, deleteExpense } = ctx
  const detectImpulse   = ctx.detectImpulse   || (() => null)
  const addImpulseRecord= ctx.addImpulseRecord || (() => {})

  const [showModal,   setShowModal]   = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [editId,      setEditId]      = useState(null)
  const [search,      setSearch]      = useState('')
  const [filterCat,   setFilterCat]   = useState('All')
  const [form,        setForm]        = useState({...BLANK_FORM})
  const [saving,      setSaving]      = useState(false)
  const [impulseData, setImpulseData] = useState(null)
  const [pendingExp,  setPendingExp]  = useState(null)

  const resetForm = useCallback(() => { 
    setForm({...BLANK_FORM, date:new Date().toISOString().split('T')[0]})
    setEditId(null) 
  }, [])

  const closeModal = useCallback(() => { 
    setShowModal(false)
    resetForm() 
  }, [resetForm])

  /* ── Save transaction — fixed, robust backend API sync ── */
  const saveTransaction = useCallback(async (expData) => {
    try {
      if (editId) {
        await updateExpense(editId, { ...expData, amount: parseFloat(expData.amount) })
        toast.success('Transaction updated ✅')
      } else {
        const result = await addExpense({ ...expData, amount: parseFloat(expData.amount) })
        if (result) {
          toast.success('Transaction saved successfully! ✅')
        } else {
          toast.error('Failed to save — please try again')
          return false
        }
      }
      return true
    } catch(err) {
      console.error('saveTransaction error:', err)
      toast.error('Error saving transaction: ' + err.message)
      return false
    }
  }, [editId, addExpense, updateExpense])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (saving) return
    
    const amt = parseFloat(form.amount)
    const expData = { ...form, amount: amt }
    
    // Strict Validation checks prior to submit
    if (!validateTransactionData(expData)) return

    // Impulse check only for new transactions
    if (!editId) {
      try {
        const detection = detectImpulse(expData)
        if (detection && detection.level && detection.level !== 'Low') {
          setPendingExp(expData)
          setImpulseData(detection)
          setShowModal(false)
          return
        }
      } catch(err) {
        console.warn('Impulse detection failed:', err)
      }
    }

    setSaving(true)
    const ok = await saveTransaction(expData)
    setSaving(false)
    if (ok) { closeModal() }
  }, [form, editId, saving, detectImpulse, saveTransaction, closeModal])

  const handleImpulseProceed = useCallback(async () => {
    if (!pendingExp) return
    setSaving(true)
    try {
      addImpulseRecord({ ...impulseData, merchant:pendingExp.merchant, amount:pendingExp.amount, action:'proceeded' })
    } catch(e) {}
    
    const ok = await saveTransaction(pendingExp)
    setSaving(false)
    if (ok) { 
      setImpulseData(null)
      setPendingExp(null)
      resetForm() 
    }
  }, [pendingExp, impulseData, addImpulseRecord, saveTransaction, resetForm])

  const handleImpulseDismiss = useCallback(() => {
    try { 
      if(pendingExp) {
        addImpulseRecord({ ...impulseData, merchant:pendingExp.merchant, amount:pendingExp.amount, action:'avoided' }) 
      }
    } catch(e) {}
    setImpulseData(null)
    setPendingExp(null)
    toast.success('Smart choice! Purchase skipped.')
  }, [pendingExp, impulseData, addImpulseRecord])

  const handleEdit = useCallback((exp) => {
    setEditId(exp._id)
    setForm({ 
      merchant: exp.merchant||'', 
      amount: String(exp.amount||''), 
      category: exp.category||'Food', 
      date: (exp.date||'').split('T')[0]||new Date().toISOString().split('T')[0], 
      note: exp.note||'' 
    })
    setShowModal(true)
  }, [])

  const handleDelete = useCallback(async (id) => {
    try { 
      await deleteExpense(id)
      toast.success('Transaction deleted') 
    } catch(err) { 
      toast.error('Delete failed: '+err.message) 
    }
  }, [deleteExpense])

  const handleScannedApprove = useCallback(async (data) => {
    setShowReceipt(false)
    setSaving(true)
    const ok = await saveTransaction({
      merchant: data.merchant,
      amount: data.amount,
      category: data.category,
      date: data.date,
      note: 'Scanned from receipt'
    })
    setSaving(false)
    if (ok) { resetForm() }
  }, [saveTransaction, resetForm])

  const handleScannedEdit = useCallback((data) => {
    setShowReceipt(false)
    setEditId(null)
    setForm({
      merchant: data.merchant || '',
      amount: String(data.amount || ''),
      category: data.category || 'Others',
      date: data.date || new Date().toISOString().split('T')[0],
      note: 'Scanned from receipt'
    })
    setShowModal(true)
  }, [])

  const filtered = expenses.filter(e => {
    const ms = (e.merchant||'').toLowerCase().includes(search.toLowerCase()) || (e.category||'').toLowerCase().includes(search.toLowerCase())
    return ms && (filterCat==='All' || e.category===filterCat)
  })
  
  const total = filtered.reduce((s,e) => s+(e.amount||0), 0)
  const catTotals = Object.keys(CATEGORIES).map(c=>({ cat:c, total:expenses.filter(e=>e.category===c).reduce((s,e)=>s+(e.amount||0),0) })).filter(c=>c.total>0).sort((a,b)=>b.total-a.total).slice(0,6)

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:22 }}>
      {/* Header */}
      <motion.div variants={it} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track and scan your transactions to manage your budget</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={()=>setShowReceipt(true)} className="btn-secondary" style={{ display:'flex', alignItems:'center', gap:6 }}><Camera size={15}/> Scan Receipt</button>
          <button onClick={()=>{ resetForm(); setShowModal(true) }} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:6 }}><Plus size={15}/> Add Expense</button>
        </div>
      </motion.div>

      {/* Summary stats */}
      <motion.div variants={it} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
        {[
          { label:'Total Spending', value:`₹${total.toLocaleString()}`, sub:`Filtered list`, icon:'💰', color:'#7C5CFC', bg:'var(--brand-light)' },
          { label:'Transactions', value:filtered.length, sub:`Total logged`, icon:'💳', color:'#00C896', bg:'#E6FFF8' },
          { label:'Top Category', value:catTotals[0]?.cat || 'None', sub:catTotals[0] ? `₹${catTotals[0].total.toLocaleString()} spent` : 'No spends', icon:'📊', color:'#FF7043', bg:'#FFF3EF' },
        ].map((s,i)=>(
          <div key={i} className="stat-card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontSize:'1.4rem' }}>{s.icon}</span>
              <span style={{ fontSize:'0.72rem', fontWeight:700, color:s.color, background:s.bg, padding:'3px 10px', borderRadius:99 }}>{s.sub}</span>
            </div>
            <p style={{ fontSize:'1.625rem', fontWeight:800, color:s.color, letterSpacing:'-0.02em', lineHeight:1, marginBottom:4 }}>{s.value}</p>
            <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', fontWeight:500 }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search and filter controls */}
      <motion.div variants={it} style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:260 }}>
          <Search size={18} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-4)' }}/>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search merchant or category..." className="input" style={{ paddingLeft:40 }}/>
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="input" style={{ width:160 }}>
          <option value="All">All Categories</option>
          {Object.keys(CATEGORIES).map(c=><option key={c} value={c}>{CATEGORIES[c].icon} {c}</option>)}
        </select>
      </motion.div>

      {/* Expenses list */}
      <motion.div variants={it}>
        {filtered.length === 0 ? (
          <div style={{ background:'#FFFFFF', border:'2px dashed var(--border)', borderRadius:'var(--radius-lg)', padding:'52px 32px', textAlign:'center' }}>
            <p style={{ color:'var(--text-3)', fontSize:'0.9375rem', marginBottom:18 }}>No transactions found matching your criteria</p>
            <button onClick={()=>{ resetForm(); setShowModal(true) }} className="btn-primary" style={{ margin:'0 auto' }}><Plus size={15}/> Add Transaction</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map(exp=>{
              const catInfo = getCategoryInfo(exp.category)
              return (
                <div key={exp._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'#FFFFFF', borderRadius:'var(--radius-lg)', border:'1.5px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:CAT_BG[exp.category] || '#F3E5F5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>{catInfo.icon}</div>
                    <div>
                      <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9375rem' }}>{exp.merchant}</p>
                      <p style={{ fontSize:'0.75rem', color:'var(--text-3)', display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                        <span>{formatDate(exp.date)}</span>
                        {exp.note && <span>· {exp.note}</span>}
                        {exp.isAiCategorized && <span style={{ background:'var(--brand-light)', color:'var(--brand)', padding:'1px 6px', borderRadius:99, fontSize:'0.65rem', fontWeight:600 }}>✨ AI</span>}
                      </p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <span style={{ fontWeight:800, fontSize:'1.125rem', color:'var(--text-1)' }}>₹{exp.amount.toLocaleString()}</span>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>handleEdit(exp)} className="btn-ghost" style={{ padding:6, color:'var(--text-3)' }}><Edit3 size={15}/></button>
                      <button onClick={()=>handleDelete(exp._id)} className="btn-ghost" style={{ padding:6, color:'var(--text-4)' }} onMouseEnter={e=>{e.currentTarget.style.color='var(--danger)'; e.currentTarget.style.background='#FFE8EA'}} onMouseLeave={e=>{e.currentTarget.style.color='var(--text-4)'; e.currentTarget.style.background='transparent'}}><Trash2 size={15}/></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Manual Input Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editId ? 'Edit Transaction' : 'Add Transaction'}>
        <form onSubmit={handleSubmit} style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label className="field-label">Merchant Name</label>
            <input type="text" value={form.merchant} onChange={e=>setForm(p=>({...p,merchant:e.target.value}))} placeholder="e.g. Swiggy, Uber" className="input" required/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label className="field-label">Amount (₹)</label>
              <input type="number" step="any" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="0.00" className="input" required/>
            </div>
            <div>
              <label className="field-label">Date</label>
              <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className="input" required/>
            </div>
          </div>
          <div>
            <label className="field-label">Category</label>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="input">
              {Object.keys(CATEGORIES).map(c=><option key={c} value={c}>{CATEGORIES[c].icon} {c}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Note (optional)</label>
            <input type="text" value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} placeholder="e.g. Dinner with friends" className="input"/>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button type="button" onClick={closeModal} className="btn-secondary" style={{ flex:1 }}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex:1, justifyContent:'center' }}>{editId ? 'Save Changes' : 'Add Transaction'}</button>
          </div>
        </form>
      </Modal>

      {/* Impulse Warning Alert */}
      <AnimatePresence>
        {impulseData && (
          <Modal isOpen={!!impulseData} onClose={()=>setImpulseData(null)} title="🚨 High Impulse Spends Risk">
            <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:14 }}>
              <ImpulseAlert score={impulseData.score} level={impulseData.level} factors={impulseData.factors} merchant={pendingExp?.merchant} amount={pendingExp?.amount}/>
              <div style={{ display:'flex', gap:10, marginTop:8 }}>
                <button onClick={handleImpulseDismiss} className="btn-secondary" style={{ flex:1, justifyContent:'center' }}>Cancel Purchase</button>
                <button onClick={handleImpulseProceed} className="btn-primary" style={{ flex:1, justifyContent:'center', background:'var(--brand)' }}>Spend Anyway</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Scan Receipt Modal */}
      <Modal isOpen={showReceipt} onClose={()=>setShowReceipt(false)} title="Scan Receipt with SpendWise AI">
        <ReceiptScanner onClose={()=>setShowReceipt(false)} onScannedApprove={handleScannedApprove} onScannedEdit={handleScannedEdit}/>
      </Modal>
    </motion.div>
  )
}
