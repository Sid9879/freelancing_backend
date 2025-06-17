const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Country, State } = require('country-state-city');


const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const loginId = req.user._id;

        if (userId !== loginId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { password, address, skills } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatePayload = {};

        // Handle password
        if (password && password.trim() !== '') {
            updatePayload.password = await bcrypt.hash(password, 10);
        }

        // Handle skills
        if (Array.isArray(skills) && skills.length > 0) {
            const filteredSkills = skills.filter(skill => skill.trim() !== '');
            if (filteredSkills.length > 0) {
                updatePayload.skills = filteredSkills;
            }
        }

        // Handle address
        if (address && (address.city || address.pincode || address.countryCode || address.stateCode)) {
            const countryInfo = Country.getCountryByCode(address.countryCode || '');
            const stateInfo = State.getStateByCodeAndCountry(address.stateCode || '', address.countryCode || '');

            updatePayload.address = {
                city: address.city || null,
                pincode: address.pincode || null,
                countryCode: address.countryCode || null,
                countryName: countryInfo?.name || null,
                stateCode: address.stateCode || null,
                stateName: stateInfo?.name || null,
            };
        }

        // If no data to update
        if (Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ message: 'No changes submitted' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatePayload },
            { new: true }
        ).select('-password')

        res.status(200).json({
            message: 'User profile updated successfully',
            success: true,
            updatedUser
        });

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



const addRating = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { value } = req.body;
    const userId = req.user._id;

    const freelancer = await User.findById(freelancerId);

    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

   
    if (!Array.isArray(freelancer.rating)) {
      freelancer.rating = [];
    }

    // Check if this user already rated
    const existingRatingIndex = freelancer.rating.findIndex(
      (r) => r.user?.toString() === userId.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update existing
      freelancer.rating[existingRatingIndex].value = value;
      freelancer.rating[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new
      freelancer.rating.push({
        value: Number(value),
        user: userId,
        createdAt: new Date(),
      });
    }

    // Filter valid ratings only
    const validRatings = freelancer.rating.filter(
      (r) => typeof r.value === "number" && !isNaN(r.value)
    );

    const total = validRatings.reduce((acc, r) => acc + r.value, 0);
    const avg = validRatings.length > 0 ? total / validRatings.length : 0;

    freelancer.avgRating = Number(avg.toFixed(2)); 
    await freelancer.save();

    res.status(200).json({
      message: "Rating submitted successfully",
      avgRating: freelancer.avgRating, success:true
    });
  } catch (error) {
    console.error("Rating Error:", error);
    res.status(500).json({
      message: "Server error while adding rating",
      error: error.message,
    });
  }
};
 
const getViewProfile = async(req,res)=>{
    const id = req.params.id;
   try{
       const freelancer = await User.findById(id).select(['-password','-phone']).populate({path:"appliedJobs"});
    if(!freelancer){
      return res.status(404).json({message: "Freelancer not found"});
    }
    res.status(200).json({message:"Account fetched",freelancer});
   }catch(error){
        res.status(500).json({message:"Internal server error",error:error.message})
   }

}



module.exports ={
    updateUserProfile,
    addRating,
  getViewProfile
}
;
