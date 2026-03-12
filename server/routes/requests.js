const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verifyJWT, isAdmin } = require('../middleware/auth');

router.use(verifyJWT, isAdmin);

router.get('/', requestController.getRequests);
router.patch('/:id', requestController.updateRequest);
router.delete('/:id', requestController.deleteRequest);

module.exports = router;
