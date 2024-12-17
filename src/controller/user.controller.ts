import { User } from "../models/user.model";
import { Response, Request } from "express";
import {
  generateOtp,
  generateToken,
  hashPassword,
  htmlBody,
  sendOTPOnEmail,
  verifyPassword,
} from "../util";

export const Signup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  }
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ email, password: hashedPassword });

    await newUser.save();

    const token = generateToken({ _id: newUser._id });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const Login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or user does not exist",
      });
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({ _id: user._id });

    return res.status(201).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    let { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No record found. Please use the email you registered with.",
      });
    }
    const otp = generateOtp(4);
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          otp,
          otpExpires,
        },
      }
    );
    await sendOTPOnEmail(
      user.email,
      "Reset Password",
      `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes. Please use it to reset your password.`,
      htmlBody(otp)
    );
    return res.status(201).json({
      success: true,
      message: "OTP sent to your registered email address",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    let { email, otp, newPassword } = req.body;

    email = email.toLowerCase();

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).send({
        success: false,
        message: "Otp is invalid",
      });
    }

    const currentTime = new Date();
    if (user.otpExpires && currentTime > user.otpExpires) {
      return res.status(400).send({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (user?.password) {
      const isSamePassword = await verifyPassword(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).send({
          success: false,
          message: "You cannot set your old password as the new password",
        });
      }
    }
    user.password = await hashPassword(newPassword);

    user.otp = null;
    user.otpExpires = null;

    await user.save();
    return res.status(201).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
