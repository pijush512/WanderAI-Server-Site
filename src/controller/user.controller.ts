import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import config from '../config';
import { User } from '../model/user.model';

// Register user
const register = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const file = req.file;

    // Check if user already exists
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({
        success: false,
        message: 'User already exists!',
      });
    }

    // ২. যদি ইমেজ ফাইল থাকে, তবে সেটার পাথ req.body তে সেট করা
    // এখানে 'image' হলো আপনার ডাটাবেস মডেলের ফিল্ডের নাম
    if (file) {
      // আপনি যদি Cloudinary ব্যবহার না করেন, তবে লোকাল পাথ সেভ হবে
      // ব্রাউজারে দেখানোর জন্য 'uploads/filename.jpg' ফরম্যাটে রাখা ভালো
      req.body.image = file.path.replace(/\\/g, "/"); 
    }

    const savedUser = await User.create(req.body);
    
    // Generate token
    const token = jwt.sign(
      { 
        _id: savedUser._id,
        email: savedUser.email, 
        role: savedUser.role 
      },
      config.jwt_secret as Secret,
      { expiresIn: config.jwt_expires_in as any }
    );

    // Omit password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
      token,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: err.message,
    });
  }
};

// Login user
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password as string);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        _id: user._id,
        email: user.email, 
        role: user.role 
      },
      config.jwt_secret as Secret,
      { expiresIn: config.jwt_expires_in as any }
    );

    // Omit password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token,
      data: userResponse, 
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: err.message,
    });
  }
};

// Update Profile
const updateProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.user; // এটা আসবে আপনার Auth Middleware থেকে
    const { name } = req.body;
    const file = req.file;

    const updateData: any = {};
    if (name) updateData.name = name;
    
    if (file) {
      // উইন্ডোজের ব্যাকস্ল্যাশ ফিক্স করে পাথ সেভ করা
      updateData.image = file.path.replace(/\\/g, "/");
    }

    // ইমেইল দিয়ে ইউজার খুঁজে আপডেট করা
    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found!',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: err.message,
    });
  }
};

// Get all users
const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: err.message,
    });
  }
};

export const userControllers = {
  register,
  login,
  getUsers,
  updateProfile,
};