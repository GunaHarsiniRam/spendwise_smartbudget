// SpendWise — All values start at 0. Real data comes from the logged-in user.

export const mockUser = {
  _id:                  '',
  name:                 '',
  email:                '',
  avatar:               null,
  phone:                '',
  joinedAt:             new Date().toISOString(),
  financialHealthScore: 0,
  streak:               0,
  totalBadges:          0,
  walletBalance:        0,
  totalDonated:         0,
  savingsGoalsMet:      0,
}

// All lists start empty — user adds their own data
export const mockBudgets      = []
export const mockExpenses     = []
export const mockGoals        = []
export const mockDonations    = []
export const mockNotifications= []
export const mockViolations   = []
export const mockBadges       = []
export const mockCharities    = []
export const mockWalletTransactions = []

export const mockMonthlySpending = []
export const mockAIInsights      = []
export const mockForecast        = {
  '30day':  { projected: 0, savings: 0, trend: 'stable' },
  '6month': { projected: 0, savings: 0, trend: 'stable' },
  '12month':{ projected: 0, savings: 0, trend: 'stable' },
  chartData: [],
}
