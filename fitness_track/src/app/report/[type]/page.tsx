"use client"

import React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import './ReportPage.css'
import { AiFillEdit } from 'react-icons/ai'
import CalorieIntakePopup from '@/components/ReportFormPopup/CalorieIntake/CalorieIntakePopup'

const Page = () => {

    const color = '#ffc20e'

    const chartsParams = {
        height: 300,
    }

    const [dataS1, setDataS1] = React.useState<any>(null)

    const getDataForS1 = async () => {

        let temp = [
            {
                date: 'Tue Apr 21 2026 23:42:33 GMT+0600',
                value: 2700,
                unit: 'kcal'
            },
            {
                date: 'Wed Apr 22 2026 23:42:33 GMT+0600',
                value: 2500,
                unit: 'kcal'
            },
            {
                date: 'Thu Apr 23 2026 23:42:33 GMT+0600',
                value: 2300,
                unit: 'kcal'
            },
            {
                date: 'Fri Apr 24 2026 23:42:33 GMT+0600',
                value: 2000,
                unit: 'kcal'
            },
            {
                date: 'Sat Apr 25 2026 23:42:33 GMT+0600',
                value: 3000,
                unit: 'kcal'
            },
            {
                date: 'Sun Apr 26 2026 23:42:33 GMT+0600',
                value: 2700,
                unit: 'kcal'
            },
            {
                date: 'Mon Apr 27 2026 23:42:33 GMT+0600',
                value: 2500,
                unit: 'kcal'
            },
            {
                date: 'Tue Apr 28 2026 23:42:33 GMT+0600',
                value: 2000,
                unit: 'kcal'
            }
        ]

        let dataForLineChart = temp.map((item: any) => {
            return item.value
        })

        let dataForXAxis = temp.map((item: any) => {
            return new Date(item.date)
        })

        setDataS1({
            data: dataForLineChart,
            title: '1 Day Calorie Intake',
            color: color,
            xAxis: {
                data: dataForXAxis,
                label: 'Last 10 Days',
                scaleType: 'time'
            }
        })
    }

    React.useEffect(() => {
        getDataForS1()
    }, [])

    const [showCalorieIntakePopup, setShowCalorieIntakePopup] = React.useState<boolean>(false)

    return (
        <div className='reportpage'>
            <div className='s1'>
            {
                dataS1 &&
                <LineChart
                    xAxis={[{
                        id: 'Day',
                        data: dataS1.xAxis.data,
                        scaleType: dataS1.xAxis.scaleType,
                        label: dataS1.xAxis.label,
                        valueFormatter: (date: any) => {
                            return date.getDate().toString()
                        }
                    }]}
                    series={[
                        {
                            data: dataS1.data,
                            label: dataS1.title,
                            color: dataS1.color,
                        },
                    ]}
                    {...chartsParams}
                />
            }
            </div>
            <div className='s2'>
            {
                dataS1 &&
                <LineChart
                    xAxis={[{
                        id: 'Day',
                        data: dataS1.xAxis.data,
                        scaleType: dataS1.xAxis.scaleType,
                        label: dataS1.xAxis.label,
                        valueFormatter: (date: any) => {
                            return date.getDate().toString()
                        }
                    }]}
                    series={[
                        {
                            data: dataS1.data,
                            label: dataS1.title,
                            color: dataS1.color,
                        },
                    ]}
                    {...chartsParams}
                />
            }
            </div>
            <div className='s3'>
            {
                dataS1 &&
                <LineChart
                    xAxis={[{
                        id: 'Day',
                        data: dataS1.xAxis.data,
                        scaleType: dataS1.xAxis.scaleType,
                        label: dataS1.xAxis.label,
                        valueFormatter: (date: any) => {
                            return date.getDate().toString()
                        }
                    }]}
                    series={[
                        {
                            data: dataS1.data,
                            label: dataS1.title,
                            color: dataS1.color,
                        },
                    ]}
                    {...chartsParams}
                />
            }
            </div>
            <div className='s4'>
            {
                dataS1 &&
                <LineChart
                    xAxis={[{
                        id: 'Day',
                        data: dataS1.xAxis.data,
                        scaleType: dataS1.xAxis.scaleType,
                        label: dataS1.xAxis.label,
                        valueFormatter: (date: any) => {
                            return date.getDate().toString()
                        }
                    }]}
                    series={[
                        {
                            data: dataS1.data,
                            label: dataS1.title,
                            color: dataS1.color,
                        },
                    ]}
                    {...chartsParams}
                />
            }
            </div>
            <button
                className='editbutton'
                    onClick={() => {
                setShowCalorieIntakePopup(true)
                    }}
            >
                <AiFillEdit />
            </button>
            {
                showCalorieIntakePopup &&
                <CalorieIntakePopup
                    setShowCalorieIntakePopup={setShowCalorieIntakePopup}
                    dateData={dataS1?.xAxis?.data || []}
                />
            }    

        </div>
    )
}

export default Page