const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Register a new user
// Method extends "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" = any,

router.post('/register', async (req, res) => {
    const { nickname, email, name, password } = req.body; // Destructure the necessary fields from req.body

    // Codes:
    // 1 Nick not unique
    // 2 Email not unique
    // 3 Nick and Email both not unique
    try {
        let stat = 0;

        // Check if there is an existing user with the same nickname
        const existingUserByNickname = await User.findOne({ nickname });
        if (existingUserByNickname) {
            stat++;
            console.log('Backend DB check Nick NOT_FREE');
        }

        // Check if there is an existing user with the same email
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            stat+=2;
            console.log('Backend DB check Email NOT_FREE');
        }
        if (stat > 0) {
            return res.status(409).json({ message: stat });
        }        

        // If no existing user is found, create a new user
        const newUser = new User({
            nickname,
            name,
            email,
            password
        });
        await newUser.save();
        console.log('Registering new user on the server:', newUser);
        User.updateOne({ nickname: nickname }, { $set: { lastAction: new Date() } });
        res.status(201).json({ message: 'OK' });

    } catch (err) {
        console.error('Error during registration:', err);
        res.status(400).json({ message: err.message });
    }
});


router.post('/checkNickUnique', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://103.13.210.25:3000"); // Set CORS 
    const { nickname } = req.body;
    console.log(nickname);
    try {        
        const user = await User.findOne({ nickname });
        
        if (null == user) {
            res.status(200).json({ message: 'OK' });
            console.log('checkNickUnique Nick Free');
        } else {            
            res.status(200).json({ message: 'NOT_FREE' });
            console.log('checkNickUnique Nick NOT_FREE');
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/checkMailUnique', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://103.13.210.25:3000"); // Set CORS 
    const { email } = req.body;
    console.log(email);
    try {        
        const user = await User.findOne({ email });
        
        if (null == user) {
            res.status(200).json({ message: 'OK' });
            console.log('checkMailUnique Mail free');
        } else {            
            res.status(200).json({ message: 'NOT_FREE' });
            console.log('checkMailUnique NOT_FREE');
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log("DB Log In")
    const { nickname, password } = req.body;
    try {
        const user = await User.findOne({ nickname });
        if (!user) {
            res.status(401).json({ message: 'Not existing user nickname' });
            console.log("DB Log In FAIL: Not existing user nickname")
        } else if (user.password !== password){
            res.status(401).json({ message: 'Invalid password' });
        } else { 
            user.loggedIn = true;
            await user.save();
            res.status(200).json(user);
            console.log("DB Log In SUCCESS")
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check if LoggedIn
router.post('/loginCheck', async (req, res) => {
    console.log("DB Log In CHECK for session")
    const { nickname } = req.body;
    try {
        const user = await User.findOne({ nickname });
        if (!user.loggedIn) {
            res.status(401);
        } else { 
            res.status(200).json(user);
            console.log("User already checked in")
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    console.log("DB Logging Out")
    const { nickname } = req.body;
    try {
        const user = await User.findOne({ nickname });
        if (!user) {
            res.status(404).json({ message: 'User not found!?' });
            console.log("DB Logged Out FAIL; User not found!?")
        } else {
            user.loggedIn = false;
            await user.save();
            res.status(200).json({ message: 'Logged out successfully' });
            console.log("DB Logged Out SUCCESS")
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;