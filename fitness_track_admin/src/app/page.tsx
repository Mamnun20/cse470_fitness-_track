"use client"
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import './dashboard.css'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

interface User {
  _id: string;
  name: string;
  email: string;
  approved: boolean;
  createdAt: string;
  gender: string;
  goal: string;
}

interface WorkoutRequest {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  status: string;
  adminResponse: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'requests'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [requests, setRequests] = useState<WorkoutRequest[]>([])
  const [responseText, setResponseText] = useState<Record<string, string>>({})

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  const checkAdmin = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/checklogin`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.ok) {
        setIsAdmin(true);
        fetchData();
      }
    } catch { /* not logged in */ }
    setLoading(false);
  }

  const fetchData = async () => {
    try {
      const [usersRes, reqsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/getusers`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/admin/getrequests`, { credentials: 'include' }),
      ]);
      const usersData = await usersRes.json();
      const reqsData = await reqsRes.json();
      if (usersData.ok) setUsers(usersData.data);
      if (reqsData.ok) setRequests(reqsData.data);
    } catch { /* ignore */ }
  }

  useEffect(() => { checkAdmin() }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { toast.error('Fill in all fields'); return; }
    setLoginLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Logged in');
        setIsAdmin(true);
        fetchData();
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch {
      toast.error('Unable to reach backend');
    } finally {
      setLoginLoading(false);
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) { toast.error('Fill in all fields'); return; }
    setRegLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Admin registered! Please login.');
        setAuthMode('login');
        setLoginEmail(regEmail);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch {
      toast.error('Unable to reach backend');
    } finally {
      setRegLoading(false);
    }
  }

  const handleLogout = async () => {
    document.cookie = 'adminAuthToken=; Max-Age=0; path=/';
    setIsAdmin(false);
    toast.success('Logged out');
  }

  const approveUser = async (userId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/approveuser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('User approved');
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, approved: true } : u));
      }
    } catch { toast.error('Failed'); }
  }

  const rejectUser = async (userId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/rejectuser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('User removed');
        setUsers(prev => prev.filter(u => u._id !== userId));
      }
    } catch { toast.error('Failed'); }
  }

  const respondToRequest = async (userId: string, requestId: string, status: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/respondrequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          requestId,
          status,
          adminResponse: responseText[requestId] || '',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Response sent');
        setRequests(prev => prev.map(r =>
          r._id === requestId ? { ...r, status, adminResponse: responseText[requestId] || '' } : r
        ));
      }
    } catch { toast.error('Failed'); }
  }

  if (loading) {
    return <div className='admin-loading'>Loading...</div>
  }

  if (!isAdmin) {
    return (
      <div className='admin-login-page'>
        <div className='admin-login-card'>
          <h1>Admin Panel</h1>
          <p>{authMode === 'login' ? 'Login to manage users and workout requests' : 'Create a new admin account'}</p>
          {authMode === 'login' ? (
            <form onSubmit={handleLogin}>
              <input type='email' placeholder='Email' value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              <input type='password' placeholder='Password' value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
              <button type='submit' disabled={loginLoading}>
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
              <p className='auth-switch'>No account? <button type='button' onClick={() => setAuthMode('register')}>Register</button></p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <input type='text' placeholder='Name' value={regName} onChange={e => setRegName(e.target.value)} />
              <input type='email' placeholder='Email' value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              <input type='password' placeholder='Password' value={regPassword} onChange={e => setRegPassword(e.target.value)} />
              <button type='submit' disabled={regLoading}>
                {regLoading ? 'Registering...' : 'Register'}
              </button>
              <p className='auth-switch'>Already have an account? <button type='button' onClick={() => setAuthMode('login')}>Login</button></p>
            </form>
          )}
        </div>
      </div>
    )
  }

  const pendingUsers = users.filter(u => !u.approved);
  const approvedUsers = users.filter(u => u.approved);
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className='admin-dashboard'>
      <header className='admin-header'>
        <h1>fitness_track Admin</h1>
        <button className='logout-btn' onClick={handleLogout}>Logout</button>
      </header>

      <div className='admin-stats'>
        <div className='stat-card'>
          <span className='stat-number'>{users.length}</span>
          <span className='stat-label'>Total Users</span>
        </div>
        <div className='stat-card warn'>
          <span className='stat-number'>{pendingUsers.length}</span>
          <span className='stat-label'>Pending Approval</span>
        </div>
        <div className='stat-card'>
          <span className='stat-number'>{requests.length}</span>
          <span className='stat-label'>Workout Requests</span>
        </div>
        <div className='stat-card warn'>
          <span className='stat-number'>{pendingRequests.length}</span>
          <span className='stat-label'>Pending Requests</span>
        </div>
      </div>

      <div className='admin-tabs'>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          User Management
        </button>
        <button className={tab === 'requests' ? 'active' : ''} onClick={() => setTab('requests')}>
          Workout Requests
        </button>
      </div>

      {tab === 'users' && (
        <div className='admin-section'>
          {pendingUsers.length > 0 && (
            <>
              <h2>Pending Approval ({pendingUsers.length})</h2>
              <div className='user-list'>
                {pendingUsers.map(user => (
                  <div className='user-card pending' key={user._id}>
                    <div className='user-info'>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className='user-meta'>{user.gender} &middot; {user.goal}</span>
                    </div>
                    <div className='user-actions'>
                      <button className='approve-btn' onClick={() => approveUser(user._id)}>Approve</button>
                      <button className='reject-btn' onClick={() => rejectUser(user._id)}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <h2>Approved Users ({approvedUsers.length})</h2>
          <div className='user-list'>
            {approvedUsers.map(user => (
              <div className='user-card' key={user._id}>
                <div className='user-info'>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  <span className='user-meta'>{user.gender} &middot; {user.goal}</span>
                </div>
                <span className='approved-badge'>Approved</span>
              </div>
            ))}
            {approvedUsers.length === 0 && <p className='empty'>No approved users yet.</p>}
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className='admin-section'>
          {requests.length === 0 ? (
            <p className='empty'>No workout plan requests yet.</p>
          ) : (
            <div className='request-list'>
              {requests.map(req => (
                <div className={`req-card ${req.status}`} key={req._id}>
                  <div className='req-header'>
                    <div>
                      <strong>{req.userName}</strong>
                      <span className='req-email'>{req.userEmail}</span>
                    </div>
                    <span className={`req-status ${req.status}`}>{req.status}</span>
                  </div>
                  <p className='req-message'>{req.message}</p>
                  <span className='req-date'>{new Date(req.createdAt).toLocaleDateString()}</span>
                  {req.status === 'pending' && (
                    <div className='req-respond'>
                      <textarea
                        placeholder='Your response (optional)...'
                        value={responseText[req._id] || ''}
                        onChange={e => setResponseText(prev => ({ ...prev, [req._id]: e.target.value }))}
                        rows={2}
                      />
                      <div className='req-respond-actions'>
                        <button className='approve-btn' onClick={() => respondToRequest(req.userId, req._id, 'approved')}>
                          Approve
                        </button>
                        <button className='reject-btn' onClick={() => respondToRequest(req.userId, req._id, 'rejected')}>
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                  {req.adminResponse && req.status !== 'pending' && (
                    <div className='req-admin-response'>
                      <strong>Your response:</strong> {req.adminResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
