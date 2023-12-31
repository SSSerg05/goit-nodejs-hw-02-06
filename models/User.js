import { Schema, model } from "mongoose"
import Joi from 'joi';

import { handleSaveError, preUpdate } from "./hooks.js";

const mailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const subscriptionList = ["starter", "pro", "business"];
const userShema = new Schema({
  username: {
      type: String,
      required: [true, "usename must be exist"],
  },
  email: {
      type: String,
      match: mailRegExp,
      unique: true,
      required: [true, 'Email is required'],
  },
  password: {
      type: String,
      minLength: 6,
      required: [true, 'Password is required'],
  },
  subscription: {
    type: String,
    enum: subscriptionList,
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: {
    type: String,
    default: null,  
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
}, {versionKey: false, timestamps: true});



// hooks mongoose
userShema.post("save", handleSaveError);

//userShema.pre("findOneAndUpdate", preUpdate);
userShema.pre("updateOne", preUpdate);
userShema.post("findOneAndUpdate", handleSaveError);

// Sign-Up
export const userSignUpSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().pattern(mailRegExp).required(),
  password: Joi.string().min(6).required(),
  subscription: Joi.string().valid(...subscriptionList),
  token: Joi.string(),
  avatarURL: Joi.string(),
})

// Sign-In
export const userSignInSchema = Joi.object({
  email: Joi.string().pattern(mailRegExp).required(),
  password: Joi.string().min(6).required(),
})

export const userUpdateSubscriptionSchema = Joi.object({
  // username: Joi.string(),
  subscription: Joi.string().valid(...subscriptionList).required(),
})

export const userUpdateAvatarSchema = Joi.object({
  avatarURL: Joi.string(),
})

export const userEmailSchema = Joi.object({
  email: Joi.string().pattern(mailRegExp).required(),
})

const User = model('user', userShema);

export default User;