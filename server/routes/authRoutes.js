const express = require('express');
const router = express.Router();
const {
    loginUser,
    getUserProfile,
    updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', loginUser);
router.route('/me').get(protect, getUserProfile);
router.route('/update').put(protect, updateUserProfile);

module.exports = router;