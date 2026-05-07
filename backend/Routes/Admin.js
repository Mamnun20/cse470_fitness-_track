const express = require('express');
const router = express.Router();
const Admin = require('../Models/AdminSchema');
const User = require('../Models/UserSchema');
const bcrypt = require('bcrypt');
const errorHandler = require('../Middlewares/errorMiddleware');
const adminTokenHandler = require('../Middlewares/checkAdminToken');

const jwt = require('jsonwebtoken');

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if the admin with the same email already exists
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(409).json(createResponse(false, 'Admin with this email already exists'));
        }

        // Hash the admin's password before saving it to the database


        const newAdmin = new Admin({
            name,
            email,
            password
        });

        await newAdmin.save(); // Await the save operation

        res.status(201).json(createResponse(true, 'Admin registered successfully'));
    } catch (err) {
        // Pass the error to the error middleware
        next(err);
    }
});


router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json(createResponse(false, 'Invalid admin credentials'));
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json(createResponse(false, 'Invalid admin credentials'));
        }

        // Generate an authentication token for the admin
        const adminAuthToken = jwt.sign({ adminId: admin._id }, process.env.JWT_ADMIN_SECRET_KEY, { expiresIn: '10m' });

        res.cookie('adminAuthToken', adminAuthToken, { httpOnly: true });
        res.status(200).json(createResponse(true, 'Admin login successful', { adminAuthToken }));
    } catch (err) {
        next(err);
    }
});



router.get('/checklogin', adminTokenHandler, async (req, res) => {
    res.json({
        adminId: req.adminId,
        ok: true,
        message: 'Admin authenticated successfully'
    })
})

router.get('/getusers', adminTokenHandler, async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.json(createResponse(true, 'All users', users));
    } catch (err) { next(err); }
})

router.post('/approveuser', adminTokenHandler, async (req, res, next) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json(createResponse(false, 'User not found'));
        user.approved = true;
        await user.save();
        res.json(createResponse(true, 'User approved'));
    } catch (err) { next(err); }
})

router.post('/rejectuser', adminTokenHandler, async (req, res, next) => {
    try {
        const { userId } = req.body;
        const user = await User.findByIdAndDelete(userId);
        if (!user) return res.status(404).json(createResponse(false, 'User not found'));
        res.json(createResponse(true, 'User rejected and removed'));
    } catch (err) { next(err); }
})

router.get('/getrequests', adminTokenHandler, async (req, res, next) => {
    try {
        const users = await User.find({ 'workoutPlanRequests.0': { $exists: true } })
            .select('name email workoutPlanRequests');
        const requests = [];
        users.forEach(user => {
            user.workoutPlanRequests.forEach(req => {
                requests.push({
                    _id: req._id,
                    userId: user._id,
                    userName: user.name,
                    userEmail: user.email,
                    message: req.message,
                    status: req.status,
                    adminResponse: req.adminResponse,
                    createdAt: req.createdAt,
                });
            });
        });
        res.json(createResponse(true, 'All workout requests', requests));
    } catch (err) { next(err); }
})

router.post('/respondrequest', adminTokenHandler, async (req, res, next) => {
    try {
        const { userId, requestId, status, adminResponse } = req.body;
        if (!userId || !requestId || !status) {
            return res.status(400).json(createResponse(false, 'Missing required fields'));
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json(createResponse(false, 'User not found'));
        const request = user.workoutPlanRequests.id(requestId);
        if (!request) return res.status(404).json(createResponse(false, 'Request not found'));
        request.status = status;
        if (adminResponse) request.adminResponse = adminResponse;
        await user.save();
        res.json(createResponse(true, 'Request updated'));
    } catch (err) { next(err); }
})

router.use(errorHandler)

module.exports = router;