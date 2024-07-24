import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import {hash, compare} from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/contants.js";

export const getAllUsers = async (req: Request,res: Response,next: NextFunction) => {
    try { 
      const users = await User.find();
      return res.status(200).json({ message: "OK", users });
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      console.error('Config:', error.config);
    }
  };

export const userSignup = async (req: Request,res: Response,next: NextFunction) => {
  try { 
    const {name, email, password} = req.body;
    const existingUsr = await User.findOne({email});
    if(existingUsr) return res.status(401).send("User already exists"); 
    const hpwd = await hash(password, 10);
    const usr = new User({name, email, password:hpwd});
    await usr.save();

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      domain: "localhost",
      signed: true,
      path: "/",
    });

    const token = createToken(usr._id.toString(), usr.email, "7d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      expires,
      httpOnly: true,
      signed: true,
    });

    return res.status(201).json({ message: "OK", name: usr.name, email: usr.email});
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "ERROR", cause: error.message });
  }
};
  
export const userLogin = async (req: Request,res: Response,next: NextFunction) => {
  try { 
    const {email, password} = req.body;
    const usr = await User.findOne({email});
    if(!usr){
      return res.status(401).send("User is not registered"); 
    }
    const ispwdCrct = await compare(password, usr.password);
    if(!ispwdCrct){
      return res.status(403).send("Incorrect password"); 
    }
    res.clearCookie(COOKIE_NAME, {
      domain:"localhost",
      httpOnly: true,
      signed: true,
      path: "/",
    });
    const token = createToken(usr._id.toString(), usr.email, "7d");
    const expires = new Date();
    expires.setDate(expires.getDate()+7);
    res.cookie(COOKIE_NAME, token, {
      path: "/", 
      domain:"localhost",
      expires,
      httpOnly: true,
      signed: true
    });
    return res.status(200).json({ message: "OK", name: usr.name, email: usr.email});
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "ERROR", cause: error.message });
  }
};

export const verifyUser = async (req: Request,res: Response,next: NextFunction) => {
  try { 
    const usr = await User.findById(res.locals.jwtData.id);
    if(!usr){
      return res.status(401).send("User is not registered or Token Malfunctioned"); 
    }
    if(usr._id.toString() !== res.locals.jwtData.id){
      return res.status(401).send("Permissions didn't match"); 
    }
    return res.status(200).json({ message: "OK", name: usr.name, email: usr.email});
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "ERROR", cause: error.message });
  }
};

export const userLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      domain: "localhost",
      signed: true,
      path: "/",
    });

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
