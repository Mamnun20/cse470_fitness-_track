const express = require('express');
const router = express.Router();
const User = require('../Models/UserSchema')
const errorHandler = require('../Middlewares/errorMiddleware');
const authTokenHandler = require('../Middlewares/checkAuthToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

//uwgb chne hfew wdzj
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'arazkhanbd2003@gmail.com',
        pass: 'uwgbchnehfewwdzj'
    }
})

router.get('/test', async (req, res) => {
    res.json({
        message: "Auth api is working"
    })
})

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.post('/register', async (req, res, next) => {
    console.log(req.body);
    try {
        const { name, email, password, weightInKg, heightInCm, gender, dob, goal, activityLevel } = req.body;
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(409).json(createResponse(false, 'Email already exists'));
        }
        const newUser = new User({
            name,
            password,
            email,
            weight: [
                {
                    weight: weightInKg,
                    unit: "kg",
                    date: Date.now()
                }
            ],
            height: [
                {
                    height: heightInCm,
                    date: Date.now(),
                    unit: "cm"
                }
            ],
            gender,
            dob,
            goal,
            activityLevel
        });
        await newUser.save(); // Await the save operation

        res.status(201).json(createResponse(true, 'User registered successfully'));

    }
    catch (err) {
        next(err);
    }
})
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }
        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '50m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '100m' });

        res.cookie('authToken', authToken, { httpOnly: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.status(200).json(createResponse(true, 'Login successful', {
            authToken,
            refreshToken
        }));
    }
    catch (err) {
        next(err);
    }
})
router.post('/sendotp', async (req, res) => {
    try {
        const { email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);

        const mailOptions = {
            from: 'arazkhanbd2003@gmail.com',
            to: email,
            subject: 'OTP for verification',
            text: `Your OTP is ${otp}`
        }

        transporter.sendMail(mailOptions, async (err, info) => {
            if (err) {
                console.log(err);
                res.status(500).json(createResponse(false, err.message));
            } else {
                res.json(createResponse(true, 'OTP sent successfully', { otp }));
            }
        });
    }
    catch (err) {
        next(err);
    }
})
router.post('/checklogin', authTokenHandler, async (req, res, next) => {
    res.json({
        ok: true,
        message: 'User authenticated successfully'
    })
})
router.get('/getprofile', authTokenHandler, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }
        res.json(createResponse(true, 'User profile', {
            name: user.name,
            email: user.email,
            gender: user.gender,
            dob: user.dob,
            goal: user.goal,
            activityLevel: user.activityLevel,
            profileImage: user.profileImage || '',
            weight: user.weight.length > 0 ? user.weight[user.weight.length - 1].weight : 0,
            height: user.height.length > 0 ? user.height[user.height.length - 1].height : 0,
            createdAt: user.createdAt,
        }));
    } catch (err) {
        next(err);
    }
})
router.post('/updateprofile', authTokenHandler, async (req, res, next) => {
    try {
        const { name, profileImage } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }
        if (name) user.name = name;
        if (profileImage !== undefined) user.profileImage = profileImage;
        await user.save();
        res.json(createResponse(true, 'Profile updated successfully'));
    } catch (err) {
        next(err);
    }
})
router.post('/requestworkoutplan', authTokenHandler, async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json(createResponse(false, 'Please provide a message'));
        const user = await User.findById(req.userId);
        user.workoutPlanRequests.push({ message });
        await user.save();
        res.json(createResponse(true, 'Workout plan request submitted'));
    } catch (err) { next(err); }
})
router.get('/myrequests', authTokenHandler, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.json(createResponse(true, 'Requests', user.workoutPlanRequests));
    } catch (err) { next(err); }
})
router.post('/forgotpassword', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json(createResponse(false, 'Please provide email'));
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json(createResponse(false, 'No account with that email'));
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const mailOptions = {
            from: 'arazkhanbd2003@gmail.com',
            to: email,
            subject: 'FitnessFreak - Password Reset OTP',
            text: `Your password reset OTP is: ${otp}\n\nThis code expires in 10 minutes.`
        };
        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                return res.status(500).json(createResponse(false, 'Failed to send email'));
            }
            res.json(createResponse(true, 'OTP sent to your email', { otp }));
        });
    } catch (err) {
        res.status(500).json(createResponse(false, err.message));
    }
})
router.post('/resetpassword', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).json(createResponse(false, 'Provide email and new password'));
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json(createResponse(false, 'User not found'));
        user.password = newPassword;
        await user.save();
        res.json(createResponse(true, 'Password reset successfully'));
    } catch (err) {
        res.status(500).json(createResponse(false, err.message));
    }
})
router.get('/getroutine', authTokenHandler, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.json(createResponse(true, 'Routine', user.weeklyRoutine || {}));
    } catch (err) { next(err); }
})
router.post('/saveroutine', authTokenHandler, async (req, res, next) => {
    try {
        const { routine } = req.body;
        const user = await User.findById(req.userId);
        user.weeklyRoutine = routine;
        await user.save();
        res.json(createResponse(true, 'Routine saved'));
    } catch (err) { next(err); }
})
router.post('/logout', async (req, res) => {
    res.clearCookie('authToken', { httpOnly: true });
    res.clearCookie('refreshToken', { httpOnly: true });
    res.json({ ok: true, message: 'Logged out successfully' });
})
router.use(errorHandler)

module.exports = router;