import Link from 'next/link'
import { redirect } from 'next/navigation'
import AccountIcon from '../components/AccountIcon'
import { accountTypeLabels, formatBalance, formatDate, formatMoney } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/session'

const Dashboard = async () => {
    const userId = await getUserId()
    if (!userId) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            firstName: true,
            kycStatus: true,
            accounts: {
                orderBy: { createdAt: 'asc' },
                select: { id: true, type: true, name: true, mask: true, balance: true },
            },
        },
    })
    if (!user) redirect('/login')
    // Approved users still need to pick accounts, everyone else sees their application status
    if (user.kycStatus !== 'active') redirect('/onboarding')

    const transactions = await prisma.transaction.findMany({
        where: { account: { userId } },
        orderBy: [{ postedOn: 'desc' }, { createdAt: 'desc' }],
        take: 10,
        select: {
            id: true,
            merchantName: true,
            category: true,
            amount: true,
            postedOn: true,
            pending: true,
            account: { select: { name: true, mask: true } },
        },
    })

    const totalFor = (types) =>
        user.accounts.filter((a) => types.includes(a.type)).reduce((sum, a) => sum + Number(a.balance), 0)

    const stats = [
        user.accounts.some((a) => a.type !== 'credit') && {
            label: 'Cash in checking and savings',
            value: formatMoney(totalFor(['checking', 'savings'])),
        },
        user.accounts.some((a) => a.type === 'credit') && {
            label: 'Credit card balance',
            value: formatMoney(Math.abs(totalFor(['credit']))),
        },
        { label: 'Open accounts', value: user.accounts.length },
    ].filter(Boolean)

    return (
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
            <section className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-400">Welcome back</p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Hi, {user.firstName}</h1>
                </div>
                <Link href="/dashboard/settings" className="btn-secondary border-white/25 px-4 py-1.5 text-sm text-white hover:bg-white/10">
                    Settings
                </Link>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="card p-6 sm:p-6">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="mt-1 text-3xl font-extrabold tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </section>

            <section className="space-y-4">
                <h2 className="section-title">Your accounts</h2>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {user.accounts.map((account) => (
                        <li key={account.id} className="card p-5 sm:p-5">
                            <div className="flex items-center gap-3">
                                <AccountIcon type={account.type} />
                                <div className="min-w-0">
                                    <p className="truncate font-bold">{account.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {accountTypeLabels[account.type]} ••{account.mask}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-5 text-2xl font-extrabold tracking-tight">
                                {formatBalance(account.type, account.balance)}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="card">
                <h2 className="text-lg font-bold">Recent activity</h2>
                {transactions.length === 0 ? (
                    <p className="mt-3 text-gray-500">No transactions yet.</p>
                ) : (
                    <ul className="mt-3 divide-y divide-gray-100">
                        {transactions.map((t) => {
                            const isDeposit = Number(t.amount) > 0
                            return (
                                <li key={t.id} className="flex items-center gap-4 py-3">
                                    <span
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${isDeposit ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                                        aria-hidden="true"
                                    >
                                        {t.merchantName[0]}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold">
                                            {t.merchantName}
                                            {t.pending && (
                                                <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                    Pending
                                                </span>
                                            )}
                                        </p>
                                        <p className="truncate text-sm text-gray-500">
                                            {formatDate(t.postedOn)} · {t.category ?? 'Other'} · {t.account.name} ••{t.account.mask}
                                        </p>
                                    </div>
                                    <p className={`shrink-0 font-bold ${isDeposit ? 'text-green-700' : 'text-gray-900'}`}>
                                        {isDeposit && '+'}
                                        {formatMoney(t.amount)}
                                    </p>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>

            <p className="px-1 text-xs text-gray-500">Demo: these accounts and transactions are sample data.</p>
        </div>
    )
}

export default Dashboard
