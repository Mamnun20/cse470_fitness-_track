"use client"
import React from "react"
import { useRouter } from 'next/navigation'
import './workouts.css'

const WORKOUT_DATA = [
    { type: 'Chest', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80', durationInMin: 30 },
    { type: 'Abs', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80', durationInMin: 90 },
    { type: 'Shoulder', imageUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=800&q=80', durationInMin: 40 },
    { type: 'Back', imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=800&q=80', durationInMin: 70 },
    { type: 'Biceps', imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80', durationInMin: 50 },
    { type: 'Triceps', imageUrl: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?auto=format&fit=crop&w=800&q=80', durationInMin: 60 },
    { type: 'Legs', imageUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80', durationInMin: 80 },
    { type: 'Cardio', imageUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80', durationInMin: 100 },
    { type: 'Forearms', imageUrl: 'https://images.unsplash.com/photo-1591940742878-13aba4b7a34e?auto=format&fit=crop&w=800&q=80', durationInMin: 110 },
];

export default function WorkoutsPage() {
    const router = useRouter()

    return (
        <div className='workouts-page'>
            <h1 className='workouts-title'>Workout Guides</h1>
            <div className='workouts-grid'>
                {WORKOUT_DATA.map((item, index) => (
                    <div
                        className='workout-tile'
                        key={index}
                        style={{ backgroundImage: `url(${item.imageUrl})` }}
                        onClick={() => router.push(`/workout/${encodeURIComponent(item.type)}`)}
                    >
                        <div className='workout-tile-overlay'>
                            <h2>{item.type}</h2>
                            <p>{item.durationInMin} min</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
