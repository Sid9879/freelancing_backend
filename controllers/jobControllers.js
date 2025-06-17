const Job = require('../models/Job');
const User = require('../models/User');
 const { validationResult } = require('express-validator');


const createJob = async(req,res)=>{
  const clientId = req.user._id;
    try {
         const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), success: false });
          }
        const { title, city, budget, deadline, description, skillsRequired } = req.body;
        const job = new Job({
            title,
            client:req.user._id,
            city,
            budget,
            deadline,
            description,
            skillsRequired
        });
       await User.findByIdAndUpdate(clientId, {
            $addToSet: { postedJobs: job._id }
        });
        await job.save();
        res.status(201).json({ message: 'Job posted successfully!', job });
    } catch (error) {
        res.status(500).json({ message: 'Error creating job', error:error.message });
    }
}


  const applyToJob = async (req, res) => {
  const { jobId } = req.params;
  const freelancerId = req.user._id;

  try {
    const validateUser = await User.findById(freelancerId);
    if (!validateUser || validateUser.role !== 'freelancer') {    
      return res.status(403).json({ message: 'Only freelancers can apply to jobs' });
    }
    const job = await Job.findById(jobId);
     if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const alreadyApplied = job.applicants.some(app => app.freelancer.toString() === freelancerId.toString());

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied' });
    }

    job.applicants.push({ freelancer: freelancerId });
    await job.save();

     await User.findByIdAndUpdate(freelancerId, {
      $addToSet: { appliedJobs: jobId }
    });

    res.status(200).json({ message: 'Applied successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' ,error: error.message });
  }
};

 const updateApplicationStatus = async (req, res) => {
  const { jobId, freelancerId } = req.params;
  const { status } = req.body;

  try {
     const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), success: false });
          }
     const validateUser = await User.findById(req.user._id);
    if (!validateUser || validateUser.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const job = await Job.findById(jobId);
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own this job' });
    }
    const applicant = job.applicants.find(app => app.freelancer.toString() === freelancerId);

    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    applicant.status = status;
    await job.save();

    res.status(200).json({ message: `Application ${status}`,success:true });
  } catch (error) {
    res.status(500).json({ message: 'Server error',error: error.message });
  }
};

const undoApplyToJob = async (req, res) => {
  const { jobId } = req.params;
  const freelancerId = req.user._id;

  try {
    const job = await Job.findById(jobId);
    const user = await User.findById(freelancerId)
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const applied = job.applicants.some(app=>app.freelancer.toString()=== freelancerId.toString())
    if(!applied) {
      return res.status(400).json({ message: 'You have not applied to this job' });
    }
    user.appliedJobs = user.appliedJobs.filter(
      jobId => jobId.toString() !== job._id.toString()
    );
    job.applicants = job.applicants.filter(
      app => app.freelancer.toString() !== freelancerId.toString()
    );

    await user.save();
    await job.save();

    res.status(200).json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error',error:error.message });
  }
};

const getJobs = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const jobs = await Job.find()
      .populate('client', 'name email')
      .populate({
         path: 'applicants.freelancer',
         select: '_id,name email'
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalJobs = await Job.countDocuments();

    res.status(200).json({
      jobs,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: page
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};


const getAppliedJobs = async (req, res) => {
  const userId = req.user._id;

  try {
    
    const user = await User.findById(userId).populate({
      path: 'appliedJobs',
      populate: {
        path: 'client', 
        select: 'name email',
      }
    }).sort({ createdAt: -1 });

    if (!user) return res.status(404).json({ message: "User not found" });

    const jobsWithUserApplication = user.appliedJobs.map((job) => {
      const myApp = job.applicants.find(
        (app) => app.freelancer.toString() === userId.toString()
      );

      return {
        _id: job._id,
        title: job.title,
        city: job.city,
        budget: job.budget,
        description: job.description,
        deadline: job.deadline,
        skillsRequired: job.skillsRequired,
        client: job.client,
        appliedAt: myApp?.appliedAt,
        status: myApp?.status,
      };
    });

    res.status(200).json({ appliedJobs: jobsWithUserApplication });

  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPostedJobs = async(req,res)=>{
  const clientId = req.user._id;
  try {
    const findCleint = await User.findById(clientId);
    if (!findCleint || findCleint.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const posted = await User.findById(clientId).select('postedJobs').populate({
      path: 'postedJobs',
      populate:{
        path: 'applicants.freelancer',
        select: '_id name email'
      }
    }).sort({createdAt:-1});
    res.status(200).json(posted.postedJobs);
  } catch (error) {
    console.error("Error fetching posted jobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

const removePostedJob = async (req, res) => {
  const jobId = req.params.jobId;
  const clientId = req.user._id;

  console.log("Job ID:", jobId);
  console.log("Client ID:", clientId);

  try {
    const userfind = await User.findById(clientId);
    if (!userfind || userfind.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const postedJob = await Job.findById(jobId);

    if (!postedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (postedJob.client.toString() !== clientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized User' });
    }
    await User.findByIdAndUpdate(clientId, { $pull: { postedJobs: jobId } });

    await Job.findByIdAndDelete(jobId);

   
    const freelancers = await User.find({ appliedJobs: jobId });
    freelancers.forEach(freelancer => {
      freelancer.appliedJobs = freelancer.appliedJobs.filter(
        id => id.toString() !== jobId.toString()
      );
    });

    await User.bulkWrite(
      freelancers.map(freelancer => ({
        updateOne: {
          filter: { _id: freelancer._id },
          update: { $set: { appliedJobs: freelancer.appliedJobs } }
        }
      }))
    );

    res.status(200).json({ message: 'Job removed successfully', success: true });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const filterJobs = async(req,res)=>{
  try {
    const { title, skills, page = 1, limit = 5 } = req.query;
    const filter = {};

    if (typeof title === 'string' && title.trim() !== '') {
      filter.title = { $regex: title, $options: 'i' };
    }

    if (typeof skills === 'string' && skills.trim() !== '') {
      const skillTerms = skills.split(',').map(skill => skill.trim());

      const skillRegexArray = skillTerms.map(term => new RegExp(term, 'i'));
      filter.skillsRequired = { $in: skillRegexArray };
    }

    const totalJobs = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      jobs,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

module.exports = {
  createJob,
  applyToJob,
  updateApplicationStatus,
  undoApplyToJob,
  getJobs,
  getAppliedJobs,
  getPostedJobs,
  removePostedJob,
  filterJobs
}
