const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const applicationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: [true, 'Please enter a name'], 
    maxlength: [20, 'Maximum name length is 20'], 
  },
  resume: {
    type: String,
    required: [true, 'Please enter a cover image'],
  },
  image: {
    type: String,
    required: [true, 'Please enter a cover image'],
  },
  company_id : {
    type : Schema.Types.ObjectId,
    required : true
 },
 reason: {
  type: String,
 }
});

const Application = mongoose.model('application', applicationSchema);

module.exports = Application;