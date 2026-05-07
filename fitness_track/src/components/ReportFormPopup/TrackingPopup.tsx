'use client'

import React from 'react'
import './popup.css'
import { AiOutlineClose, AiFillDelete } from 'react-icons/ai'
import TextField from '@mui/material/TextField'
import { toast } from 'react-toastify'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

interface TrackingPopupProps {
    type: string;
    onClose: () => void;
    onSaved: () => void;
}

const TRACKING_CONFIG: Record<string, {
    addEndpoint: string;
    getEndpoint: string;
    deleteEndpoint: string;
    fields: { name: string; label: string; type: string; key: string }[];
    displayFn: (entry: any) => string;
}> = {
    'Calorie Intake': {
        addEndpoint: '/calorieintake/addcalorieintake',
        getEndpoint: '/calorieintake/getcalorieintakebydate',
        deleteEndpoint: '/calorieintake/deletecalorieintake',
        fields: [
            { name: 'item', label: 'Food item name', type: 'text', key: 'item' },
            { name: 'quantity', label: 'Amount in grams', type: 'number', key: 'quantity' },
        ],
        displayFn: (e: any) => `${e.item} - ${e.quantity}g (${Math.round(e.calorieIntake)} kcal)`,
    },
    'Sleep': {
        addEndpoint: '/sleeptrack/addsleepentry',
        getEndpoint: '/sleeptrack/getsleepbydate',
        deleteEndpoint: '/sleeptrack/deletesleepentry',
        fields: [
            { name: 'durationInHrs', label: 'Duration (hours)', type: 'number', key: 'durationInHrs' },
        ],
        displayFn: (e: any) => `${e.durationInHrs} hours`,
    },
    'Steps': {
        addEndpoint: '/steptrack/addstepentry',
        getEndpoint: '/steptrack/getstepsbydate',
        deleteEndpoint: '/steptrack/deletestepentry',
        fields: [
            { name: 'steps', label: 'Number of steps', type: 'number', key: 'steps' },
        ],
        displayFn: (e: any) => `${e.steps} steps`,
    },
    'Water': {
        addEndpoint: '/watertrack/addwaterentry',
        getEndpoint: '/watertrack/getwaterbydate',
        deleteEndpoint: '/watertrack/deletewaterentry',
        fields: [
            { name: 'amountInMilliliters', label: 'Amount (ml)', type: 'number', key: 'amountInMilliliters' },
        ],
        displayFn: (e: any) => `${e.amountInMilliliters} ml`,
    },
    'Weight': {
        addEndpoint: '/weighttrack/addweightentry',
        getEndpoint: '/weighttrack/getweightbydate',
        deleteEndpoint: '/weighttrack/deleteweightentry',
        fields: [
            { name: 'weightInKg', label: 'Weight (kg)', type: 'number', key: 'weightInKg' },
        ],
        displayFn: (e: any) => `${e.weightInKg} kg`,
    },
    'Workout': {
        addEndpoint: '/workouttrack/addworkoutentry',
        getEndpoint: '/workouttrack/getworkoutsbydate',
        deleteEndpoint: '/workouttrack/deleteworkoutentry',
        fields: [
            { name: 'exercise', label: 'Exercise name', type: 'text', key: 'exercise' },
            { name: 'durationInMinutes', label: 'Duration (minutes)', type: 'number', key: 'durationInMinutes' },
        ],
        displayFn: (e: any) => `${e.exercise} - ${e.durationInMinutes} min`,
    },
};

const TrackingPopup: React.FC<TrackingPopupProps> = ({ type, onClose, onSaved }) => {
    const config = TRACKING_CONFIG[type];
    const [formData, setFormData] = React.useState<Record<string, any>>({});
    const [entries, setEntries] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);

    const fetchEntries = async () => {
        if (!config) return;
        try {
            const res = await fetch(`${BACKEND_URL}${config.getEndpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: selectedDate }),
                credentials: 'include',
            });
            const result = await res.json();
            if (result.ok && result.data) {
                setEntries(result.data);
            } else {
                setEntries([]);
            }
        } catch {
            setEntries([]);
        }
    };

    React.useEffect(() => {
        fetchEntries();
    }, [selectedDate]);

    const handleAdd = async () => {
        if (!config) return;
        const hasEmpty = config.fields.some(f => !formData[f.name] && formData[f.name] !== 0);
        if (hasEmpty) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const body: Record<string, any> = { date: selectedDate };
            config.fields.forEach(f => {
                body[f.name] = f.type === 'number' ? parseFloat(formData[f.name]) : formData[f.name];
            });
            if (type === 'Calorie Intake') {
                body.quantitytype = 'g';
            }

            const res = await fetch(`${BACKEND_URL}${config.addEndpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include',
            });
            const result = await res.json();
            if (result.ok) {
                toast.success('Entry added');
                setFormData({});
                fetchEntries();
            } else {
                toast.error(result.message || 'Failed to add entry');
            }
        } catch {
            toast.error('Failed to add entry');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item: any) => {
        if (!config) return;
        try {
            const res = await fetch(`${BACKEND_URL}${config.deleteEndpoint}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: item.item, date: item.date }),
                credentials: 'include',
            });
            const result = await res.json();
            if (result.ok) {
                toast.success('Entry deleted');
                fetchEntries();
            } else {
                toast.error(result.message || 'Failed to delete');
            }
        } catch {
            toast.error('Failed to delete entry');
        }
    };

    if (!config) {
        return (
            <div className='popupout'>
                <div className='popupbox'>
                    <button className='close' onClick={onClose}><AiOutlineClose /></button>
                    <p>Unknown tracking type: {type}</p>
                </div>
            </div>
        );
    }

    return (
        <div className='popupout'>
            <div className='popupbox'>
                <button className='close' onClick={onClose}><AiOutlineClose /></button>

                <h3 className='datepicker-month'>Add {type}</h3>

                <TextField
                    type="date"
                    label="Date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    color="warning"
                    fullWidth
                />

                {config.fields.map(field => (
                    <TextField
                        key={field.name}
                        label={field.label}
                        type={field.type}
                        variant="outlined"
                        color="warning"
                        fullWidth
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                ))}

                <button
                    className='add-btn'
                    onClick={handleAdd}
                    disabled={loading}
                    style={{
                        backgroundColor: 'var(--col1)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                    }}
                >
                    {loading ? 'Adding...' : `Add ${type}`}
                </button>

                <button
                    onClick={() => { onSaved(); }}
                    style={{
                        backgroundColor: '#333',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                    }}
                >
                    Done - Refresh Chart
                </button>

                <div className='hrline'></div>

                <h4 style={{ color: '#333', fontSize: '14px' }}>
                    Entries for {selectedDate}
                </h4>

                <div className='items'>
                    {entries.length === 0 && (
                        <p style={{ color: '#999', fontSize: '13px' }}>No entries for this date</p>
                    )}
                    {entries.map((entry: any, idx: number) => (
                        <div className='item' key={idx}>
                            <h3>{config.displayFn(entry)}</h3>
                            <button onClick={() => handleDelete(entry)}><AiFillDelete /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TrackingPopup
