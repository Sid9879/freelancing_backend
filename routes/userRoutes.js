const express = require('express');
const router = express.Router();
const  {authMiddleware, roleCheck}  = require('../middlewares/authMiddleware');
const  {updateUserProfile, addRating, getViewProfile, resetPassword, forgetPassword, updatePassword, addProject, updateProject, deleteProject}  = require('../controllers/userControllers');
const uploadProfilePicture = require('../uploads/uploadController');
const upload = require('../middlewares/multer');


router.put('/upload-profile', upload.single('profilePicture'),authMiddleware, uploadProfilePicture);
router.put('/updateProfile/:id',authMiddleware,updateUserProfile)
router.put('/rating/:freelancerId',authMiddleware,addRating)
router.get('/:id',authMiddleware,getViewProfile);
router.post('/resetPassword',resetPassword);
router.get('/forgetPassword/:resetToken',forgetPassword);
router.post('/forgetPassword/:resetToken',updatePassword);


router.post('/projects', authMiddleware,roleCheck('freelancer'), addProject); 
router.put('/projects/:projectId', authMiddleware,roleCheck('freelancer'), updateProject);
router.delete('/projects/:projectId', authMiddleware,roleCheck('freelancer'), deleteProject); 

module.exports = router;