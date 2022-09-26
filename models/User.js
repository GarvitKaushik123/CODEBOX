const mongoose = require('mongoose');
// import mongoose from "mongoose";

const { isEmail } = require('validator');
// import {isEmail} from "validator";
 
const bcrypt = require('bcrypt');
// import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail , 'Please enter a valid email']
  }, 
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  },
  verified: {
    type: Boolean,
  },
  image: {
    type: String,
    required: [true, 'Please enter a cover image'],
  },
  name: {
    type: String,
    required: [true, 'Please enter a name'], 
    maxlength: [20, 'Maximum name length is 20'], 
  }
});


// fire a function before doc saved to db
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static method to login user
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if(user.verified == false){
      await this.findByIdAndDelete(user._id);
      throw Error('OTP not verified');
    }
    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};

const User = mongoose.model('user', userSchema);

module.exports = User;
// export { User };