const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { verifyJWT } = require('../middleware/auth');

router.use(verifyJWT);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.post('/sync', wishlistController.syncWishlist);
router.delete('/:id', wishlistController.removeFromWishlist);

module.exports = router;
