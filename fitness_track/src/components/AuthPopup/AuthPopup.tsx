"use client"
import React, { useState } from 'react'
import './AuthPopup.css'
import Image from 'next/image'
import logo from '@/assets/fitness_logo.png'
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { AiOutlineClose } from 'react-icons/ai'
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { toast } from 'react-toastify';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

interface AuthPopupProps {
    setShowpopup: React.Dispatch<React.SetStateAction<boolean>>;
    defaultMode?: 'login' | 'signup';
}

interface SignupFormData {
    name: string,
    email: string,
    password: string,
    weightInKg: number,
    heightInCm: number,
    goal: string,
    gender: string,
    dob: Date | null,
    activityLevel: string
}

const AuthPopup: React.FC<AuthPopupProps> = ({ setShowpopup, defaultMode = 'login' }) => {
    const [showSignup, setShowSignup] = useState(defaultMode === 'signup')
    const [loading, setLoading] = useState(false)
    const [signupformData, setSignupFormData] = useState<SignupFormData>({
        name: '',
        email: '',
        password: '',
        weightInKg: 0,
        heightInCm: 0,
        goal: '',
        gender: '',
        dob: new Date(),
        activityLevel: ''
    })
    const [loginformData, setLoginFormData] = useState({
        email: '',
        password: '',
    })

    // Forgot password state
    const [forgotMode, setForgotMode] = useState<'none' | 'email' | 'otp' | 'reset'>('none')
    const [forgotEmail, setForgotEmail] = useState('')
    const [serverOtp, setServerOtp] = useState('')
    const [userOtp, setUserOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const handleLogin = async () => {
        if (!loginformData.email || !loginformData.password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginformData),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.ok) {
                toast.success(data.message);
                setShowpopup(false);
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch {
            toast.error('Unable to reach the backend. Please start the API server.');
        } finally {
            setLoading(false);
        }
    }

    const handleSignup = async () => {
        if (!signupformData.name || !signupformData.email || !signupformData.password ||
            !signupformData.goal || !signupformData.gender || !signupformData.activityLevel ||
            !signupformData.weightInKg || !signupformData.heightInCm) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupformData),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.ok) {
                toast.success('Account created! Please login.');
                setShowSignup(false);
            } else {
                toast.error(data.message || 'Signup failed');
            }
        } catch {
            toast.error('Unable to reach the backend. Please start the API server.');
        } finally {
            setLoading(false);
        }
    }

    const handleSendOtp = async () => {
        if (!forgotEmail) { toast.error('Enter your email'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/auth/forgotpassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail }),
            });
            const data = await res.json();
            if (data.ok) {
                toast.success('OTP sent to your email');
                setServerOtp(data.data.otp.toString());
                setForgotMode('otp');
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    }

    const handleVerifyOtp = () => {
        if (userOtp === serverOtp) {
            setForgotMode('reset');
        } else {
            toast.error('Invalid OTP');
        }
    }

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/auth/resetpassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, newPassword }),
            });
            const data = await res.json();
            if (data.ok) {
                toast.success('Password reset! Please login.');
                setForgotMode('none');
                setForgotEmail('');
                setUserOtp('');
                setNewPassword('');
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error('Failed to reset password');
        } finally {
            setLoading(false);
        }
    }

    const renderForgotPassword = () => (
        <div className='authform'>
            <div className='left'>
                <Image src={logo} alt="Logo" />
            </div>
            <div className='right'>
                {forgotMode === 'email' && (
                    <>
                        <h1>Forgot Password</h1>
                        <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
                            <Input color="warning" placeholder="Enter your email" size="lg" variant="solid" type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                        <p><button onClick={() => setForgotMode('none')}>Back to Login</button></p>
                    </>
                )}
                {forgotMode === 'otp' && (
                    <>
                        <h1>Enter OTP</h1>
                        <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '10px' }}>Check your email for the 6-digit code</p>
                        <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}>
                            <Input color="warning" placeholder="Enter OTP" size="lg" variant="solid"
                                value={userOtp}
                                onChange={(e) => setUserOtp(e.target.value)}
                            />
                            <button type="submit">Verify OTP</button>
                        </form>
                        <p><button onClick={() => setForgotMode('email')}>Resend OTP</button></p>
                    </>
                )}
                {forgotMode === 'reset' && (
                    <>
                        <h1>New Password</h1>
                        <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
                            <Input color="warning" placeholder="New password" size="lg" variant="solid" type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )

    return (
        <div className='popup'>
            <button className='close'
                onClick={() => setShowpopup(false)}
            >
                <AiOutlineClose />
            </button>
            {forgotMode !== 'none' ? renderForgotPassword() : (
                showSignup ? (
                    <div className='authform'>
                        <div className='left'>
                            <Image src={logo} alt="Logo" />
                        </div>
                        <div className='right'>
                            <h1>Signup to become a freak</h1>
                            <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
                                <Input color="warning" placeholder="Name" size="lg" variant="solid"
                                    onChange={(e) => setSignupFormData({ ...signupformData, name: e.target.value })}
                                />
                                <Input color="warning" placeholder="Email" size="lg" variant="solid" type="email"
                                    onChange={(e) => setSignupFormData({ ...signupformData, email: e.target.value })}
                                />
                                <Input color="warning" placeholder="Password" size="lg" variant="solid" type="password"
                                    onChange={(e) => setSignupFormData({ ...signupformData, password: e.target.value })}
                                />
                                <Input color="warning" size="lg" variant="solid" type="number" placeholder="Weight in kg"
                                    onChange={(e) => setSignupFormData({ ...signupformData, weightInKg: parseFloat(e.target.value) || 0 })}
                                />
                                <Input color="warning" size="lg" variant="solid" type="number" placeholder="Height in cm"
                                    onChange={(e) => setSignupFormData({ ...signupformData, heightInCm: parseFloat(e.target.value) || 0 })}
                                />
                                <Select color="warning" placeholder="Activity Level" size="lg" variant="solid"
                                    onChange={(_e: any, val: string | null) => setSignupFormData({ ...signupformData, activityLevel: val || '' })}
                                >
                                    <Option value="sedentary">Sedentary</Option>
                                    <Option value="light">Light</Option>
                                    <Option value="moderate">Moderate</Option>
                                    <Option value="active">Active</Option>
                                    <Option value="veryActive">Very Active</Option>
                                </Select>
                                <Select color="warning" placeholder="Goal" size="lg" variant="solid"
                                    onChange={(_e: any, val: string | null) => setSignupFormData({ ...signupformData, goal: val || '' })}
                                >
                                    <Option value="weightLoss">Lose Weight</Option>
                                    <Option value="weightMaintain">Maintain Weight</Option>
                                    <Option value="weightGain">Gain Weight</Option>
                                </Select>
                                <Select color="warning" placeholder="Gender" size="lg" variant="solid"
                                    onChange={(_e: any, val: string | null) => setSignupFormData({ ...signupformData, gender: val || '' })}
                                >
                                    <Option value="male">Male</Option>
                                    <Option value="female">Female</Option>
                                    <Option value="other">Other</Option>
                                </Select>
                                <label style={{ color: '#aaa' }}>Date of Birth</label>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DesktopDatePicker defaultValue={dayjs(new Date())}
                                        sx={{ backgroundColor: 'white', borderRadius: '8px' }}
                                        onChange={(newValue) => setSignupFormData({ ...signupformData, dob: newValue ? new Date(newValue as any) : null })}
                                    />
                                </LocalizationProvider>
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Signing up...' : 'Signup'}
                                </button>
                            </form>
                            <p>Already have an account? <button onClick={() => setShowSignup(false)}>Login</button></p>
                        </div>
                    </div>
                ) : (
                    <div className='authform'>
                        <div className='left'>
                            <Image src={logo} alt="Logo" />
                        </div>
                        <div className='right'>
                            <h1>Login to become a freak</h1>
                            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                                <Input color="warning" placeholder="Email" size="lg" variant="solid" type="email"
                                    onChange={(e) => setLoginFormData({ ...loginformData, email: e.target.value })}
                                />
                                <Input color="warning" placeholder="Password" size="lg" variant="solid" type="password"
                                    onChange={(e) => setLoginFormData({ ...loginformData, password: e.target.value })}
                                />
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                            <p className='forgot-link'>
                                <button onClick={() => setForgotMode('email')}>Forgot Password?</button>
                            </p>
                            <p>Don&apos;t have an account? <button onClick={() => setShowSignup(true)}>Signup</button></p>
                        </div>
                    </div>
                )
            )}
        </div>
    )
}

export default AuthPopup
