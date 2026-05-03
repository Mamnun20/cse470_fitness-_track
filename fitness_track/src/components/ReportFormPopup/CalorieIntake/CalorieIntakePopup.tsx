'use client'

import React from 'react'
import '../popup.css'
import { AiOutlineClose } from 'react-icons/ai'
import { Datepicker, DatepickerEvent } from "@meinefinsternis/react-horizontal-date-picker"
import { enUS } from "date-fns/locale"
import { AiFillDelete } from 'react-icons/ai'
import TextField from '@mui/material/TextField';

interface CalorieIntakePopupProps {
    setShowCalorieIntakePopup: React.Dispatch<React.SetStateAction<boolean>>;
    dateData: Date[];
}

const CalorieIntakePopup: React.FC<CalorieIntakePopupProps> = ({
    setShowCalorieIntakePopup,
    dateData
}) => {

    const addDays = (date: Date, days: number) => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() + days)
        return newDate
    }

    const {
        firstDate,
        lastDate,
        selectedDate,
        monthLabel
    } = React.useMemo(() => {

        const validDates = dateData
            .map((date: any) => new Date(date))
            .filter((date: Date) => !isNaN(date.getTime()))

        if (validDates.length === 0) {
            const today = new Date()

            return {
                firstDate: addDays(today, -15),
                lastDate: addDays(today, 15),
                selectedDate: today,
                monthLabel: today.toLocaleString('en-US', { month: 'long' })
            }
        }

        const minTime = Math.min(...validDates.map((date: Date) => date.getTime()))
        const maxTime = Math.max(...validDates.map((date: Date) => date.getTime()))

        const earliestDataDate = new Date(minTime)
        const latestDataDate = new Date(maxTime)

        const rangeStartDate = addDays(earliestDataDate, -15)
        const rangeEndDate = addDays(latestDataDate, 15)

        const startMonth = rangeStartDate.toLocaleString('en-US', { month: 'long' })
        const endMonth = rangeEndDate.toLocaleString('en-US', { month: 'long' })

        const label = startMonth === endMonth
            ? startMonth
            : `${startMonth} - ${endMonth}`

        return {
            firstDate: rangeStartDate,
            lastDate: rangeEndDate,
            selectedDate: earliestDataDate,
            monthLabel: label
        }

    }, [dateData])

    const [date, setDate] = React.useState<{
        startValue: Date | null;
        endValue: Date | null;
        rangeDates: Date[] | null;
    }>({
        startValue: selectedDate,
        endValue: null,
        rangeDates: [],
    })

    React.useEffect(() => {
        setDate({
            startValue: selectedDate,
            endValue: null,
            rangeDates: [],
        })
    }, [selectedDate])

    const selectedDay = (val: any) => {
        console.log(val)
    }

    const handleDateChange = (d: DatepickerEvent) => {
        const [startValue, endValue, rangeDates] = d

        setDate({
            startValue,
            endValue,
            rangeDates,
        })

        if (startValue) {
            selectedDay(startValue)
        }
    }

    return (
        <div className='popupout'>
            <div className='popupbox'>
                <button
                    className='close'
                    onClick={() => {
                        setShowCalorieIntakePopup(false)
                    }}
                >
                    <AiOutlineClose />
                </button>

                <h3 className='datepicker-month'>
                    {monthLabel}
                </h3>

                <Datepicker
                    locale={enUS}
                    onChange={handleDateChange}
                    startValue={date.startValue}
                    endValue={date.endValue}
                    startDate={firstDate}
                    endDate={lastDate}
                />

                <TextField id="outlined-basic" label="Food item name" variant="outlined" color="warning" />
                <TextField id="outlined-basic" label="Food item amount (in gms)" variant="outlined" color="warning" />

                <div className='hrline'></div>

<div className='items'>
    <div className='item'>
        <h3>Apple</h3>
        <h3>100 gms</h3>
        <button><AiFillDelete /></button>
    </div>

    <div className='item'>
        <h3>Banana</h3>
        <h3>200 gms</h3>
        <button><AiFillDelete /></button>
    </div>

    <div className='item'>
        <h3>Rice</h3>
        <h3>300 gms</h3>
        <button><AiFillDelete /></button>
    </div>
</div>

            </div>
        </div>
    )
}

export default CalorieIntakePopup