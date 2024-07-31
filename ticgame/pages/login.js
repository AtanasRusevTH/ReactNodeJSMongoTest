// login.js
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import './login.css'

export function RegistrationForm({ onRegister }) {
    const [nickname, setNickname] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickCheckStat, setNickCheckStat] = useState(true);
    const [mailCheckStat, setMailCheckStat] = useState(true);

    const [nicknameEmpty, setNicknameError] = useState(false);
    const [nameEmpty, setNameError] = useState(false);
    const [emailEmpty, setEmailError] = useState(false);
    const [passwordEmpty, setPasswordError] = useState(false);

    const nickUpdate = (e) => {
        setNickname(e.target.value);
        if (!e.target.value) {
            setNicknameError(true);
        } else {
            setNicknameError(false);
        }
    };
    const nameUpdate = (e) => {
        setName(e.target.value);
        if (!e.target.value) {
            setNameError(true);
        } else {
            setNameError(false);
        }
    };
    const emailUpdate = (e) => {
        setEmail(e.target.value);
        if (!e.target.value) {
            setEmailError(true);
        } else {
            setEmailError(false);
        }
    };
    const passUpdate = (e) => {
        setPassword(e.target.value);
        if (!e.target.value) {
            setPasswordError(true);
        } else {
            setPasswordError(false);
        }
    };

    const isValidEmail = (email) => {
        // Basic email validation regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const checkNickFreeAsync = async () => {
        
        try {
            const response = await fetch('https://103.13.210.25:5000/api/auth/checkNickUnique', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nickname: nickname})
            });
    
            if (response.ok) {
                const responseMsg = await response.json();
                // console.log(responseMsg);
                if ('OK' == responseMsg.message){
                    console.log('checkNickFreeAsync Nickname Free: OK!');
                    setNickCheckStat(true);
                } else {
                    setNickCheckStat(false);
                    console.log('checkNickFreeAsync Nickname NOT Free, try another');
                }                
            } else {
                throw new Error(`Databse Error: ${response.json}`);
            }
        } catch (error) {
            console.error('checkNickFreeAsync Nickname check failed:', error);
            alert('checkNickFreeAsync Failed to check name in databse. Please try again.');
        }
    }
    
    const checkMailFreeAsync = async () => {
        
        try {
            const response = await fetch('https://103.13.210.25:5000/api/auth/checkMailUnique', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email})
            });
    
            if (response.ok) {
                const responseMsg = await response.json();
                // console.log(responseMsg);
                if ('OK' == responseMsg.message){
                    console.log('Email Free, OK!');
                    setMailCheckStat(true);
                } else {
                    setMailCheckStat(false);
                    console.log('Email NOT Free, try another');
                }                
            } else {
                throw new Error(`Databse Error: ${response.json}`);
            }
        } catch (error) {
            console.error('Email check failed:', error);
            alert('Failed to check email in databse. Please try again.');
        }
    }

    const handleFinishClickAsync = async () => {
        /*
            Checks I need to add:
            Valid Email, existing user Nickname or password, all fields filled correctly, for each error the field shall be marked red, a message shall be printed!
        */
        if (!nickname || !name || !email || !password) {
            alert('Please fill in all fields.');
            return;
        }
    
        // Validate email format
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Prepare user data for registration
        const userData = { nickname, name, email, password };
        console.log('Registering user DB requsted via http with:', userData);

        try {
            const response = await fetch('https://103.13.210.25:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
    
            const responseMsg = await response.json(); // Parse JSON body of the response
    
            if (response.ok) {
                console.log('DB Response upon registration request: ', responseMsg);
                alert('Registration successful!');                
                // Clear form fields after successful registration
                setNickname('');
                setName('');
                setEmail('');
                setPassword('');
                onRegister(userData);
            } else {
                // Handle specific error based on the backend response
                let errorMessage = 'Registration failed: ';
                if(responseMsg.message === 1) {
                    errorMessage += 'Nickname is already in use.';
                    setMailCheckStat(true);
                    setNickCheckStat(false);
                } else if(responseMsg.message === 2) {
                    errorMessage += 'Email is already in use.';
                    setMailCheckStat(false);
                    setNickCheckStat(true);
                } else if(responseMsg.message === 3) {
                    errorMessage += 'Both nickname and email are already in use.';
                    setNickCheckStat(false);
                    setMailCheckStat(false);
                } else {
                    errorMessage += 'Unexpected error.';
                }
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Registration attempt request failed:', error);
            alert('Failed to connect to the registration service. Please try again later.');
            return;
        }
    };

    return (
        <div>
            <h2>Registration</h2>
            <p>Requires unique Nickname and email</p>
            <form>
                <TextField
                    label="Nickname"
                    variant="outlined"                    
                    margin="normal"
                    value={nickname}
                    onChange={nickUpdate}
                    error={nicknameEmpty}
                    helperText={nicknameEmpty ? 'Nickname is required' : ''}
                />
                <Button
                    variant="contained"                    
                    color='primary'
                    onClick={checkNickFreeAsync}                    
                >
                    Check Nick is free
                </Button>
                <Alert severity={nickCheckStat === true? "success" : "error"}>{nickCheckStat === true? 'Nickname Free' : 'Nickname NOT Free, try another'}</Alert>
                <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={nameUpdate}
                    error={nameEmpty}
                    helperText={nameEmpty ? 'Name is required' : ''}
                />
                <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={emailUpdate}
                    error={emailEmpty}
                    helperText={emailEmpty ? 'Email is required' : ''}
                />
                <Alert severity={mailCheckStat === true? "success" : "error"}>{mailCheckStat === true? 'Email Free' : 'Email NOT Free, try another'}</Alert>
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={passUpdate}
                    error={passwordEmpty}
                    helperText={passwordEmpty ? 'Password is required' : ''}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleFinishClickAsync}
                >
                    Finish
                </Button>
            </form>
        </div>
    );
}

function LoginAndReg({ onLogin }) {
    // state variables
    const [loggedIn, setLoggedIn] = useState(false);
    const [nicknameFilled, setNickname] = useState('');
    const [passwordFilled, setPassword] = useState('');    
    
    // State to control pop-up visibility
    const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);

  // arrow functions (optional parenthes, body can be a single expression with implicit return)  
    useEffect(() => {
        // Add event listener when component mounts
        document.addEventListener('keydown', handleKeyDown);

        // Clean up event listener when component unmounts
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleKeyDown = (event) => {
        // Handle Escape key (Esc) press
        if (event.key === 'Escape') {
            handleClosePopup();
        }
    };

    // arrow functions (optional parenthes, body can be a single expression with implicit return)
    const handleLoginAsync = async (nickname, password) => {        
        // Prepare user data for registration
        const userLoginData = { nickname, password};
        
        console.log('Attempt User LogIn:', userLoginData);

        try {
            const response = await fetch('https://103.13.210.25:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userLoginData)
            });
            const responseMsg = await response.json(); // Parse JSON body of the response
    
            if (response.ok) {
                console.log('DB Status Login SUCCESS: ', responseMsg);
                console.log('Loggin in: ', userLoginData.nickname);                
                setLoggedIn(true);  
                onLogin(userLoginData.nickname);
            } else {                                
                // Use the message from the server's response for the error alert
                console.error('Login failed:', responseMsg.message);
                alert(responseMsg.message || 'Login failed, please try again.');
            }
        } catch (errorMessage) {
            console.error('Login attempt request failed:', error);
            alert('Failed to Log In. Please try again later.');
        }    
    };

    const handleLogout = () => {
        setLoggedIn(false);
    };

    const handleRegister = () => {
        setShowRegistrationPopup(true); // Show the registration pop-up
    };

    const handleClosePopup = () => {
        setShowRegistrationPopup(false); // Close the registration pop-up
    };

    const LogInAfterRegistration = (userData) => {        
        console.log('LogIn After Registration: user:', userData);        
        handleLoginAsync(userData.nickname, userData.password);
        handleClosePopup();
    };    
    
    return (
        // JSXml
        <div>
            {loggedIn ?
                null : (
                <div>
                    <TextField className= "loginField" type="text" placeholder="Nickname" value={nicknameFilled} onChange={(e) => setNickname(e.target.value)} />
                    <TextField type="password" placeholder="Password" value={passwordFilled} onChange={(e) => setPassword(e.target.value)} />
                    <Button variant="outlined" onClick={()=> handleLoginAsync(nicknameFilled, passwordFilled)}>Log In</Button>                    
                    <Button variant="outlined" onClick={handleRegister}>Register</Button>                    
                </div>
            )}
            
             {showRegistrationPopup && (
                <div className="registration-popup">
                    <div className="registration-popup-content">
                        <span className="close-button" onClick={handleClosePopup}>X</span>
                        <RegistrationForm onRegister={LogInAfterRegistration} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginAndReg;
