"use client"
import React from 'react'
import Navbar from '@/components/Navbar/Navbar'
import { useRouter } from 'next/navigation'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

export default function WorkoutsLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [authed, setAuthed] = React.useState(false)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        fetch(`${BACKEND_URL}/auth/checklogin`, { method: 'POST', credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.ok) setAuthed(true)
                else router.replace('/')
            })
            .catch(() => router.replace('/'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><p style={{ color: 'var(--col1)' }}>Loading...</p></div>
    if (!authed) return null

    return (
        <>
            <Navbar onLogout={() => router.replace('/')} />
            {children}
        </>
    )
}
