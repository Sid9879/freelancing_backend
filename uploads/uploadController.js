const cloudinary = require('../config/cloudinary');
const User = require('../models/User');

const uploadProfilePicture = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'user_profiles',
    });

   
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: result.secure_url },
      { new: true }
    );

    res.status(200).json({
      message: 'Profile picture updated successfully',
      imageUrl: result.secure_url,
      user,
      success:true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
};

module.exports = uploadProfilePicture;
