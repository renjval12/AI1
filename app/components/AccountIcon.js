// Line icons for each account type: a bank for checking, a rising line for savings, a card for credit
const icons = {
  checking: (
    <>
      <path d="M3 10 12 4l9 6" />
      <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
      <path d="M3 20h18" />
    </>
  ),
  savings: (
    <>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </>
  ),
  credit: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
}

const AccountIcon = ({ type }) => {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender text-brand" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icons[type]}
      </svg>
    </span>
  )
}

export default AccountIcon
