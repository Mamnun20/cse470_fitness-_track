"use client"
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import './WorkoutRequest.css'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

interface Request {
    _id: string;
    message: string;
    status: string;
    adminResponse: string;
    createdAt: string;
}

const WorkoutRequest = () => {
    const [message, setMessage] = useState('')
    const [requests, setRequests] = useState<Request[]>([])
    const [loading, setLoading] = useState(false)

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/auth/myrequests`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (data.ok) setRequests(data.data || []);
        } catch { /* ignore */ }
    }

    useEffect(() => { fetchRequests() }, [])

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.error('Please describe your workout plan request');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/auth/requestworkoutplan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message }),
            });
            const data = await res.json();
            if (data.ok) {
                toast.success('Request submitted!');
                setMessage('');
                fetchRequests();
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error('Failed to submit request');
        } finally {
            setLoading(false);
        }
    }

    const statusColor = (s: string) => {
        if (s === 'approved') return '#4caf50';
        if (s === 'rejected') return '#f44336';
        return '#ff9800';
    }

    return (
        <div className='workout-request-section'>
            <h2 className='section-title'>Request a Workout Plan</h2>
            <div className='request-form'>
                <textarea
                    placeholder='Describe your fitness goals and what kind of workout plan you need...'
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                />
                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </div>
            {requests.length > 0 && (
                <div className='requests-list'>
                    <h3>Your Requests</h3>
                    {requests.map((req) => (
                        <div className='request-card' key={req._id}>
                            <div className='request-header'>
                                <span className='request-msg'>{req.message}</span>
                                <span className='request-status' style={{ backgroundColor: statusColor(req.status) }}>
                                    {req.status}
                                </span>
                            </div>
                            {req.adminResponse && (
                                <div className='admin-response'>
                                    <strong>Admin:</strong> {req.adminResponse}
                                </div>
                            )}
                            <span className='request-date'>
                                {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default WorkoutRequest
