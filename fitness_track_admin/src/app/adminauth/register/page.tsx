"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import "../auth.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

const Page = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");      
    
    const handleSignup = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/admin/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: username, email, password
                }),
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Admin Signup failed' }));
                throw new Error(errorData.message || 'Signup request failed');
            }

            const data = await res.json();
            if (data.ok) {
                console.log("Admin Signup successful", data);
                toast.success("Admin Signup successful", { position: 'top-right' });
            } else {
                console.log("Admin Signup failed", data);
                toast.error(data.message || "Admin Signup failed", { position: 'top-right' });
            }
        } catch (err) {
            console.error('Admin signup fetch failed:', err);
            toast.error('Unable to reach the backend. Please start the API server.', { position: 'top-right' });
        }
    }
    return (
        <div className ='formpage'>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
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
            <button onClick={handleSignup}>Sign Up</button>
        </div>
    )
}

export default Page