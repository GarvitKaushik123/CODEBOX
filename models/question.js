const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
  name : {
    type : String,
    required : true
  },
  link : { 
      type : String,
      required : true 
  },
  topic : {
     type : Schema.Types.ObjectId,
     ref : 'topics',//not constructors name!
     required : true
  },
  // approved : {
  //   type : Boolean,
  //   default : false
  // }

});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
