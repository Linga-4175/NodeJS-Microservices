const express = require('express');
const {registerUser, loginUser,logoutUser,refreshTokenUser} = require('../controller/identity-controller')
const router = express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout',logoutUser);
router.post('/refresh-token',refreshTokenUser)
module.exports = router;