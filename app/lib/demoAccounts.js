// app/lib/demoAccounts.js
// Canned accounts offered after approval, until Plaid is hooked up. Selecting one copies it into financial_accounts.

const daysAgo = (n) => {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() - n)
  return d
}

export const accountOptions = [
  {
    id: "everyday-checking",
    type: "checking",
    name: "Everyday Checking",
    mask: "4821",
    balance: "2450.18",
    transactions: [
      { merchantName: "Payroll Deposit", category: "Income", amount: "2150.00", daysAgo: 2 },
      { merchantName: "Trader Joe's", category: "Groceries", amount: "-64.12", daysAgo: 1 },
      { merchantName: "City Utilities", category: "Bills", amount: "-88.40", daysAgo: 5 },
      { merchantName: "Shell", category: "Transportation", amount: "-41.07", daysAgo: 0, pending: true },
    ],
  },
  {
    id: "high-yield-savings",
    type: "savings",
    name: "High-Yield Savings",
    mask: "9034",
    balance: "12800.00",
    transactions: [
      { merchantName: "Interest Payment", category: "Income", amount: "38.21", daysAgo: 3 },
      { merchantName: "Transfer from Checking", category: "Transfer", amount: "500.00", daysAgo: 10 },
    ],
  },
  {
    id: "cashback-card",
    type: "credit",
    name: "Cashback Card",
    mask: "1177",
    balance: "-642.35",
    transactions: [
      { merchantName: "Amazon", category: "Shopping", amount: "-129.99", daysAgo: 1 },
      { merchantName: "Netflix", category: "Subscriptions", amount: "-15.49", daysAgo: 4 },
      { merchantName: "Chipotle", category: "Dining", amount: "-13.85", daysAgo: 0, pending: true },
    ],
  },
]

// Prisma create data for one option, including its transactions
export const accountCreateData = (userId, option) => ({
  userId,
  type: option.type,
  name: option.name,
  mask: option.mask,
  balance: option.balance,
  transactions: {
    create: option.transactions.map((t) => ({
      merchantName: t.merchantName,
      category: t.category,
      amount: t.amount,
      postedOn: daysAgo(t.daysAgo),
      pending: t.pending ?? false,
    })),
  },
})
