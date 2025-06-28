const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Country, State } = require('country-state-city');
let randomstring = require("randomstring");
const nodemailer = require("nodemailer");


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

        if (password && password.trim() !== '') {
            updatePayload.password = await bcrypt.hash(password, 10);
        }

        if (Array.isArray(skills) && skills.length > 0) {
            const filteredSkills = skills.filter(skill => skill.trim() !== '');
            if (filteredSkills.length > 0) {
                updatePayload.skills = filteredSkills;
            }
        }

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

    const existingRatingIndex = freelancer.rating.findIndex(
      (r) => r.user?.toString() === userId.toString()
    );

    if (existingRatingIndex !== -1) {
      freelancer.rating[existingRatingIndex].value = value;
      freelancer.rating[existingRatingIndex].createdAt = new Date();
    } else {
      freelancer.rating.push({
        value: Number(value),
        user: userId,
        createdAt: new Date(),
      });
    }

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

const resetPassword = async(req,res)=>{
  const {email} = req.body;
  try {
    let user = await User.findOne({email});
    if(user){
      let reset_token = randomstring.generate(20);
      let date = Date.now();
      user.resetToken = reset_token;
      user.resetTokenValidity = date;
      await user.save();
      let msgSent = await sendMail(email,reset_token);
      res.status(200).json({message:"Please check your email",success:true})
    }
    else{
      return res.status(404).json({message:"User not found"})
    }
  } catch (error) {
    res.status(500).json({message:"Server error",error:error.message});
  }
}

async function sendMail(email,reset_token) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "quickhirehub143@gmail.com",
          pass: "nxhb qezr uboy ftwz",
        },
    })
    const info = await transporter.sendMail({
      from: 'quickhirehub143@gmail.com',
        to: email, 
        subject: "Request of Password reset",
        text:`Please click the link below to choose a new password: \n \n http://localhost:8090/api/users/forgetPassword/${reset_token} \n  \n \n Regards \n QuickHireHub`
      });
}

const forgetPassword = async(req,res)=>{
  try {
    const resetToken = req.params.resetToken;
    let user = await User.findOne({resetToken});
    if(user){
      const tokenData = user.resetTokenValidity;
      const currentDate = Date.now();
      const timeDifference = currentDate-tokenData;
      const timeInHours = timeDifference/(60*1000);
      if(timeInHours){
       return res.render('forgetPassword', {resetToken});
;
      }
      return res.render('tokenExpired');
    }
    return res.render('tokenExpired');
  } catch (error) {
    res.status(500).json({message:"Server error",error:error.message})
  }
}

const updatePassword = async(req,res)=>{
     let resetToken = req.params.resetToken;
     let password = req.body.updatePassword;
 
     try {
      let user = await User.findOne({resetToken});
      if(user){
        let hashedPassword =await bcrypt.hash(password,8);
        user.password = hashedPassword
        user.resetToken = null
        await user.save();
        res.status(200).json({message:"Password updated successfully"});
      }
      else{
        res.status(401).json({message:"Token expired"});
      }
     } catch (error) {
      res.status(500).json({message:"Server error",error:error.message})
     }
}


const addProject = async (req, res) => {
    try {
        const userId = req.user._id; 
        const { title, description, projectLink, completedDate, technologiesUsed } = req.body;

        if (!title || !projectLink) {
            return res.status(400).json({ message: 'Project title and link are required.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.role !== 'freelancer') {
            return res.status(403).json({ message: 'Only freelancers can add projects.' });
        }

        const newProject = {
            title,
            description,
            projectLink,
            completedDate,
            technologiesUsed 
        };

        user.projects.push(newProject);
        await user.save();

        res.status(201).json({
            message: 'Project added successfully!',
            success: true,
            project: user.projects[user.projects.length - 1] 
        });

    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ message: 'Server error while adding project', error: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const userId = req.user._id;
        const { projectId } = req.params; 
        const { title, description, projectLink, completedDate, technologiesUsed } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const project = user.projects.id(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Update fields
        project.title = title || project.title;
        project.description = description !== undefined ? description : project.description;
        project.projectLink = projectLink || project.projectLink;
        project.screenshot = screenshot !== undefined ? screenshot : project.screenshot;
        project.completedDate = completedDate !== undefined ? completedDate : project.completedDate;
        project.technologiesUsed = technologiesUsed !== undefined ? technologiesUsed : project.technologiesUsed;

        await user.save(); 

        res.status(200).json({
            message: 'Project updated successfully!',
            success: true,
            project
        });

    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Server error while updating project', error: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const userId = req.user._id;
        const { projectId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.projects.pull({ _id: projectId });
        await user.save();

        res.status(200).json({
            message: 'Project deleted successfully!',
            success: true
        });

    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Server error while deleting project', error: error.message });
    }
};



module.exports ={
    updateUserProfile,
    addRating,
  getViewProfile,
  resetPassword,
  forgetPassword,
  updatePassword,
  addProject,
    updateProject,
    deleteProject
}
;
