import Link from "next/link";
import AccountIcon from "./components/AccountIcon"
import { accountOptions } from "@/lib/demoAccounts"
import { formatBalance, formatMoney } from "@/lib/format"

const steps = [
    { title: "Sign up", body: "Tell us a little about yourself. It takes about two minutes." },
    { title: "Get verified", body: "We confirm your identity securely, and you'll usually know right away." },
    { title: "Choose your accounts", body: "Open checking, savings, or a credit card. Pick as many as you like." },
]

const features = [
    { title: "One dashboard", body: "Every balance and your recent activity, side by side." },
    { title: "Private by design", body: "Your date of birth is encrypted, and we never store your full SSN." },
    { title: "Quick answers", body: "Most people see their result as soon as they submit." },
]

// The hero preview uses the same sample accounts people pick during onboarding
const previewCash = accountOptions
    .filter((o) => o.type !== "credit")
    .reduce((sum, o) => sum + Number(o.balance), 0)

export default function Page() {
    return (
        <div className="flex-1">
            <section className="px-4 pt-12 pb-16 sm:pt-20">
                <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
                    <div>
                        <p className="inline-flex rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-light">
                            Checking · Savings · Credit
                        </p>
                        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                            All your accounts, <span className="text-brand-light">one place</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-lg text-gray-300">
                            Open checking, savings, and credit with AI1, then follow every balance and transaction from a single dashboard.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/signup" className="btn-primary">Create account</Link>
                            <Link href="/login" className="btn-secondary border-white/25 text-white hover:bg-white/10">Log in</Link>
                        </div>
                        <p className="mt-4 text-sm text-gray-400">
                            Already signed in?{" "}
                            <Link href="/dashboard" className="font-semibold text-brand-light hover:underline">Go to your dashboard</Link>
                        </p>
                    </div>

                    <div aria-hidden="true" className="relative mx-auto w-full max-w-md">
                        <div className="absolute -inset-4 rounded-3xl bg-brand/20 blur-2xl" />
                        <div className="card relative">
                            <p className="text-sm text-gray-500">Cash in checking and savings</p>
                            <p className="mt-1 text-3xl font-extrabold tracking-tight">{formatMoney(previewCash)}</p>
                            <ul className="mt-6 space-y-3">
                                {accountOptions.map((option) => (
                                    <li key={option.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                                        <AccountIcon type={option.type} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold">{option.name}</p>
                                            <p className="text-xs text-gray-500">••{option.mask}</p>
                                        </div>
                                        <p className="text-sm font-semibold">{formatBalance(option.type, option.balance)}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 pb-12">
                <div className="mx-auto max-w-6xl">
                    <h2 className="section-title mb-4">How it works</h2>
                    <ol className="grid gap-4 sm:grid-cols-3">
                        {steps.map((step, i) => (
                            <li key={step.title} className="card p-6 sm:p-6">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold text-white">
                                    {i + 1}
                                </span>
                                <h3 className="mt-4 font-bold">{step.title}</h3>
                                <p className="mt-1 text-sm text-gray-600">{step.body}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="px-4 pb-12">
                <div className="mx-auto max-w-6xl">
                    <h2 className="section-title mb-4">Why AI1</h2>
                    <ul className="grid gap-4 sm:grid-cols-3">
                        {features.map((feature) => (
                            <li key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <h3 className="font-bold text-white">{feature.title}</h3>
                                <p className="mt-1 text-sm text-gray-300">{feature.body}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="px-4">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 rounded-2xl bg-lavender p-8 text-center sm:flex-row sm:text-left">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Ready to get started?</h2>
                        <p className="mt-1 text-gray-700">Create your account in a couple of minutes.</p>
                    </div>
                    <Link href="/signup" className="btn-primary">Create account</Link>
                </div>
                <p className="mx-auto mt-4 max-w-6xl px-1 text-xs text-gray-500">
                    This is a demo. Accounts, balances, and transactions are sample data.
                </p>
            </section>
        </div>
    )
}
