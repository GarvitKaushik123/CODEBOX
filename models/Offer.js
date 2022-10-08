const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new mongoose.Schema({
  profile: {
    type: String,
    required: [true, 'Please enter a profie'],
  },
  job_description: {
    type: String,
    required: [true, 'Please enter a job_description'], 
    maxlength: [20, 'Maximum job description length is 20'], 
  },
  poster: {
    type: String,
    required: [true, 'Please enter a poster'],
  },
  company_id: {
    type : Schema.Types.ObjectId,
    required : true
  }
});


const Offer = mongoose.model('offer', offerSchema);


module.exports = Offer;