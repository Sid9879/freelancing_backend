const express = require('express');
const router = express.Router();
const  {authMiddleware}  = require('../middlewares/authMiddleware');
const  {updateUserProfile, addRating, getViewProfile}  = require('../controllers/userControllers');
const uploadProfilePicture = require('../uploads/uploadController');
const upload = require('../middlewares/multer');


router.put('/upload-profile', upload.single('profilePicture'),authMiddleware, uploadProfilePicture);
router.put('/updateProfile/:id',authMiddleware,updateUserProfile)
router.put('/rating/:freelancerId',authMiddleware,addRating)
router.get('/:id',authMiddleware,getViewProfile);


module.exports = router;