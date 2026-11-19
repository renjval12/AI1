import Link from 'next/link'
import React from 'react'

const Dashboard = () => {
    return (
        <>
            <div>Test Dashboard</div>
            <Link href="/dashboard/settings">Settings</Link>
        </>
    )
}

export default Dashboard