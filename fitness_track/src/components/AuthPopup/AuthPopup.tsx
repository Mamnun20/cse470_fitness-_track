import React from 'react'
import './AuthPopup.css'
import Image from 'next/image'
import logo1 from "@/assets/logo1.png"
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { AiFillDelete, AiOutlineClose } from 'react-icons/ai'

interface AuthPopupProps {
    setShowpopup: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthPopup: React.FC<AuthPopupProps> = ({ setShowpopup }) => {

    const [showSignup, setShowSignup] = React.useState<boolean>(false)

    const handleLogin = () => {}
    const handleSignup = () => {}

    return (
      <div className='popup'>
            <button
                className='close'
                onClick={() => {
                    setShowpopup(false)
                }}
            >
                <AiOutlineClose />
            </button>
        {
            showSignup ? (
                <div className='authform'>
                    <div className='left'>
                        <Image src={logo1} alt="Logo" />
                    </div>

                    <div className='right'>
                        <h1>SignUp koro</h1>

                        <form action="">
                            <Input
                                color="warning"
                                placeholder="email dao"
                                size="lg"
                                variant="solid"
                            />

                            <Input
                                color="warning"
                                placeholder="password dao"
                                size="lg"
                                variant="solid"
                                type='password'
                            />

                            <div className='form_input_leftright'>
                                <Input color="warning" size="lg" variant="solid" type="number" placeholder='Age dao' />
                                <Input color="warning" size="lg" variant="solid" type="number" placeholder='Weight dao' />
                            </div>

                            <Select
                                color="warning"
                                placeholder="Gender bolo"
                                size="lg"
                                variant="solid"
                            >
                                <Option value="male">Male</Option>
                                <Option value="female">Female</Option>
                                <Option value="other">Other</Option>                              
                            </Select>
<br/>
                            <label htmlFor="">Height</label>
                            <div className='form_input_leftright'>
                                {/* 5ft 11inch */}
                                    <Input color="warning" size="lg" variant="solid" type="number" placeholder="ft" />
                                    <Input color="warning" size="lg" variant="solid" type="number" placeholder="in" />
                                </div>

                            <button
                                onClick={() => {
                                    handleSignup()
                                }}
                            >SignUp</button>
                        </form>
                        <p>Account ase already? <button onClick={() => {
                            setShowSignup(false)
                        }}>LogIn</button></p>
                    </div>
                </div>
            ) : (
                <div className='authform'>
                    <div className='left'>
                        <Image src={logo1} alt="Logo" />
                    </div>

                    <div className='right'>
                        <h1>Login koro</h1>

                        <form action="">
                            <Input
                                color="warning"
                                placeholder="email dao"
                                size="lg"
                                variant="solid"
                            />

                            <Input
                                color="warning"
                                placeholder="password dao"
                                size="lg"
                                variant="solid"
                                type='password'
                            />

                            <button
                                onClick={() => {
                                    handleLogin()
                                }}
                            >Login</button>
                        </form>
                        <p>Account nai? <button onClick={() => {
                            setShowSignup(true)
                        }}>Signup</button></p>
                    </div>
                </div>
            )
        }
      </div>
)

}

export default AuthPopup