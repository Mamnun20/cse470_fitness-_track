"use client"
import React from "react"
import Image from "next/image"
import logo from "@/assets/fitness_logo.png"
import Navbar from "@/components/Navbar/Navbar"
import HomeBanner1 from "@/components/homebanner1/homebanner1"
import WeeklyRoutine from "@/components/WeeklyRoutine/WeeklyRoutine"
import WorkoutRequest from "@/components/WorkoutRequest/WorkoutRequest"
import AuthPopup from "@/components/AuthPopup/AuthPopup"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

export default function Home() {
  const [isloggedin, setIsloggedin] = React.useState<boolean>(false)
  const [authLoading, setAuthLoading] = React.useState<boolean>(true)
  const [showAuthPopup, setShowAuthPopup] = React.useState<boolean>(false)
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login')

  const checklogin = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/checklogin`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setIsloggedin(!!data.ok);
      } else {
        setIsloggedin(false);
      }
    } catch {
      setIsloggedin(false);
    } finally {
      setAuthLoading(false);
    }
  }

  React.useEffect(() => {
    checklogin()
  }, [showAuthPopup])

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--col1)', fontSize: '1.2rem' }}>Loading...</p>
      </div>
    )
  }

  if (!isloggedin) {
    return (
      <div className="landing-page">
        <div className="landing-content">
          <Image src={logo} alt="fitness_track Logo" width={180} height={90} style={{ marginBottom: '20px' }} />
          <h1>fitness_track</h1>
          <p>Track your calories, sleep, steps, water, weight, and workouts all in one place.</p>
          <div className="landing-buttons">
            <button className="btn-login" onClick={() => { setAuthMode('login'); setShowAuthPopup(true) }}>
              Login
            </button>
            <button className="btn-signup" onClick={() => { setAuthMode('signup'); setShowAuthPopup(true) }}>
              Sign Up
            </button>
          </div>
        </div>
        {showAuthPopup && <AuthPopup setShowpopup={setShowAuthPopup} defaultMode={authMode} />}
      </div>
    )
  }

  return (
    <>
      <Navbar onLogout={() => setIsloggedin(false)} />
      <main>
        <HomeBanner1 />
        <WeeklyRoutine />
        <WorkoutRequest />
      </main>
    </>
  )
}
