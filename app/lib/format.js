// app/lib/format.js
// Safe to import from client and server components

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
// postedOn is a date-only column, stored as UTC midnight, so format it in UTC or it shows the day before
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

export const formatMoney = (amount) => money.format(Number(amount))
export const formatDate = (date) => shortDate.format(new Date(date))

// Credit balances are stored negative (money owed), so show them as a positive amount owed
export const formatBalance = (type, balance) =>
  type === "credit" ? `${formatMoney(Math.abs(Number(balance)))} owed` : formatMoney(balance)

// Phone numbers are stored as digits: "5551234567" or "15551234567" -> "(555) 123-4567"
export const formatPhone = (phone) => {
  const match = phone.replace(/\D/g, "").match(/^1?(\d{3})(\d{3})(\d{4})$/)
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone
}

export const accountTypeLabels ={ checking: "Checking", savings: "Savings", credit: "Credit card" }
