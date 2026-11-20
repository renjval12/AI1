import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import Header from "./components/Header"
import Footer from "./components/Footer"
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" })

export const metadata: Metadata = {
    title: "AI1",
    description: "Open checking, savings, and credit accounts and see them all in one dashboard.",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={jakarta.variable}>
            <body className="min-h-screen flex flex-col antialiased">
                <Header />
                <main className="flex-1 flex flex-col">{children}</main>
                <Footer />
            </body>

        </html>
    )
}
