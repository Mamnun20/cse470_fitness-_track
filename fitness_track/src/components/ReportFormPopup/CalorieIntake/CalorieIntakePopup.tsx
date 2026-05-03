import React from 'react'
import '../popup.css'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// import DatePicker from "react-horizontal-datepicker";
import { AiFillDelete, AiOutlineClose } from 'react-icons/ai'


interface CaloriIntakePopupProps {
    setShowCalorieIntakePopup: React.Dispatch<React.SetStateAction<boolean>>;
}

const CalorieIntakePopup: React.FC<CaloriIntakePopupProps> = ({ setShowCalorieIntakePopup }) => {
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
        </div>    
    </div>
)
}

export default CalorieIntakePopup