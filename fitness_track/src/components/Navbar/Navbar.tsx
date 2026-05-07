"use client"
import React from 'react'
import logo from '@/assets/fitness_logo.png'
import { IoIosBody } from 'react-icons/io'
import './Navbar.css'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

interface NavbarProps {
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
    const handleLogout = async () => {
        try {
            await fetch(`${BACKEND_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            toast.success('Logged out successfully');
        } catch {
            // logout anyway
        }
        onLogout();
    }

    return (
        <nav>
            <Image src={logo} alt="Logo" />
            <Link href='/'>Home</Link>
            <Link href='/profile'><IoIosBody /></Link>
            <button onClick={handleLogout}>Logout</button>
        </nav>
    )
}

export default Navbar
