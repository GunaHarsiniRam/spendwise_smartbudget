import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RefreshCw, Bot, User, Lightbulb, Zap, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { useUserData } from '../context/UserDataContext'
import { useAuth } from '../context/AuthContext'

/* ══════════════════════════════════════════════════════
   FINANCIAL KNOWLEDGE BASE
   Covers all common personal finance questions accurately
══════════════════════════════════════════════════════ */

const FINANCIAL_KB = {
  // Savings & Interest
  'sip': `**SIP (Systematic Investment Plan)**\n\nA SIP lets you invest a fixed amount in mutual funds every month. For example, investing ₹5,000/month at 12% annual returns for 10 years gives approximately ₹11.6 lakhs.\n\n**Benefits:**\n• Rupee cost averaging — you buy more units when markets are low\n• Compound growth over time\n• Starts with as little as ₹500/month\n• No need to time the market\n\n**Where to start:** Zerodha Coin, Groww, Paytm Money, or your bank's app.`,

  'emergency fund': `**Emergency Fund**\n\nAn emergency fund is 3–6 months of your monthly expenses kept in a liquid savings account or FD.\n\n**Why you need it:**\n• Job loss protection\n• Medical emergencies\n• Unexpected repairs\n\n**How to build it:**\n1. Calculate monthly expenses\n2. Multiply by 6 for target amount\n3. Save 10–20% of income each month until reached\n4. Keep it in a high-yield savings account or liquid fund — NOT in investments\n\n**Rule:** Never invest until you have 3 months emergency fund saved.`,

  'fd': `**Fixed Deposit (FD)**\n\nA Fixed Deposit is a savings instrument where you deposit money for a fixed period at a guaranteed interest rate.\n\n**Current FD rates (typical):**\n• Regular FDs: 5.5–7.5% per year\n• Senior citizen FDs: +0.5% extra\n• Tax-saving FDs (5 years): 6.5–7.5%\n\n**Best for:** Emergency fund, short-term goals (1–5 years)\n**Not good for:** Long-term wealth creation (inflation eats returns)\n\n**Tip:** Ladder your FDs — split into 3 smaller FDs maturing at different times.`,

  'ppf': `**PPF (Public Provident Fund)**\n\nPPF is a government-backed long-term savings scheme with tax benefits.\n\n**Key details:**\n• Current interest rate: 7.1% per year (compounded annually)\n• Lock-in period: 15 years (extendable in 5-year blocks)\n• Maximum deposit: ₹1.5 lakhs per year\n• Tax benefit: Section 80C deduction up to ₹1.5L\n• Returns are completely tax-free (EEE status)\n\n**Best for:** Long-term tax-free wealth building\n**Open at:** Post office or major banks (SBI, HDFC, ICICI)`,

  'credit score': `**Credit Score**\n\nA credit score (300–900) shows your creditworthiness to lenders. In India, CIBIL score is most used.\n\n**Score ranges:**\n• 750–900 = Excellent (best loan rates)\n• 700–749 = Good\n• 650–699 = Fair (may get loans at higher rates)\n• Below 650 = Poor (loan rejection risk)\n\n**How to improve:**\n1. Pay all EMIs and credit card bills on time\n2. Keep credit utilisation below 30%\n3. Don't apply for too many loans at once\n4. Maintain older credit accounts\n5. Check your score free at CIBIL.com or Experian\n\n**Check your score:** Paytm, BankBazaar, or bank apps (free)`,

  'income tax': `**Income Tax in India (FY 2024-25)**\n\n**New Tax Regime (default):**\n• Up to ₹3 lakhs: Nil\n• ₹3L–7L: 5%\n• ₹7L–10L: 10%\n• ₹10L–12L: 15%\n• ₹12L–15L: 20%\n• Above ₹15L: 30%\n• Standard deduction: ₹75,000\n• Rebate u/s 87A: No tax up to ₹7L income\n\n**Old Tax Regime:**\n• More deductions (80C, 80D, HRA, etc.)\n• Better if your total deductions exceed ₹3.75 lakhs\n\n**Tip:** Use the new regime if your deductions are low. Use old regime if you have home loan + PPF + insurance.`,

  'mutual fund': `**Mutual Funds**\n\nA mutual fund pools money from many investors to buy stocks, bonds, or other securities managed by a professional fund manager.\n\n**Types:**\n• **Equity funds** — Invests in stocks (high risk, high return, 12–15% long term)\n• **Debt funds** — Invests in bonds (low risk, 6–8%)\n• **Hybrid funds** — Mix of both (medium risk)\n• **Index funds** — Tracks Nifty/Sensex (low cost, recommended for beginners)\n\n**How to start:**\n1. Complete KYC on Groww, Zerodha Coin, or Paytm Money\n2. Start with a Nifty 50 Index Fund\n3. Invest via SIP for discipline\n\n**Rule:** Invest in equity mutual funds only for 5+ year goals.`,

  '80c': `**Section 80C Tax Deduction**\n\n80C allows deductions up to **₹1.5 lakhs per year** from taxable income (only in Old Tax Regime).\n\n**Eligible investments:**\n• PPF — 7.1% tax-free returns\n• ELSS (Equity mutual funds) — 3-year lock-in, 12–15% returns\n• NSC — 7.7% returns\n• Tax-saving FD — 5-year lock-in, 6.5–7%\n• LIC premium\n• EPF contributions\n• Tuition fees for children\n• Home loan principal repayment\n\n**Best choice:** ELSS gives both tax saving AND wealth creation.`,

  'home loan': `**Home Loan**\n\n**Current rates (2024):** 8.5–9.5% per year (floating rate)\n\n**Key points:**\n• Maximum tenure: 30 years\n• EMI rule: Keep home loan EMI below 40% of monthly income\n• Tax benefit: ₹2L deduction on interest (Section 24b) + ₹1.5L on principal (Section 80C) — only in old regime\n• Pre-payment: No penalty on floating rate loans (RBI rule)\n\n**Before taking a home loan:**\n1. Down payment should be at least 20%\n2. Have 6-month EMI as emergency reserve\n3. Compare rates from 3–4 banks\n4. Check processing fees and prepayment charges`,

  'inflation': `**Inflation & Your Money**\n\nInflation is the rise in prices over time. India's average inflation is 5–6% per year.\n\n**Impact on savings:**\n• ₹1,00,000 today = ₹60,000 purchasing power in 10 years (at 5% inflation)\n• Savings account (3.5%) can't beat inflation\n• FD (6–7%) barely beats inflation after tax\n\n**How to beat inflation:**\n1. Equity mutual funds (12–15% long-term average)\n2. Real estate\n3. Gold (7–8% long-term average)\n4. PPF (7.1%, tax-free)\n\n**Key rule:** Never keep more money in savings/FD than your emergency fund. Invest the rest.`,

  'gold': `**Investing in Gold**\n\n**Options:**\n• **Sovereign Gold Bonds (SGB)** — Best option. Issued by RBI. 2.5% extra interest + gold price gains. No GST. Tax-free if held till maturity (8 years).\n• **Gold ETF** — Invest in gold through stock market. No storage risk.\n• **Digital Gold** — Available on Paytm, PhonePe. Convenient but has storage charges.\n• **Physical gold** — Jewellery/coins. Has making charges. Not recommended for investment.\n\n**How much to allocate:** 5–10% of your investment portfolio\n**Gold returns:** 7–8% per year historically`,

  'budget': `**How to Create a Budget**\n\n**The 50-30-20 Rule:**\n• **50%** of income → Needs (rent, food, bills, transport)\n• **30%** of income → Wants (entertainment, dining out, shopping)\n• **20%** of income → Savings & investments\n\n**Steps:**\n1. Calculate your monthly take-home income\n2. List all fixed expenses (rent, EMIs, subscriptions)\n3. Track variable expenses for 1 month\n4. Set category limits\n5. Review weekly and adjust\n\n**Tools:** SpendWise (you're using it!), Excel, or YNAB\n\n**Key insight:** Most people overspend 15–20% on food and entertainment without realising.`,

  'savings rate': `**Savings Rate**\n\nSavings rate = (Income − Expenses) ÷ Income × 100\n\n**Benchmarks:**\n• Below 10% = Needs immediate attention\n• 10–20% = Acceptable\n• 20–30% = Good\n• 30–50% = Excellent\n• 50%+ = Financial independence path\n\n**India context:** Average household savings rate is about 18–22%.\n\n**To improve your savings rate:**\n1. Automate savings on salary day\n2. Increase income (skills, freelance, promotion)\n3. Cut 3 biggest expense categories\n4. Use cash-back cards for regular expenses`,

  'stock market': `**Investing in Stock Market**\n\n**Basics:**\n• Buy shares of companies on BSE/NSE\n• Higher risk but higher returns than FDs over 10+ years\n• Nifty 50 has given ~12% average annual returns over 20 years\n\n**How to start:**\n1. Open Demat account (Zerodha, Upstox, Groww — zero brokerage)\n2. Complete KYC (PAN + Aadhaar)\n3. Start with Index Funds before individual stocks\n4. Never invest more than you can afford to lose\n\n**Rules for beginners:**\n• Don't try to time the market\n• Invest regularly (SIP approach)\n• Hold for minimum 5–7 years\n• Diversify across sectors\n• Never invest emergency fund or money needed within 3 years`,

  'nps': `**NPS (National Pension System)**\n\nA government-backed retirement savings scheme.\n\n**Benefits:**\n• Additional ₹50,000 deduction under Section 80CCD(1B) — over and above 80C\n• Market-linked returns (10–12% historically for equity option)\n• Pension at retirement\n\n**Drawbacks:**\n• 60% corpus taxable at withdrawal (40% must buy annuity)\n• Less flexible than other investments\n\n**Best for:** People who want additional tax saving beyond ₹1.5L 80C limit\n**Minimum investment:** ₹500 per year`,
}

/* ══════════════════════════════════════════════════════
   INTELLIGENT RESPONSE ENGINE
   Checks user's real data + financial knowledge base
══════════════════════════════════════════════════════ */
function generateResponse(query, name, budgets, goals, expenses, profile) {
  const q    = query.toLowerCase().trim()
  const income = profile?.monthlyIncome || 0
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const walletBal = profile?.walletBalance || 0

  // ── 1. Check financial knowledge base first ──────────────────────────
  for (const [topic, answer] of Object.entries(FINANCIAL_KB)) {
    if (q.includes(topic)) return answer
  }

  // ── 2. Keyword expansions for KB topics ─────────────────────────────
  if (/sip|systematic investment|mutual fund.*monthly/.test(q)) return FINANCIAL_KB['sip']
  if (/emergency|emergency fund|safety net|rainy day/.test(q)) return FINANCIAL_KB['emergency fund']
  if (/fixed deposit|fd|recurring deposit/.test(q)) return FINANCIAL_KB['fd']
  if (/ppf|public provident/.test(q)) return FINANCIAL_KB['ppf']
  if (/credit score|cibil|credit rating/.test(q)) return FINANCIAL_KB['credit score']
  if (/income tax|itr|tax slab|tax saving|80c|section 80/.test(q)) {
    if (q.includes('80c')) return FINANCIAL_KB['80c']
    return FINANCIAL_KB['income tax']
  }
  if (/mutual fund|mf|equity fund|debt fund|index fund/.test(q)) return FINANCIAL_KB['mutual fund']
  if (/home loan|housing loan|mortgage/.test(q)) return FINANCIAL_KB['home loan']
  if (/inflation|purchasing power/.test(q)) return FINANCIAL_KB['inflation']
  if (/gold|sgb|sovereign gold/.test(q)) return FINANCIAL_KB['gold']
  if (/budget|50.30.20|spending plan/.test(q)) return FINANCIAL_KB['budget']
  if (/savings rate|save more|saving percentage/.test(q)) return FINANCIAL_KB['savings rate']
  if (/stock|share market|nse|bse|sensex|nifty|equity/.test(q)) return FINANCIAL_KB['stock market']
  if (/nps|national pension|pension/.test(q)) return FINANCIAL_KB['nps']

  // ── 3. User's personal data questions ────────────────────────────────

  // Spending analysis
  if (/spending|spent|expense|transaction|buy|purchase/.test(q)) {
    if (expenses.length === 0) {
      return `**Your Spending Analysis**\n\nYou haven't logged any expenses yet, ${name}.\n\nTo get personalised spending insights:\n1. Click **Add Transaction** or **Scan Receipt**\n2. Log your daily expenses for one week\n3. Come back and ask me again — I'll give you a detailed breakdown!\n\n**Tip:** Even logging 3–4 transactions per day gives me enough data to spot patterns.`
    }
    const catTotals = {}
    expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category]||0) + e.amount })
    const sorted = Object.entries(catTotals).sort((a,b) => b[1]-a[1])
    const top3   = sorted.slice(0,3).map(([cat, amt]) => `• **${cat}**: ₹${amt.toLocaleString()}`).join('\n')

    return `**Your Spending Analysis, ${name}**\n\nTotal logged: ₹${totalExpenses.toLocaleString()} across ${expenses.length} transactions\n\n**Top spending categories:**\n${top3}\n\n${income > 0 ? `**Spending rate:** ${Math.round((totalExpenses/income)*100)}% of your ₹${income.toLocaleString()} monthly income` : ''}\n\n**Recommendation:** Your biggest category is ${sorted[0]?.[0]}. ${sorted[0]?.[0]==='Food'?'Consider cooking at home 2–3 times a week to save ₹800–1,200/month.':sorted[0]?.[0]==='Shopping'?'Apply a 48-hour wait rule before non-essential purchases.':'Review if this spending is aligned with your goals.'}`
  }

  // Budget questions
  if (/budget|limit|over budget|budget exceeded/.test(q)) {
    if (budgets.length === 0) {
      return `**Budget Setup, ${name}**\n\nYou haven't created any budgets yet.\n\n**Why budgets matter:**\nWithout spending limits, most people overspend by 15–25% without realising it.\n\n**How to set up budgets:**\n1. Go to **Budgets** page\n2. Click "Add Budget"\n3. Start with your top 3 spending categories\n4. Use the 50-30-20 rule as a guide:\n   • 50% of income for needs\n   • 30% for wants\n   • 20% for savings\n\nFor ₹${income > 0 ? income.toLocaleString() : 'your'} income, I recommend:\n${income > 0 ? `• Food: ₹${Math.round(income*0.15).toLocaleString()}/month\n• Grocery: ₹${Math.round(income*0.1).toLocaleString()}/month\n• Entertainment: ₹${Math.round(income*0.05).toLocaleString()}/month` : '• Set realistic limits based on your last 3 months spending'}`
    }
    const over = budgets.filter(b => b.spent > b.limit)
    const safe = budgets.filter(b => b.spent <= b.limit)
    return `**Budget Status for ${name}**\n\n${budgets.map(b => {
      const pct = Math.round((b.spent/b.limit)*100)
      const status = b.spent>b.limit ? '🔴 Exceeded' : pct>80 ? '🟡 Near limit' : '🟢 On track'
      return `${status} **${b.category}**: ₹${b.spent.toLocaleString()} / ₹${b.limit.toLocaleString()} (${pct}%)`
    }).join('\n')}\n\n${over.length > 0 ? `**⚠ ${over.length} budget${over.length>1?'s':''} exceeded.** Penalties have been donated to charity.\n\n**To stay within budget:**\n• Set up weekly check-ins (every Sunday)\n• Enable budget alerts in your profile settings\n• Reduce ${over[0]?.category} spending by cutting 1–2 big purchases` : '**✅ All budgets on track this month.** Great discipline!'}`
  }

  // Goals questions
  if (/goal|saving for|target|dream|iphone|laptop|vacation|emergency|down payment/.test(q)) {
    if (goals.length === 0) {
      return `**Your Savings Goals, ${name}**\n\nYou haven't set any goals yet.\n\n**Why goals are powerful:**\nPeople with written financial goals save 3× more than those without.\n\n**Popular goals to start with:**\n• **Emergency Fund** — 6 months expenses (most important!)\n• **Phone/Laptop** — Short-term goal (6–12 months)\n• **Vacation** — Medium-term (1–2 years)\n• **Down payment** — Long-term (3–5 years)\n\n**Go to Goals page** → Add Goal → Set your first target today!`
    }
    const completed = goals.filter(g => g.currentAmount >= g.targetAmount)
    const inProgress = goals.filter(g => g.currentAmount < g.targetAmount)
    return `**Your Goals Update, ${name}**\n\n${goals.map(g => {
      const pct = Math.round((g.currentAmount/g.targetAmount)*100)
      const rem = g.targetAmount - g.currentAmount
      const mos = g.monthlyContribution > 0 ? Math.ceil(rem/g.monthlyContribution) : null
      return `**${g.name}** — ${pct}% complete\n₹${g.currentAmount.toLocaleString()} saved of ₹${g.targetAmount.toLocaleString()} target${mos ? `\nAt current pace, you'll reach this in **${mos} months**` : '\n💡 Set a monthly contribution to see your timeline'}`
    }).join('\n\n')}\n\n${completed.length > 0 ? `🎉 **${completed.length} goal${completed.length>1?'s':''} achieved!**` : ''}${inProgress.length > 0 && income > 0 ? `\n\n**Tip:** Automate ₹${Math.round(income*0.2).toLocaleString()} monthly (20% of income) to your goals.` : ''}`
  }

  // Income / salary
  if (/income|salary|earn|pay|wage/.test(q)) {
    if (income === 0) {
      return `**Setting Your Income, ${name}**\n\nYou haven't set your monthly income yet.\n\n**Why it matters:**\nWithout income data, I can't calculate your savings rate, suggest realistic budgets, or forecast your goals.\n\n**Add your income:**\nGo to **Profile → Personal Information → Monthly Income** and enter your take-home salary.\n\n**After adding income, I can tell you:**\n• Your current savings rate\n• Recommended budget for each category\n• How long to reach each goal\n• Whether you're saving enough for retirement`
    }
    const saveAmount = income - totalExpenses
    const saveRate   = Math.round((saveAmount/income)*100)
    return `**Income Analysis for ${name}**\n\nMonthly income: ₹${income.toLocaleString()}\nTotal expenses logged: ₹${totalExpenses.toLocaleString()}\nNet savings: ₹${Math.max(0,saveAmount).toLocaleString()} (${Math.max(0,saveRate)}% savings rate)\n\n**Benchmarks:**\n• 10–20%: Acceptable\n• 20–30%: Good\n• 30%+: Excellent\n\n${saveRate >= 30 ? '✅ **Your savings rate is excellent!** Keep this up and you\'ll build significant wealth.' : saveRate >= 20 ? '👍 **Good savings rate.** Aim for 30% by cutting your top expense category.' : saveRate >= 10 ? '⚠ **Below average.** Try automating savings on your salary day before spending.' : '🚨 **Your savings rate is very low.** Prioritise emergency fund immediately.'}\n\n**Recommended allocation:**\n• Savings/investments: ₹${Math.round(income*0.2).toLocaleString()}/month (20%)\n• Needs: ₹${Math.round(income*0.5).toLocaleString()}/month (50%)\n• Wants: ₹${Math.round(income*0.3).toLocaleString()}/month (30%)`
  }

  // How to save more
  if (/how.*save|save more|tips.*save|save.*money|increase.*savings/.test(q)) {
    return `**How to Save More, ${name}**\n\n**Immediate actions (this week):**\n1. Automate savings — set a standing instruction on salary day\n2. Cancel unused subscriptions (check your bank statement)\n3. Cook at home 3 days this week\n\n**Medium-term (this month):**\n4. Use the 24-hour rule before any purchase above ₹500\n5. Buy groceries weekly, not daily (reduces impulse buys)\n6. Switch to prepaid mobile plan if on postpaid\n\n**System changes:**\n7. Open a separate savings account — don't keep savings in your primary account\n8. Use cash-back credit cards for regular expenses (pay full balance monthly)\n9. Review and negotiate recurring bills annually\n\n**Rule of thumb:** Every ₹100/month you save and invest at 12% becomes ₹32,000 in 20 years.`
  }

  // Retirement
  if (/retire|retirement|pension|old age/.test(q)) {
    return `**Retirement Planning**\n\nStart early — the power of compounding is extraordinary.\n\n**How much do you need?**\nRule of thumb: 25× your annual expenses\n\nExample: If you spend ₹5L/year today → Need ₹1.25 crore at retirement (adjusted for inflation: ~₹3–4 crore in 25 years)\n\n**How to build it:**\n1. **EPF/VPF** — Employer-matched, tax-free. Max out VPF if possible\n2. **PPF** — ₹1.5L/year, completely tax-free\n3. **NPS** — Extra ₹50,000 tax deduction + market returns\n4. **Equity Mutual Funds** — For aggressive growth (10+ year horizon)\n\n**Start now:** ₹5,000/month at 12% for 30 years = **₹1.76 crore**\n₹5,000/month at 12% for 20 years = **₹49.9 lakhs**\n\nEvery year you delay costs you lakhs at retirement.`
  }

  // Debt / loan questions
  if (/debt|loan|emi|credit card|borrow|repay|pay off/.test(q)) {
    return `**Debt Management**\n\n**Priority order to pay off debt:**\n1. **Credit card debt** — Highest priority (interest: 24–42% per year)\n2. **Personal loans** — (interest: 10–24% per year)\n3. **Car loans** — (interest: 8–12% per year)\n4. **Home loan** — Lowest priority (interest: 8.5–9.5%, tax benefits)\n\n**Strategies:**\n• **Avalanche method** — Pay minimum on all, put extra money on highest interest debt first (saves most money)\n• **Snowball method** — Pay smallest debt first (builds motivation)\n\n**Credit card rule:** Always pay full outstanding amount. Minimum payment = debt trap.\n\n**EMI rule:** Total EMIs should not exceed 40% of take-home income.`
  }

  // Insurance
  if (/insurance|term plan|health insurance|life cover/.test(q)) {
    return `**Insurance Guide**\n\n**Non-negotiable insurance (everyone needs):**\n\n1. **Term Life Insurance**\n   • Cover: 10–15× annual income\n   • Cost: ~₹500–800/month for ₹1 crore cover\n   • Buy pure term plan, not ULIP or endowment\n   • Best time: When you have dependants\n\n2. **Health Insurance**\n   • Minimum ₹5 lakh cover per person\n   • Family floater for household\n   • Cost: ₹8,000–20,000/year for ₹10L family cover\n   • Don't rely only on employer health cover\n\n**Skip these:**\n• Investment-linked insurance (ULIP, endowment)\n• Credit card insurance\n• Small-value policies\n\n**Rule:** Insurance is for protection, not investment.`
  }

  // Wallet / charity
  if (/wallet|penalty|donation|charity|donate/.test(q)) {
    return `**Your Accountability Wallet**\n\nSpendWise's unique accountability system works like this:\n\n**How it works:**\n1. When you exceed a budget category, a small penalty is deducted from your wallet\n2. This penalty is automatically donated to your chosen charity\n3. This creates real financial accountability\n\n**Penalty tiers (configurable):**\n• 5–10% over budget: ₹1 donated\n• 10–20% over budget: ₹5 donated\n• 20%+ over budget: ₹10 donated\n\n**Benefits:**\n• Overspending now has real consequences\n• You're funding good causes\n• Creates emotional connection to staying within budget\n\n**Your wallet balance:** ₹${walletBal.toLocaleString()}\n\n**To add funds:** Go to Wallet → Add Funds`
  }

  // Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste)\b/.test(q)) {
    return `Hello, ${name}! 👋 I'm your AI Financial Coach.\n\nI can help you with:\n• **Your data** — spending analysis, budget review, goal tracking\n• **Financial knowledge** — SIP, FD, PPF, tax saving, credit score\n• **Planning** — how to save more, retirement, emergency fund\n• **Debt management** — loans, EMIs, credit cards\n\nWhat would you like to know today?`
  }

  // Thanks
  if (/thank|thanks|thank you|thx/.test(q)) {
    return `You're welcome, ${name}! 😊\n\nRemember: Consistent small financial decisions today create massive wealth tomorrow.\n\nFeel free to ask anything else — I'm here to help you make better financial decisions!`
  }

  // ── 4. Irrelevant / out-of-scope questions ───────────────────────────
  const irrelevantTopics = [
    /cricket|ipl|football|sports|match|team/,
    /movie|film|actor|actress|bollywood|netflix.*show/,
    /recipe|cook|food.*how|restaurant.*name/,
    /weather|rain|temperature|forecast/,
    /politics|election|government|minister|pm\b|president/,
    /joke|funny|laugh|comedy/,
    /relationship|love|marriage|girlfriend|boyfriend/,
    /health.*disease|medicine.*dose|doctor.*advice|symptoms|diagnosis/,
    /legal.*advice|lawyer|court|case/,
    /news|current event|today.*happen/,
    /game|gaming|video game|pubg|fortnite/,
  ]

  for (const pattern of irrelevantTopics) {
    if (pattern.test(q)) {
      return `I appreciate your question, ${name}, but this is outside my area of expertise.\n\nI'm specifically trained as a **Personal Finance Coach** and can only help with:\n\n• 💰 Budgeting and expense tracking\n• 📈 Investments (SIP, mutual funds, FD, PPF)\n• 🎯 Savings goals and planning\n• 📊 Tax saving strategies\n• 💳 Debt management and credit score\n• 🏠 Home loans and EMI planning\n• 🛡️ Insurance planning\n• 📅 Retirement planning\n\nFor other topics, please consult the appropriate expert. Is there anything about your finances I can help with?`
    }
  }

  // ── 5. Smart catch-all for financial-adjacent questions ──────────────
  if (/invest|return|yield|portfolio|asset|wealth|money|finance|financial|rupee|₹|lakh|crore/.test(q)) {
    return `**Financial Guidance for ${name}**\n\nThat's a great financial question. Let me give you some direction:\n\n${income > 0 ? `Based on your ₹${income.toLocaleString()}/month income, here's a simple framework:\n\n• **Emergency fund** (if not done): ₹${Math.round(income*6).toLocaleString()} target\n• **Monthly investment**: ₹${Math.round(income*0.2).toLocaleString()} (20% of income)\n• **Suggested split**: 60% equity mutual funds + 30% PPF/FD + 10% gold\n\n` : ''}**For more specific advice, try asking:**\n• "How to start SIP?"\n• "What is PPF?"\n• "How to save tax?"\n• "How to build emergency fund?"\n• "What is a good credit score?"\n\nI'm here to give you accurate, actionable financial guidance!`
  }

  // ── 6. Final fallback ────────────────────────────────────────────────
  return `I don't have enough information to answer "*${query}*" accurately, ${name}.\n\nAs your Personal Finance Coach, I specialise in:\n\n• Budgeting and expense tracking\n• Investment options (SIP, mutual funds, FD, PPF)\n• Tax saving strategies\n• Goal-based savings planning\n• Debt management\n• Credit score improvement\n• Retirement planning\n• Insurance guidance\n\n**Try asking something like:**\n• "How to start investing?"\n• "What is SIP?"\n• "How to improve credit score?"\n• "Analyse my spending"\n• "How to save more money?"\n\nFor questions outside finance, please consult the relevant expert.`
}

/* ══════════════════════════════════════════════════════
   FORMAT MARKDOWN FOR DISPLAY
══════════════════════════════════════════════════════ */
function formatMsg(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-1);font-weight:700">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color:var(--brand)">$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/• /g, '&nbsp;&nbsp;• ')
    .replace(/(\d+)\. /g, '&nbsp;&nbsp;<strong>$1.</strong> ')
}

/* ══════════════════════════════════════════════════════
   QUICK PROMPTS
══════════════════════════════════════════════════════ */
const QUICK_PROMPTS = [
  { icon:'📊', text:'Analyse my spending' },
  { icon:'💰', text:'How to start SIP?' },
  { icon:'🎯', text:'Review my goals' },
  { icon:'📈', text:'What is mutual fund?' },
  { icon:'🏦', text:'How to save tax?' },
  { icon:'💳', text:'How to improve credit score?' },
  { icon:'🛡️', text:'Tell me about emergency fund' },
  { icon:'📅', text:'How to plan for retirement?' },
]

/* ══════════════════════════════════════════════════════
   CHAT BUBBLE
══════════════════════════════════════════════════════ */
function ChatBubble({ msg }) {
  const isAI = msg.role === 'ai'
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      style={{ display:'flex', gap:12, flexDirection:isAI?'row':'row-reverse', alignItems:'flex-end' }}>
      <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
        background: isAI ? 'linear-gradient(135deg,var(--brand),#9B7BFF)' : 'var(--surface)',
        border: isAI ? 'none' : '1.5px solid var(--border)' }}>
        {isAI ? <Bot size={18} color="white"/> : <User size={18} color="var(--text-2)"/>}
      </div>
      <div style={{ maxWidth:'80%', display:'flex', flexDirection:'column', gap:4, alignItems:isAI?'flex-start':'flex-end' }}>
        {isAI ? (
          <div style={{ padding:'14px 18px', borderRadius:16, borderTopLeftRadius:4, background:'#FFFFFF', border:'1.5px solid var(--border)', fontSize:'0.875rem', color:'var(--text-2)', lineHeight:1.7, boxShadow:'var(--shadow-sm)' }}
            dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }}/>
        ) : (
          <div style={{ padding:'11px 16px', borderRadius:16, borderTopRightRadius:4, background:'linear-gradient(135deg,var(--brand),#9B7BFF)', color:'white', fontSize:'0.875rem', lineHeight:1.55, boxShadow:'var(--shadow-brand)' }}>
            {msg.content}
          </div>
        )}
        <span style={{ fontSize:'0.6875rem', color:'var(--text-4)', paddingLeft:isAI?4:0, paddingRight:isAI?0:4 }}>{msg.time}</span>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN AI COACH PAGE
══════════════════════════════════════════════════════ */
export default function AICoach() {
  const { user }   = useAuth()
  const { aiInsights, budgets, goals, profile, expenses } = useUserData()
  const firstName  = (user?.name || profile?.name || 'User').split(' ')[0]
  const income     = profile?.monthlyIncome || 0
  const totalExp   = expenses.reduce((s,e)=>s+e.amount, 0)
  const violations = budgets.filter(b=>b.spent>b.limit)

  const initMsg = `Hello ${firstName}! I'm your **Personal AI Finance Coach**.\n\nI have access to your financial data and can give you accurate, personalised guidance.\n\n**Your current snapshot:**\n• Income: ${income > 0 ? `₹${income.toLocaleString()}/month` : 'Not set (go to Profile → add income)'}\n• Expenses logged: ${expenses.length} transactions (₹${totalExp.toLocaleString()} total)\n• Active budgets: ${budgets.length}\n• Savings goals: ${goals.length}\n${violations.length > 0 ? `• ⚠ ${violations.length} budget${violations.length>1?'s':''} exceeded this month` : budgets.length > 0 ? '• ✅ All budgets on track' : ''}\n\n**Ask me anything about finance** — investments, tax saving, budgeting, credit score, retirement, or your own spending data. I'll give you accurate answers!`

  const [messages, setMessages] = useState([
    { role:'ai', content:initMsg, time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }
  ])
  const [input, setInput]   = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef           = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, typing])

  const send = async (text) => {
    const q = (text||input).trim()
    if (!q) return
    const time = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
    setMessages(p => [...p, { role:'user', content:q, time }])
    setInput('')
    setTyping(true)
    // Small delay to feel natural
    await new Promise(r => setTimeout(r, 600 + Math.random()*400))
    setTyping(false)
    const reply = generateResponse(q, firstName, budgets, goals, expenses, profile)
    setMessages(p => [...p, { role:'ai', content:reply, time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }])
  }

  const handleReset = () => {
    setMessages([{ role:'ai', content:initMsg, time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }])
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, height:'calc(100vh - 126px)' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(135deg,var(--brand),#9B7BFF)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-brand)' }}>
            <Bot size={22} color="white"/>
          </div>
          <div>
            <h1 style={{ fontSize:'1.125rem', fontWeight:700, color:'var(--text-1)', letterSpacing:'-0.02em', marginBottom:2 }}>
              AI Financial Coach
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <motion.div animate={{ scale:[1,1.4,1] }} transition={{ duration:1.8, repeat:Infinity }}
                style={{ width:7, height:7, borderRadius:'50%', background:'#00C896' }}/>
              <span style={{ fontSize:'0.75rem', color:'#00C896', fontWeight:600 }}>
                Online · Personalised for {firstName}
              </span>
            </div>
          </div>
        </div>
        <button onClick={handleReset} className="btn-secondary" style={{ fontSize:'0.8125rem' }}>
          <RefreshCw size={14}/> Reset
        </button>
      </div>

      {/* Personalised insight chips */}
      {aiInsights.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:10, flexShrink:0 }}>
          {aiInsights.slice(0,4).map((ins,i) => {
            const bgMap = { warning:'var(--warning-light)', success:'var(--accent-light)', info:'#E3F2FD' }
            const borderMap = { warning:'#FDE68A', success:'#A7F3D0', info:'#BBDEFB' }
            return (
              <button key={ins.id||i} onClick={() => send(ins.title)}
                style={{ textAlign:'left', padding:'12px 14px', borderRadius:12, background:bgMap[ins.type]||'#E3F2FD', border:`1.5px solid ${borderMap[ins.type]||'#BBDEFB'}`, cursor:'pointer', transition:'all 0.15s', display:'flex', gap:10, alignItems:'flex-start' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
                <Lightbulb size={15} color="var(--brand)" style={{ flexShrink:0, marginTop:1 }}/>
                <div>
                  <p style={{ fontWeight:600, color:'var(--text-1)', fontSize:'0.8125rem', lineHeight:1.3, marginBottom:ins.saving>0?4:0 }}>{ins.title}</p>
                  {ins.saving>0 && <p style={{ fontSize:'0.72rem', color:'#00A87D', fontWeight:700 }}>Save ₹{ins.saving.toLocaleString()}/mo</p>}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Chat area */}
      <div style={{ flex:1, background:'#FFFFFF', borderRadius:'var(--radius-lg)', border:'1.5px solid var(--border)', padding:'20px', overflowY:'auto', display:'flex', flexDirection:'column', gap:16, minHeight:0, boxShadow:'var(--shadow-sm)' }} className="no-scroll">
        {messages.map((m,i) => <ChatBubble key={i} msg={m}/>)}

        {/* Typing indicator */}
        {typing && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', gap:12, alignItems:'flex-end' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,var(--brand),#9B7BFF)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Bot size={18} color="white"/>
            </div>
            <div style={{ padding:'14px 18px', borderRadius:16, borderTopLeftRadius:4, background:'#FFFFFF', border:'1.5px solid var(--border)', display:'flex', alignItems:'center', gap:7 }}>
              {[0,1,2].map(i => (
                <motion.div key={i} animate={{ y:[0,-5,0], opacity:[0.4,1,0.4] }} transition={{ duration:0.8, repeat:Infinity, delay:i*0.18 }}
                  style={{ width:7, height:7, borderRadius:'50%', background:'var(--text-4)' }}/>
              ))}
              <span style={{ fontSize:'0.78rem', color:'var(--text-3)', marginLeft:4 }}>Thinking…</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick prompts */}
      <div style={{ display:'flex', gap:7, overflowX:'auto', flexShrink:0, paddingBottom:2 }} className="no-scroll">
        {QUICK_PROMPTS.map((p,i) => (
          <button key={i} onClick={() => send(p.text)}
            style={{ flexShrink:0, display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:99, fontSize:'0.8125rem', fontWeight:500, color:'var(--text-2)', background:'#FFFFFF', border:'1.5px solid var(--border)', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.color='var(--brand)'; e.currentTarget.style.background='var(--brand-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)'; e.currentTarget.style.background='#FFFFFF' }}>
            <span>{p.icon}</span> {p.text}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div style={{ display:'flex', gap:10, flexShrink:0 }}>
        <div style={{ position:'relative', flex:1 }}>
          <input value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
            placeholder={`Ask anything about finance or your data, ${firstName}…`}
            className="input" style={{ paddingRight:56 }}/>
          <div style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', gap:3, fontSize:'0.72rem', color:'var(--brand)', fontWeight:700 }}>
            <Zap size={11}/> AI
          </div>
        </div>
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
          onClick={() => send()}
          disabled={!input.trim() || typing}
          className="btn-primary"
          style={{ padding:'0 20px', opacity:(!input.trim()||typing)?0.5:1 }}>
          <Send size={16}/>
        </motion.button>
      </div>
    </div>
  )
}
