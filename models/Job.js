const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true ,
         set: title => title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()

  },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  city: { type: String, required: true ,
             set: city => city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()

  },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  description: { type: String, required: true },
 skillsRequired: {
  type: [String],
  required: true,
  set: skillsArray =>
    Array.isArray(skillsArray)
      ? skillsArray.map(skill =>
          skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()
        )
      : [],
},

  applicants: [
    {
      freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      appliedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
      }
    }
  ],
  createdAt: { type: Date, default: Date.now ,index: true},
});

module.exports =  mongoose.model('Job', JobSchema);
