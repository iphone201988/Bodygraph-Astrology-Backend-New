import * as express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import "dotenv/config";


export function respondWithError500(ex: any, res: express.Response) {
  console.log(ex);
  res.status(500).json({ error: ex.toString() });
}

let SECRET_KEY: string;

if (typeof process.env.SECRET_KEY === "string") {
  SECRET_KEY = process.env.SECRET_KEY;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}

export function generateToken(
  payload: object,
  expiresIn: string = "1d"
): string {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn });
  return token;
}

export function verifyToken(token: string): object | string {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

/**
 * Generates a random numeric OTP of a given length.
 * @param length - The length of the OTP (typically 4 or 6 digits).
 * @returns A numeric OTP as a string.
 */
export const generateOtp = (length: number = 6): string => {
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length);
  return otp.toString().padStart(length, "0");
};

export const sendOTPOnEmail = async (
  receiverEmail: any,
  subject: any,
  text: any,
  body: any
) => {
  const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: "zohaib60610@gmail.com",
    to: receiverEmail,
    subject: subject,
    text: text,
    html: body,
  };

  transport.sendMail(mailOptions, function (err: any, info: any) {
    if (err) {
      console.log(err);
    } else {
      // console.log(info);
    }
  });
};

export const htmlBody = (otp: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
      <style>
        /* Tailwind CSS for email compatibility */
        @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.0.0/dist/tailwind.min.css');
        
        body {
          font-family: 'Arial', sans-serif;
        }

        /* Make email responsive */
        @media (max-width: 600px) {
          .container {
            padding: 20px;
          }
          .otp-box {
            font-size: 28px !important;
          }
          .header-text {
            font-size: 20px !important;
          }
        }
      </style>
    </head>
    <body class="bg-gray-100">

      <!-- Main Email Container -->
      <div class="bg-gray-100 py-8">
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 container">
          
          <div class="text-center mb-6">
            <p class="text-lg text-gray-600 mt-2">You requested to reset your password. Please use the OTP below to complete the process.</p>
          </div>

          <div class="text-center mb-6 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 py-12 rounded-lg shadow-lg">
            <div class="inline-block text-white font-bold py-8 px-16 rounded-lg shadow-lg otp-box">
              <span class="text-6xl">${otp}</span>
            </div>
            <p class="text-lg text-gray-200 mt-4">This OTP will expire in 10 minutes. Please use it to reset your password.</p>
          </div>

          <div class="text-center mb-6">
            <p class="text-sm text-gray-500">
              If you did not request a password reset, please ignore this email or contact support.
            </p>
          </div>

          <div class="text-center text-gray-500 text-xs mt-6">
            <p>&copy; 2024 Bodygraph-Astrology. All rights reserved.</p>
          </div>

        </div>
      </div>

    </body>
    </html>
  `;
};

