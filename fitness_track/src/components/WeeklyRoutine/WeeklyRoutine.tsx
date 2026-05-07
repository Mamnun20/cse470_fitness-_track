"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import './WeeklyRoutine.css'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const WORKOUT_OPTIONS = ['Chest', 'Abs', 'Shoulder', 'Back', 'Biceps', 'Triceps', 'Legs', 'Cardio', 'Forearms', 'Rest'];

type Routine = Record<string, string[]>;

const WeeklyRoutine = () => {
    const router = useRouter()
    const [routine, setRoutine] = useState<Routine>({})
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState<Routine>({})
    const [saving, setSaving] = useState(false)

    const fetchRoutine = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/auth/getroutine`, { credentials: 'include' });
            const data = await res.json();
            if (data.ok && data.data) {
                setRoutine(data.data);
            }
        } catch { /* ignore */ }
    }

    useEffect(() => { fetchRoutine() }, [])

    const startEdit = () => {
        const d: Routine = {};
        DAYS.forEach(day => { d[day] = routine[day] || []; });
        setDraft(d);
        setEditing(true);
    }

    const toggleWorkout = (day: string, workout: string) => {
        setDraft(prev => {
            const current = prev[day] || [];
            if (current.includes(workout)) {
                return { ...prev, [day]: current.filter(w => w !== workout) };
            }
            return { ...prev, [day]: [...current, workout] };
        });
    }

    const saveRoutine = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${BACKEND_URL}/auth/saveroutine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ routine: draft }),
            });
            const data = await res.json();
            if (data.ok) {
                toast.success('Routine saved!');
                setRoutine(draft);
                setEditing(false);
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error('Failed to save routine');
        } finally {
            setSaving(false);
        }
    }

    const hasRoutine = DAYS.some(d => routine[d] && routine[d].length > 0);

    return (
        <div className='routine-section'>
            <div className='routine-header'>
                <h2>My Weekly Routine</h2>
                <div className='routine-header-actions'>
                    <button className='guides-link' onClick={() => router.push('/workouts')}>
                        Workout Guides
                    </button>
                    {!editing && (
                        <button className='edit-routine-btn' onClick={startEdit}>
                            {hasRoutine ? 'Edit Routine' : 'Plan My Week'}
                        </button>
                    )}
                </div>
            </div>

            {editing ? (
                <div className='routine-editor'>
                    <table className='routine-table'>
                        <thead>
                            <tr>
                                {DAYS.map(d => <th key={d}>{d.slice(0, 3)}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {DAYS.map(day => (
                                    <td key={day}>
                                        <div className='workout-checkboxes'>
                                            {WORKOUT_OPTIONS.map(w => (
                                                <label key={w} className={(draft[day] || []).includes(w) ? 'selected' : ''}>
                                                    <input
                                                        type='checkbox'
                                                        checked={(draft[day] || []).includes(w)}
                                                        onChange={() => toggleWorkout(day, w)}
                                                    />
                                                    {w}
                                                </label>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                    <div className='editor-actions'>
                        <button className='save-btn' onClick={saveRoutine} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Routine'}
                        </button>
                        <button className='cancel-btn' onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                hasRoutine ? (
                    <table className='routine-table view'>
                        <thead>
                            <tr>
                                {DAYS.map(d => <th key={d}>{d.slice(0, 3)}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {DAYS.map(day => (
                                    <td key={day}>
                                        {(routine[day] || []).length > 0 ? (
                                            <div className='day-workouts'>
                                                {routine[day].map((w, i) => (
                                                    <span key={i} className={w === 'Rest' ? 'rest-tag' : 'workout-tag'}>{w}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className='rest-tag'>-</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <p className='no-routine'>No routine planned yet. Click &quot;Plan My Week&quot; to get started!</p>
                )
            )}
        </div>
    )
}

export default WeeklyRoutine
