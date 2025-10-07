const express = require('express');
const {searchPostController} = require('../controller/search-controller')
const {authenticateRequest} = require('../middleware/authMiddleware')

const router = express();

router.use(authenticateRequest)

router.get('/search-post',searchPostController)

module.exports = router;