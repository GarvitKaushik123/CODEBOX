const mongoose = require('mongoose');
// import mongoose from "mongoose";

const { isEmail } = require('validator');
// import {isEmail} from "validator";
 
const bcrypt = require('bcrypt');
// import bcrypt from "bcrypt";

const companySchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: [true, 'Please enter a name'], 
    maxlength: [20, 'Maximum name length is 20'], 
  },
  tagline: {
    type: String,
    required: [true, 'Please enter a tagline'],
    maxlength: [35, 'Maximum tagline length is 35'], 
  },
  coverImage: {
    type: String,
    required: [true, 'Please enter a cover image'],
  },
  category: {
    type: String,
    required: [true, 'Please enter a category'],
  },
  country: {
    type: String,
    required: [true, 'Please enter a company'],
  },
  lat: {
    type: Number,
    required: [true, 'Please enter location of your company'],
  },
  long: {
    type: Number,
    required: [true, 'Please enter location of your company'],
  },
});

// before saving encrypting password
companySchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static method to login user
companySchema.statics.login = async function(email, password) {
  const company = await this.findOne({ email });
  if (company) {
    // const auth = await bcrypt.compare(password, user.password);
    const auth = await bcrypt.compare(password, company.password);
    if (auth) {
      return company;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};


const Company = mongoose.model('company', companySchema);


module.exports = Company;