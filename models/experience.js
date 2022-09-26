const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const experienceSchema = new Schema({
  name : {
    type : String,
    required : true
  }, 
  image : {
    type : String,
    required : true 
  },
  branch : {
    type : String,
    required : true
  },
  company : { 
      type : String,
      ref : 'companyies',
      required : true 
  },
  exp : {
      type : String,
      required : true
  }
});

const Experience = mongoose.model('experience', experienceSchema);

module.exports = Experience;
