"use client"

import React from 'react'
import { useParams } from 'next/navigation'
import { LineChart } from '@mui/x-charts/LineChart'
import './ReportPage.css'
import TrackingPopup from '@/components/ReportFormPopup/TrackingPopup'
import { AiFillDelete } from 'react-icons/ai'
import { toast } from 'react-toastify'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

interface ChartData {
    data: number[];
    title: string;
    color: string;
    xAxis: { data: Date[]; label: string; scaleType: string };
}

const METRIC_CONFIG: Record<string, { endpoint: string; limitEndpoint: string; getByDateEndpoint: string; deleteEndpoint: string; valueKey: string; unit: string; displayFn: (e: any) => string }> = {
    'Calorie Intake': { endpoint: 'calorieintake', limitEndpoint: '/getcalorieintakebylimit', getByDateEndpoint: '/getcalorieintakebydate', deleteEndpoint: '/deletecalorieintake', valueKey: 'calorieIntake', unit: 'kcal', displayFn: (e) => `${e.item} - ${e.quantity}g (${Math.round(e.calorieIntake)} kcal)` },
    'Sleep': { endpoint: 'sleeptrack', limitEndpoint: '/getsleepbylimit', getByDateEndpoint: '/getsleepbydate', deleteEndpoint: '/deletesleepentry', valueKey: 'durationInHrs', unit: 'hrs', displayFn: (e) => `${e.durationInHrs} hours` },
    'Steps': { endpoint: 'steptrack', limitEndpoint: '/getstepsbylimit', getByDateEndpoint: '/getstepsbydate', deleteEndpoint: '/deletestepentry', valueKey: 'steps', unit: 'steps', displayFn: (e) => `${e.steps} steps` },
    'Water': { endpoint: 'watertrack', limitEndpoint: '/getwaterbylimit', getByDateEndpoint: '/getwaterbydate', deleteEndpoint: '/deletewaterentry', valueKey: 'amountInMilliliters', unit: 'ml', displayFn: (e) => `${e.amountInMilliliters} ml` },
    'Weight': { endpoint: 'weighttrack', limitEndpoint: '/getweightbylimit', getByDateEndpoint: '/getweightbydate', deleteEndpoint: '/deleteweightentry', valueKey: 'weight', unit: 'kg', displayFn: (e) => `${e.weight ?? e.weightInKg} kg` },
    'Workout': { endpoint: 'workouttrack', limitEndpoint: '/getworkoutsbylimit', getByDateEndpoint: '/getworkoutsbydate', deleteEndpoint: '/deleteworkoutentry', valueKey: 'durationInMinutes', unit: 'min', displayFn: (e) => `${e.exercise} - ${e.durationInMinutes} min` },
};

const Page = () => {
    const params = useParams()
    const type = decodeURIComponent(params.type as string)
    const config = METRIC_CONFIG[type]
    const color = '#ffc20e'

    const [chartData, setChartData] = React.useState<ChartData | null>(null)
    const [showPopup, setShowPopup] = React.useState(false)
    const [entries, setEntries] = React.useState<any[]>([])
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0])
    const today = new Date().toISOString().split('T')[0]

    const fetchChart = async () => {
        if (!config) return;
        try {
            const res = await fetch(`${BACKEND_URL}/${config.endpoint}${config.limitEndpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 10 }),
                credentials: 'include',
            });
            const result = await res.json();
            if (result.ok && result.data && result.data.length > 0) {
                const sorted = result.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const dateMap = new Map<string, number>();
                sorted.forEach((entry: any) => {
                    const dateKey = new Date(entry.date).toDateString();
                    const val = entry[config.valueKey] ?? entry.weightInKg ?? 0;
                    if (type === 'Weight') dateMap.set(dateKey, val);
                    else dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + val);
                });
                setChartData({
                    data: Array.from(dateMap.values()),
                    title: `${type} (${config.unit})`,
                    color,
                    xAxis: { data: Array.from(dateMap.keys()).map(d => new Date(d)), label: `Last ${dateMap.size} Days`, scaleType: 'time' }
                });
            }
        } catch (err) {
            console.error('Failed to fetch chart data:', err);
        }
    }

    const fetchEntries = async () => {
        if (!config) return;
        try {
            const res = await fetch(`${BACKEND_URL}/${config.endpoint}${config.getByDateEndpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: selectedDate }),
                credentials: 'include',
            });
            const result = await res.json();
            if (result.ok && result.data) setEntries(result.data);
            else setEntries([]);
        } catch { setEntries([]); }
    }

    const handleDelete = async (item: any) => {
        if (!config) return;
        try {
            const res = await fetch(`${BACKEND_URL}/${config.endpoint}${config.deleteEndpoint}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: item.item, date: item.date }),
                credentials: 'include',
            });
            const result = await res.json();
            if (result.ok) {
                toast.success('Deleted');
                fetchEntries();
                fetchChart();
            }
        } catch { toast.error('Failed to delete'); }
    }

    React.useEffect(() => { fetchChart(); fetchEntries(); }, [type])
    React.useEffect(() => { fetchEntries(); }, [selectedDate])

    if (!config) {
        return <div className='reportpage'><p style={{ padding: 40, color: '#666' }}>Unknown type: {type}</p></div>
    }

    return (
        <div className='reportpage'>
            <h2 className='report-title'>{type} Report</h2>

            {/* Central Add Button */}
            <button className='add-entry-btn' onClick={() => setShowPopup(true)}>
                + Add {type} Entry
            </button>

            {/* Date selector */}
            <div className='date-selector'>
                <button
                    className={selectedDate === today ? 'active' : ''}
                    onClick={() => setSelectedDate(today)}
                >
                    Today
                </button>
                <input
                    type='date'
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={today}
                />
            </div>

            {/* Entries table */}
            <div className='entries-section'>
                <h3>
                    {selectedDate === today ? "Today's Entries" : `Entries for ${selectedDate}`}
                    <span className='entry-count'>({entries.length})</span>
                </h3>
                {entries.length > 0 ? (
                    <table className='entries-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Details</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry: any, idx: number) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{config.displayFn(entry)}</td>
                                    <td>
                                        <button className='delete-btn' onClick={() => handleDelete(entry)}>
                                            <AiFillDelete />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className='no-entries'>No entries for this date</p>
                )}
            </div>

            {/* Chart below table */}
            {chartData && (
                <div className='chart-section'>
                    <h3>Trend (Last {chartData.xAxis.data.length} Days)</h3>
                    <LineChart
                        xAxis={[{
                            id: 'Day',
                            data: chartData.xAxis.data,
                            scaleType: chartData.xAxis.scaleType as any,
                            label: chartData.xAxis.label,
                            valueFormatter: (date: any) => date.getDate().toString()
                        }]}
                        series={[{
                            data: chartData.data,
                            label: chartData.title,
                            color: chartData.color,
                        }]}
                        height={300}
                    />
                </div>
            )}

            {showPopup && (
                <TrackingPopup
                    type={type}
                    onClose={() => setShowPopup(false)}
                    onSaved={() => { setShowPopup(false); fetchChart(); fetchEntries(); }}
                />
            )}
        </div>
    )
}

export default Page
