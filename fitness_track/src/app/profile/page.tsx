"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { AiFillCamera } from 'react-icons/ai'
import './profile.css'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

interface UserProfile {
    name: string;
    email: string;
    gender: string;
    dob: string;
    goal: string;
    activityLevel: string;
    profileImage: string;
    weight: number;
    height: number;
    createdAt: string;
}

const GOAL_LABELS: Record<string, string> = {
    weightLoss: 'Lose Weight',
    weightGain: 'Gain Weight',
    weightMaintain: 'Maintain Weight',
};

const ACTIVITY_LABELS: Record<string, string> = {
    sedentary: 'Sedentary',
    light: 'Light',
    moderate: 'Moderate',
    active: 'Active',
    veryActive: 'Very Active',
};

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = React.useState<UserProfile | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [editingName, setEditingName] = React.useState(false)
    const [nameInput, setNameInput] = React.useState('')
    const [uploading, setUploading] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/auth/getprofile`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (data.ok) {
                setProfile(data.data);
                setNameInput(data.data.name);
            } else {
                router.replace('/');
            }
        } catch {
            router.replace('/');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchProfile();
    }, []);

    const handleNameSave = async () => {
        if (!nameInput.trim()) {
            toast.error('Name cannot be empty');
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/auth/updateprofile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nameInput.trim() }),
                credentials: 'include',
            });
            const data = await res.json();
            if (data.ok) {
                toast.success('Name updated');
                setEditingName(false);
                fetchProfile();
            } else {
                toast.error(data.message || 'Failed to update');
            }
        } catch {
            toast.error('Failed to update name');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('myimage', file);

            const uploadRes = await fetch(`${BACKEND_URL}/image-upload/uploadimage`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            const uploadData = await uploadRes.json();

            if (uploadData.ok && uploadData.imageUrl) {
                const updateRes = await fetch(`${BACKEND_URL}/auth/updateprofile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profileImage: uploadData.imageUrl }),
                    credentials: 'include',
                });
                const updateData = await updateRes.json();
                if (updateData.ok) {
                    toast.success('Profile image updated');
                    fetchProfile();
                } else {
                    toast.error('Failed to save image');
                }
            } else {
                toast.error(uploadData.error || 'Image upload failed');
            }
        } catch {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getAge = (dob: string) => {
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    if (loading) {
        return (
            <div className='profile-loading'>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className='profile-page'>
            <div className='profile-card'>
                <div className='profile-avatar-section'>
                    <div className='profile-avatar' onClick={() => fileInputRef.current?.click()}>
                        {profile.profileImage ? (
                            <img src={profile.profileImage} alt="Profile" />
                        ) : (
                            <div className='profile-avatar-placeholder'>
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className='profile-avatar-overlay'>
                            {uploading ? <span>...</span> : <AiFillCamera />}
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                    />
                </div>

                <div className='profile-name-section'>
                    {editingName ? (
                        <div className='profile-name-edit'>
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                autoFocus
                            />
                            <button className='btn-save' onClick={handleNameSave}>Save</button>
                            <button className='btn-cancel' onClick={() => { setEditingName(false); setNameInput(profile.name); }}>Cancel</button>
                        </div>
                    ) : (
                        <div className='profile-name-display'>
                            <h1>{profile.name}</h1>
                            <button className='btn-edit' onClick={() => setEditingName(true)}>Edit</button>
                        </div>
                    )}
                    <p className='profile-email'>{profile.email}</p>
                </div>

                <div className='profile-details'>
                    <div className='profile-detail-row'>
                        <span className='detail-label'>Gender</span>
                        <span className='detail-value'>{profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}</span>
                    </div>
                    <div className='profile-detail-row'>
                        <span className='detail-label'>Date of Birth</span>
                        <span className='detail-value'>{formatDate(profile.dob)} ({getAge(profile.dob)} years)</span>
                    </div>
                    <div className='profile-detail-row'>
                        <span className='detail-label'>Weight</span>
                        <span className='detail-value'>{profile.weight} kg</span>
                    </div>
                    <div className='profile-detail-row'>
                        <span className='detail-label'>Height</span>
                        <span className='detail-value'>{profile.height} cm</span>
                    </div>
                    <div className='profile-detail-row'>
                        <span className='detail-label'>Goal</span>
                        <span className='detail-value'>{GOAL_LABELS[profile.goal] || profile.goal}</span>
                    </div>
                    <div className='profile-detail-row'>
                        <span className='detail-label'>Activity Level</span>
                        <span className='detail-value'>{ACTIVITY_LABELS[profile.activityLevel] || profile.activityLevel}</span>
                    </div>
                    <div className='profile-detail-row'>
                        <span className='detail-label'>Member Since</span>
                        <span className='detail-value'>{formatDate(profile.createdAt)}</span>
                    </div>
                </div>

                <button className='btn-back' onClick={() => router.push('/')}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
