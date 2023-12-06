import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
//import cloudinary from "../helpers/cloudinary.js";
import gravatar from "gravatar";
import Jimp from "jimp";

import User from "../models/User.js";
import HttpError from '../helpers/HttpError.js';
import { ctrlWrapper } from '../decorators/index.js';


const {JWT_SECRET} = process.env;
const avatarsPath = path.resolve("public", "avatars");

// Реєстрація користувача
//------------------------
const signUp = async (req, res) => {

  const { email, password } = req.body;
  const user = await User.findOne({email});
  if (user) {
    throw HttpError(409, "Email in use");
  }

  // for upload + save path for file img avatars
  ////========================
  // const {path: oldPath, filename } = req.file;
  // const newPath = path.join(avatarsPath, filename);
  
  // переміщення файлу з папки ../tmp до ../public/avatars
  // await fs.rename(oldPath, newPath);

  // формування нового відносного шляху до файла
  //  const avatarURL = path.join("avatars", filename);


  ////for cloudinary...
  ////========================
  // завантажуємо файл до сховища cloudinary
  ////const fileData = await cloudinary.uploader.upload(
  ////  <шлях_до_файлу_який_хочемо_завантажити>,
  ////  { <назва_папки_куди_завантажуємо_файл>, },
  ////)
  // const { url: avatarURL } = await cloudinary.uploader.upload(
  //   req.file.path, 
  //   { folder: "avatars", }
  // );
  //
  // видалення файлу з папки tmp
  // await fs.unlink(req.file.path); 

  //for gravatar... create img-avatar from email user
  ////========================
  const avatarURL = gravatar.url(email, {s:'250',});
 
  // save User (hash password(10 symbols) + add all fields in MongoDB)
  const hashPassword = await bcrypt.hash(password, 10)
  const newUser = await User.create({
    ...req.body, 
    password: hashPassword, 
    avatarURL,
  });
  
  res.status(201).json({
    username: newUser.username,
    email: newUser.email,
    subscription: newUser.subscription,
    avatarURL: newUser.avatarURL,
  })
}

// авторизований вхід 
//------------------------
const signIn = async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if (!user) {
    throw HttpError(401, "User not found");
  }
  
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password wrong");
  }

  const payload = {
    id: user.id,
  }

  const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "23h"});
  await User.findByIdAndUpdate(user._id, {token});

  res.json({
    token,
  })
}


// отримання даних про поточного користувача
//------------------------
const getCurrent =  async (req, res) => {
  const {_id, username, email, subscription, token} = req.user;
  if (!_id) {
    throw HttpError(401, "User not authorized");
  }
  res.status(200).json({
    email,
    subscription,
  })
}

// вихід з облікового запису
//------------------------
const signOut = async (req, res) => {
  const {_id} = req.user;
  if (!_id) {
    throw HttpError(401, "User not authorized");
  }

  await User.findOneAndUpdate(_id, {token: null});

  res.status(204);
}

const update = async (req, res) => {
  const {_id} = req.user;
  if (!_id) {
    throw HttpError(401, "User not authorized");
  }

  const result = await User.findByIdAndUpdate(_id, req.body);
  if (!result) {
    throw HttpError(404, `Not found user with id:${_id}`);
  }

  res.json(result);
}


const updateAvatar = async (req, res) => {

  const {_id} = req.user;
  if (!_id) {
    throw HttpError(401, "User not authorized");
  }

  try {
    const {path: oldPath, filename } = req.file;
    const newPath = path.join(avatarsPath, filename);
    
    // переміщення файлу з папки ../tmp до ../public/avatars
    await fs.rename(oldPath, newPath);
    
    // формування нового відносного шляху до файла
    const avatarURL = path.join("avatars", filename);
    Jimp.read(avatarURL)
      .then((image) => {
        return image
        .resize(250, 250)
        .quality(60)
        .write(avatarURL)
      })
      .catch((err) => {
        console.log(err);
      })

    // оновлення даних
    const result = await User.findByIdAndUpdate(_id, {...req.body, avatarURL});
    if (!result) {
      throw HttpError(404, `Not found user with id:${_id}`);
    }
    
    res.status(200).json(
      result, 
      avatarURL,
    );
  } catch (error) {
    await fs.unlink(oldPath);
    throw HttpError(403, `Avatar cannot add in folder`);
  }

}



export default {
  signUp: ctrlWrapper(signUp),
  signIn: ctrlWrapper(signIn),
  getCurrent: ctrlWrapper(getCurrent),
  signOut: ctrlWrapper(signOut),
  update: ctrlWrapper(update),
  updateAvatar: ctrlWrapper(updateAvatar),
}