"use client"
import React from "react"
import { useRouter } from 'next/navigation'
import './homebanner1.css'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

const HomeBanner1 = () => {
  const router = useRouter()
  const [data, setData] = React.useState<any[] | null>(null)

  const getData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/report/getreport`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await res.json();
      if (result.ok) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch report data:', err);
    }
  }

  React.useEffect(() => {
    getData()
  }, [])

  if (!data) {
    return (
      <div className='meters'>
        <p style={{ color: 'var(--col1)', padding: '20px' }}>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className='meters'>
        {
            data.map((item: any, index: number) => {
                return (
                <div
                  className='card'
                  key={index}
                  onClick={() => router.push(`/report/${encodeURIComponent(item.name)}`)}
                >
                    <div className='card-title'>{item.name}</div>
                    <div className='card-stats'>
                        <div className='card-stat-box'>
                            <span className='stat-label'>Today</span>
                            <span className='stat-value'>{Math.round(item.value)} {item.unit}</span>
                        </div>
                        <div className='card-stat-box'>
                            <span className='stat-label'>Total Entries</span>
                            <span className='stat-value'>{item.totalEntries || 0}</span>
                        </div>
                    </div>
                    <div className='card-goal'>
                        Goal: {Math.round(item.goal)} {item.unit}
                    </div>
                </div>
                )
            })
        }
    </div>
  )
}

export default HomeBanner1
