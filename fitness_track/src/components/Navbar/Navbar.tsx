'use client'
import React from "react"
import fitness_logo from "@/assets/fitness_logo.png"
import logo1 from "@/assets/logo1.png"
import {IoIosBody} from 'react-icons/io'
import './Navbar.css'
import Image from 'next/image'
import Link from 'next/link'    
import AuthPopup from "../AuthPopup/AuthPopup"

const Navbar = () => {
  const [isloggedin, setIsloggedin] = React.useState<boolean>(false)

  const [showpopup, setShowpopup] = React.useState<boolean>(false)

  return (
    <nav>
      <Image src={logo1} alt="Logo" width={360} height={360} />
      <Link href='/'>Home</Link>
      <Link href='/about'>About</Link>
      <Link href='/profile'><IoIosBody /></Link>
      {
        isloggedin ? 
        <button>LogOut</button> 
        : 
        <button
          onClick={() => {
          setShowpopup(true)
        }}
        >LogIn</button>
      }

      {
        showpopup && <AuthPopup setShowpopup={setShowpopup} />
      }
    </nav>
  )
}

export default Navbar