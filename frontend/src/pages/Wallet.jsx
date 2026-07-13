import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowDownLeft, TrendingDown, Shield, Info, CheckCircle2, AlertTriangle, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/ui/Modal'
import { useUserData } from '../context/UserDataContext'
import { formatDate, timeAgo } from '../utils/helpers'

const AMOUNTS = [100, 500, 1000, 2000, 5000]
const stag    = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.08 } } }
const it      = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ duration:0.25 } } }

export default function WalletPage() {
  const { walletTxns, walletBalance, totalDonated, donations, depositToWallet, budgets } = useUserData()
  const [showDeposit, setShowDeposit] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [amount, setAmount]           = useState(500)
  const [custom, setCustom]           = useState('')
  const [tab, setTab]                 = useState('transactions')

  const deposit = () => {
    const val = parseInt(custom) || amount
    if (!val || val < 1) { toast.error('Enter a valid amount'); return }
    depositToWallet(val)
    setShowDeposit(false); setCustom(''); setAmount(500)
    toast.success(`₹${val.toLocaleString()} added to your wallet!`)
  }

  const penalties  = walletTxns.filter(t => t.type === 'penalty').reduce((s,t) => s + Math.abs(t.amount), 0)
  const deposited  = walletTxns.filter(t => t.type === 'deposit').reduce((s,t) => s + t.amount, 0)
  const overBudget = budgets.filter(b => b.spent > b.limit)

  const TX_STYLE = {
    deposit:    { color:'#00C896', bg:'#E6FFF8',  border:'#A7F3D0', label:'You added money',   icon:<ArrowDownLeft size={15}/> },
    penalty:    { color:'#FF4757', bg:'#FFE8EA',  border:'#FFCCD3', label:'Budget exceeded',   icon:<TrendingDown size={15}/> },
    adjustment: { color:'#7C5CFC', bg:'var(--brand-light)', border:'#D8D0FF', label:'Donated to charity', icon:<Heart size={15}/> },
  }

  return (
    <motion.div variants={stag} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* ── Page Header ── */}
      <motion.div variants={it} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Accountability Wallet</h1>
          <p className="page-subtitle">A self-discipline fund that turns overspending into charity</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setShowHowItWorks(true)} className="btn-secondary">
            <Info size={15}/> How it works
          </button>
          <button onClick={() => setShowDeposit(true)} className="btn-primary">
            <Plus size={15}/> Add Funds
          </button>
        </div>
      </motion.div>

      {/* ── What is this? Banner ── */}
      <motion.div variants={it} style={{ padding:'18px 22px', borderRadius:'var(--radius-lg)', background:'linear-gradient(135deg,#EDE9FF,#E0FFF5)', border:'1.5px solid #D8D0FF', display:'flex', gap:16, alignItems:'flex-start' }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,var(--brand),#9B7BFF)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Shield size={22} color="white"/>
        </div>
        <div>
          <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9375rem', marginBottom:6 }}>What is the Accountability Wallet?</p>
          <p style={{ fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.7 }}>
            This is your <strong>self-discipline fund</strong>. You deposit money here as a commitment to your budget.
            When you <strong>spend more than your budget limit</strong> in any category, a small penalty is automatically
            deducted from this wallet and <strong>donated to charity</strong>. This makes overspending feel real — and helps a good cause!
          </p>
        </div>
      </motion.div>

      {/* ── Balance Card ── */}
      <motion.div variants={it}>
        <div style={{ borderRadius:'var(--radius-xl)', padding:'32px 36px', background:'linear-gradient(135deg,#0D0B26 0%,#1A1040 45%,#0F2318 100%)', position:'relative', overflow:'hidden' }}>
          {/* decorative orbs */}
          <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(124,92,252,0.18)', filter:'blur(50px)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-50, left:-40, width:180, height:180, borderRadius:'50%', background:'rgba(0,200,150,0.12)', filter:'blur(40px)', pointerEvents:'none' }}/>
          {/* grid pattern */}
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>

          <div style={{ position:'relative' }}>
            <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
              Available Balance (your commitment fund)
            </p>
            <motion.p key={walletBalance} initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
              style={{ fontSize:'3rem', fontWeight:800, color:'#FFFFFF', letterSpacing:'-0.04em', lineHeight:1, marginBottom:8 }}>
              ₹{walletBalance.toLocaleString()}
            </motion.p>
            <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.45)', marginBottom:28, lineHeight:1.6 }}>
              This amount is your accountability deposit. Penalties are deducted here when you exceed a budget.
            </p>

            {/* 3 stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, paddingTop:22, borderTop:'1px solid rgba(255,255,255,0.1)' }}>
              {[
                { label:'You deposited',      value:`₹${deposited.toLocaleString()}`,    color:'#34D399', desc:'Added by you' },
                { label:'Penalties deducted', value:`₹${penalties.toLocaleString()}`,    color:'#F87171', desc:'For overspending' },
                { label:'Donated to charity', value:`₹${totalDonated.toLocaleString()}`, color:'#C084FC', desc:'Real social impact' },
              ].map((s,i) => (
                <div key={i}>
                  <p style={{ fontSize:'1.25rem', fontWeight:800, color:s.color, letterSpacing:'-0.02em', marginBottom:2 }}>{s.value}</p>
                  <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</p>
                  <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.22)', marginTop:2 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Step-by-step explainer ── */}
      <motion.div variants={it} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
        {[
          {
            step:'Step 1',
            icon:'💰',
            title:'Add funds to wallet',
            desc:'Deposit any amount (₹100, ₹500, etc.) as your commitment pledge. Think of it like a security deposit for your financial discipline.',
            color:'#7C5CFC',
            bg:'var(--brand-light)',
            border:'#D8D0FF',
          },
          {
            step:'Step 2',
            icon:'📊',
            title:'Set your budgets',
            desc:'Go to Budgets and set monthly limits for Food, Shopping, etc. These are your spending promises to yourself.',
            color:'#FFB300',
            bg:'var(--warning-light)',
            border:'#FDE68A',
          },
          {
            step:'Step 3',
            icon:'⚡',
            title:'Overspend = auto-penalty',
            desc:'If you exceed a budget category, a small amount is automatically deducted from this wallet. No manual action needed.',
            color:'#FF4757',
            bg:'#FFE8EA',
            border:'#FFCCD3',
          },
          {
            step:'Step 4',
            icon:'❤️',
            title:'Penalty goes to charity',
            desc:'The deducted amount is donated to your chosen charity (Akshaya Patra, WWF India, etc.). Your mistake funds a good cause!',
            color:'#E91E63',
            bg:'#FCE4EC',
            border:'#F48FB1',
          },
        ].map((card,i) => (
          <div key={i} style={{ padding:'18px 16px', borderRadius:'var(--radius-lg)', background:card.bg, border:`1.5px solid ${card.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ fontSize:'1.5rem' }}>{card.icon}</span>
              <span style={{ fontSize:'0.72rem', fontWeight:800, color:card.color, textTransform:'uppercase', letterSpacing:'0.08em' }}>{card.step}</span>
            </div>
            <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem', marginBottom:6 }}>{card.title}</p>
            <p style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.6 }}>{card.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Budget status alert ── */}
      {overBudget.length > 0 && (
        <motion.div variants={it} style={{ padding:'14px 18px', borderRadius:'var(--radius)', background:'#FFE8EA', border:'1.5px solid #FFCCD3', display:'flex', alignItems:'flex-start', gap:12 }}>
          <AlertTriangle size={18} color="#FF4757" style={{ flexShrink:0, marginTop:1 }}/>
          <div>
            <p style={{ fontWeight:700, color:'#CC1D2C', fontSize:'0.875rem', marginBottom:3 }}>
              {overBudget.length} budget{overBudget.length>1?'s':''} exceeded — penalties applied!
            </p>
            <p style={{ fontSize:'0.8125rem', color:'#991B1B', lineHeight:1.6 }}>
              Your <strong>{overBudget.map(b=>b.category).join(', ')}</strong> spending exceeded the limit.
              {walletBalance > 0
                ? ` Penalties were deducted from this wallet and donated to charity.`
                : ` Top up your wallet so future penalties can be processed.`}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Low balance warning ── */}
      {walletBalance < 100 && walletBalance >= 0 && (
        <motion.div variants={it} style={{ padding:'14px 18px', borderRadius:'var(--radius)', background:'var(--warning-light)', border:'1.5px solid #FDE68A', display:'flex', alignItems:'center', gap:12 }}>
          <Info size={18} color="#FFB300" style={{ flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:700, color:'#92400E', fontSize:'0.875rem', marginBottom:2 }}>Wallet balance is low</p>
            <p style={{ fontSize:'0.8125rem', color:'#92400E' }}>
              Add at least ₹500 so penalties can be processed when you overspend.
            </p>
          </div>
          <button onClick={() => setShowDeposit(true)} className="btn-primary" style={{ fontSize:'0.8125rem', padding:'8px 16px', flexShrink:0 }}>
            Add Funds
          </button>
        </motion.div>
      )}

      {/* ── Tabs ── */}
      <motion.div variants={it}>
        <div style={{ display:'flex', gap:4, background:'#FFFFFF', border:'1.5px solid var(--border)', borderRadius:12, padding:4, width:'fit-content' }}>
          {[
            { id:'transactions', label:'💳 Transaction History' },
            { id:'donations',    label:'❤️ Charity Donations' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:'8px 18px', borderRadius:9, fontSize:'0.875rem', fontWeight:tab===t.id?700:500, cursor:'pointer', border:'none', transition:'all 0.15s',
                background: tab===t.id ? 'var(--brand)' : 'transparent',
                color:      tab===t.id ? 'white' : 'var(--text-3)',
                boxShadow:  tab===t.id ? 'var(--shadow-brand)' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Transactions tab ── */}
      {tab === 'transactions' && (
        <motion.div variants={it} className="card" style={{ overflow:'hidden' }}>
          {walletTxns.length === 0 ? (
            <div style={{ padding:'52px 24px', textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:14 }}>👛</div>
              <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'1rem', marginBottom:8 }}>No transactions yet</p>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:20, lineHeight:1.6, maxWidth:380, margin:'0 auto 20px' }}>
                Add funds to your wallet to activate the accountability system. Once you have budgets set, penalties will appear here automatically.
              </p>
              <button onClick={() => setShowDeposit(true)} className="btn-primary">
                <Plus size={15}/> Add First Deposit
              </button>
            </div>
          ) : (
            <div>
              <div style={{ padding:'12px 20px', background:'var(--surface)', borderBottom:'1px solid var(--border)' }}>
                <p style={{ fontSize:'0.78rem', color:'var(--text-3)', fontWeight:600 }}>
                  + means you added money &nbsp;|&nbsp; − means a penalty was deducted
                </p>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>What happened</th>
                    <th>Type</th>
                    <th>When</th>
                    <th style={{ textAlign:'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {walletTxns.map((tx,i) => {
                    const s = TX_STYLE[tx.type] || TX_STYLE.deposit
                    return (
                      <tr key={tx._id||i}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:9, background:s.bg, border:`1.5px solid ${s.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:s.color }}>
                              {s.icon}
                            </div>
                            <div>
                              <p style={{ fontWeight:600, color:'var(--text-1)', fontSize:'0.875rem' }}>{tx.description}</p>
                              <p style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:1 }}>{s.label}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.72rem', fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                            {tx.type === 'deposit' ? 'Deposit' : tx.type === 'penalty' ? 'Penalty' : 'Donated'}
                          </span>
                        </td>
                        <td style={{ color:'var(--text-3)', whiteSpace:'nowrap', fontSize:'0.8125rem' }}>{timeAgo(tx.date)}</td>
                        <td style={{ textAlign:'right', fontWeight:700, fontSize:'1rem', color: tx.amount > 0 ? '#00C896' : '#FF4757', whiteSpace:'nowrap' }}>
                          {tx.amount > 0 ? `+₹${tx.amount.toLocaleString()}` : `-₹${Math.abs(tx.amount).toLocaleString()}`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Donations tab ── */}
      {tab === 'donations' && (
        <motion.div variants={it} className="card" style={{ overflow:'hidden' }}>
          {donations.length === 0 ? (
            <div style={{ padding:'52px 24px', textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:14 }}>❤️</div>
              <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'1rem', marginBottom:8 }}>No charity donations yet</p>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', lineHeight:1.6, maxWidth:380, margin:'0 auto' }}>
                Donations happen <strong>automatically</strong> when you exceed a budget limit.
                Once you have budgets set up and overspend in any category, the penalty goes here as a charity donation.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ padding:'12px 20px', background:'#FCE4EC', borderBottom:'1px solid #F48FB1' }}>
                <p style={{ fontSize:'0.78rem', color:'#880E4F', fontWeight:700 }}>
                  ❤️ Every penalty automatically becomes a charity donation — your overspending does good!
                </p>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Charity</th>
                    <th>Cause</th>
                    <th>Why donated</th>
                    <th>Date</th>
                    <th style={{ textAlign:'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d,i) => (
                    <tr key={d._id||i}>
                      <td style={{ fontWeight:600, color:'var(--text-1)' }}>{d.charity}</td>
                      <td><span className="badge badge-brand">{d.cause}</span></td>
                      <td style={{ color:'var(--text-3)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:'0.8125rem' }}>{d.trigger}</td>
                      <td style={{ color:'var(--text-3)', whiteSpace:'nowrap', fontSize:'0.8125rem' }}>{formatDate(d.date)}</td>
                      <td style={{ textAlign:'right', fontWeight:700, color:'#E91E63' }}>₹{d.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Add Funds Modal ── */}
      <Modal isOpen={showDeposit} onClose={() => setShowDeposit(false)} title="Add Funds to Wallet">
        <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:18 }}>
          <div style={{ padding:'12px 16px', borderRadius:'var(--radius)', background:'var(--brand-light)', border:'1.5px solid #D8D0FF', fontSize:'0.8125rem', color:'var(--brand-dark)', lineHeight:1.6 }}>
            <strong>Why add funds?</strong> This money acts as your accountability deposit. If you overspend in any budget category, the penalty is deducted here and donated to charity. The wallet needs funds to process these penalties.
          </div>
          <div>
            <label className="field-label">Choose a quick amount</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => { setAmount(a); setCustom('') }}
                  style={{ padding:'10px 6px', borderRadius:10, fontSize:'0.875rem', fontWeight:700, cursor:'pointer', border:'1.5px solid', transition:'all 0.15s', textAlign:'center',
                    background:    amount===a&&!custom ? 'var(--brand)' : '#FFFFFF',
                    color:         amount===a&&!custom ? 'white' : 'var(--text-1)',
                    borderColor:   amount===a&&!custom ? 'var(--brand)' : 'var(--border)',
                    boxShadow:     amount===a&&!custom ? 'var(--shadow-brand)' : 'none' }}>
                  ₹{a >= 1000 ? (a/1000)+'K' : a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label">Or enter custom amount</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', fontWeight:700, fontSize:'1rem' }}>₹</span>
              <input type="number" value={custom} onChange={e => setCustom(e.target.value)} placeholder="Enter amount" className="input" style={{ paddingLeft:30 }} min="1"/>
            </div>
          </div>
          <div style={{ padding:'13px 16px', borderRadius:11, background:'var(--surface)', border:'1.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.875rem', color:'var(--text-2)', fontWeight:500 }}>You will deposit</span>
            <span style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--brand)' }}>₹{(parseInt(custom)||amount).toLocaleString()}</span>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setShowDeposit(false)} className="btn-secondary" style={{ flex:1 }}>Cancel</button>
            <button onClick={deposit} className="btn-primary" style={{ flex:1, justifyContent:'center' }}>
              <Plus size={15}/> Deposit Now
            </button>
          </div>
        </div>
      </Modal>

      {/* ── How it works Modal ── */}
      <Modal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} title="How the Accountability Wallet Works" size="md">
        <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:18 }}>
          {[
            { emoji:'1️⃣', title:'You deposit money', desc:'Add any amount to the wallet — ₹500, ₹1000, etc. This is your commitment pledge. Think of it as a security deposit for your budget discipline.' },
            { emoji:'2️⃣', title:'You set budgets', desc:'Go to the Budgets page and set monthly limits for each spending category (Food: ₹3000, Shopping: ₹2000, etc.).' },
            { emoji:'3️⃣', title:'You track expenses', desc:'Log your daily spending through Transactions. The app automatically tracks how much you have spent vs your budget limit.' },
            { emoji:'4️⃣', title:'Overspend = penalty', desc:'If your total spending in any category exceeds the limit, a small penalty is automatically deducted from this wallet. Example: Food budget ₹3000, you spend ₹3500 → penalty of ₹5 deducted.' },
            { emoji:'5️⃣', title:'Penalty helps charity', desc:'The deducted penalty amount is instantly donated to your chosen charity (Akshaya Patra, WWF India, etc.). Your mistake funds a real cause!' },
            { emoji:'6️⃣', title:'You stay accountable', desc:'Knowing that overspending costs real money (and goes to charity) creates a powerful psychological incentive to stick to your budget.' },
          ].map((step,i) => (
            <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'14px 16px', borderRadius:'var(--radius)', background:i%2===0?'var(--surface)':'#FFFFFF', border:'1px solid var(--border)' }}>
              <span style={{ fontSize:'1.5rem', flexShrink:0 }}>{step.emoji}</span>
              <div>
                <p style={{ fontWeight:700, color:'var(--text-1)', fontSize:'0.9rem', marginBottom:4 }}>{step.title}</p>
                <p style={{ fontSize:'0.8125rem', color:'var(--text-2)', lineHeight:1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}
          <button onClick={() => setShowHowItWorks(false)} className="btn-primary" style={{ width:'100%', justifyContent:'center' }}>
            Got it! <CheckCircle2 size={15}/>
          </button>
        </div>
      </Modal>

    </motion.div>
  )
}
