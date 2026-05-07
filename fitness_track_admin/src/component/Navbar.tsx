"use client";

import React, { useState } from "react";
import Link from "next/link";
import './Navbar.css';

const Navbar = () => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    return (
        <div className='navbar'>
            <h2 className='navbar-title'>Fitness Admin</h2>
            <div className='adminlinks'>
                {isAdminAuthenticated ? (
                    <>
                    
                        <Link href="/pages/addworkout">Dashboard</Link>
                    </>   
                ) : (      
                    <>
                        {/* Show login/signup links for unauthenticated admin */}
                        <Link href="/adminauth/login">Login</Link>
                        <Link href="/adminauth/register">Signup</Link>
                    </>                    
                    )}
            </div>      
        </div>

    )
}

export default Navbar