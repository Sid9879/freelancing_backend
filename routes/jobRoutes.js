const express = require("express");
const router = express.Router();
const {
  createJob,
  applyToJob,
  updateApplicationStatus,
  undoApplyToJob,
  getJobs,
  getAppliedJobs,
  getPostedJobs,
  removePostedJob,
  filterJobs,
} = require("../controllers/jobControllers");
const { authMiddleware, roleCheck } = require("../middlewares/authMiddleware");
const { body } = require("express-validator");

router.post(
  "/create",
  [
    body("title").notEmpty().withMessage("Job title is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("budget").notEmpty().withMessage("Budget is required"),
    body("deadline").notEmpty().withMessage("Deadline is required"),
    body("description").notEmpty().withMessage("Job description is required"),
    body("skillsRequired").notEmpty().withMessage("Skills are required"),
  ],
  authMiddleware,
  roleCheck("client"),
  createJob
);
router.post(
  "/apply/:jobId",
  authMiddleware,
  roleCheck("freelancer"),
  applyToJob
);
router.patch(
  "/update_application/:jobId/:freelancerId",
  [body("status").notEmpty().withMessage("Status is required")],
  authMiddleware,
  roleCheck("client"),
  updateApplicationStatus
);
router.delete(
  "/job_applied/:jobId",
  authMiddleware,
  roleCheck("freelancer"),
  undoApplyToJob
);
authMiddleware;

router.get(
  "/job",
  authMiddleware,
  getJobs
);

router.get('/applied_jobs',authMiddleware,getAppliedJobs)
router.get('/posted_jobs',authMiddleware,roleCheck("client"),getPostedJobs)
router.delete('/removejob/:jobId',authMiddleware,roleCheck("client"),removePostedJob)

router.get('/filter',authMiddleware,filterJobs);



module.exports = router;
