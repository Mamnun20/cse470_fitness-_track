"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import "../auth.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

const Page = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");      
    
    const handleLogin = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,password
                }),
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Admin Login failed' }));
                throw new Error(errorData.message || 'Login request failed');
            }

            const data = await res.json();
            if (data.ok) {
                console.log("Admin Login successful", data);
                toast.success("Admin Login successful", { position: 'top-right' });
            } else {
                console.log("Admin Login failed", data);
                toast.error(data.message || "Admin Login failed", { position: 'top-right' });
            }
        } catch (err) {
            console.error('Admin login fetch failed:', err);
            toast.error('Unable to reach the backend. Please start the API server.', { position: 'top-right' });
        }
    }
    return (
        <div className ='formpage'>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Log In</button>
        </div>
    )
}

export default Page