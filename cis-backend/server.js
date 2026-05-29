require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const pdfKit = require('pdfkit');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const dns = require('dns');

const googleClient = new OAuth2Client(); // Dynamic verification

// REAL Gmail SMTP Setup Instructions:
// 1. Go to Google Account -> Security -> 2-Step Verification
// 2. Search "App Passwords" -> Generate one for "CIS Mailer"
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL || 'jeffinj427@gmail.com', // <-- UPDATE THIS IN PRODUCTION
    pass: process.env.SMTP_PASSWORD || 'qwfz eclm nasl sxdl' // <-- UPDATE THIS IN PRODUCTION
  }
});
// Setup Uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storageDir = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storageDir });
const { User, Case, Note, AuditLog, Evidence } = require('./models');

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Helper for sending real-time notifications to users (investigators)
const sendNotification = async (userId, message, type = 'info') => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    const notif = { message, type, read: false, createdAt: new Date() };
    user.notifications.unshift(notif);
    if (user.notifications.length > 50) user.notifications.pop(); // keep limit
    await user.save();
    
    // Broadcast via socket so UI updates in real-time
    io.emit('new_notification', { userId, ...notif });
  } catch (err) {
    console.error('Failed to send notification', err);
  }
};

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

const JWT_SECRET = process.env.JWT_SECRET || 'LOCAL_DEV_SECRET_SUPER_SAFE';

const sendAlert = async (email, phone, caseId, status, message, investigatorName) => {
  try {
     const mailOptions = {
        from: '"CIS Central Portal" <jeffinj427@gmail.com>',
        to: email,
        subject: `CIS Update: Case ${caseId} Constraint Modification`,
        html: `<div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; text-align: center;">
            <div style="background: white; border-top: 4px solid #2563eb; padding: 30px; border-radius: 8px; max-width: 500px; margin: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h1 style="color: #1e293b; margin-top: 0;">CIS Protocol Alert</h1>
              <p style="color: #64748b; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Tracking ID: <strong>${caseId}</strong></p>
              <h2 style="color: #2563eb; background: #eff6ff; padding: 10px; border-radius: 6px;">Status: ${status}</h2>
              <p style="color: #334155; font-size: 16px;">${message}</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">Logging Authenticated via Officer: <strong>${investigatorName || 'System'}</strong></p>
            </div>
          </div>`
     };
     await transporter.sendMail(mailOptions);
     console.log(`[SIMULATED SMS to ${phone || 'Unknown'}]: Case ${caseId} updated to ${status} - ${message}`);
  } catch (err) {
     console.error("Alert transmission fault:", err.message);
  }
};

// === MIDDLEWARE ===
const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User database mismatch. Please login again.' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token Expired' });
  }
};

// === ROUTES ===

// 1. AUTH

// Strict Validation Helpers
const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  return minLength && hasUpper && hasLower && hasNum && hasSpecial;
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Deep verification for typos
const verifyEmailDeep = (email) => {
  return new Promise((resolve) => {
    if (!validateEmail(email)) return resolve(false);
    
    const domain = email.split('@')[1];
    const commonTypos = ['gmil.com', 'gmail.con', 'gamil.com', 'gmal.com', 'yaho.com', 'yahoo.con', 'hotmai.com', 'hotmal.com', 'outlok.com'];
    
    if (commonTypos.includes(domain.toLowerCase())) {
      return resolve(false);
    }
    
    resolve(true);
  });
};
const validatePhone = (phone) => /^\d{10}$/.test(phone);

// reCAPTCHA Secret Key (Generate at: https://www.google.com/recaptcha/admin)
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

const generateSecureOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const verifyRecaptcha = async (token) => {
  // Bypassed for local development since the frontend widget was removed for testing
  return true;
};

// A. Register
// A.0 Pre-registration OTP Endpoints
app.post('/api/auth/send-pre-otp', async (req, res) => {
  const { type, identifier } = req.body;
  try {
    if (!identifier) return res.status(400).json({ message: 'Identifier is required.' });
    if (type === 'email') {
      if (!validateEmail(identifier)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
      }
      const isDeepValid = await verifyEmailDeep(identifier);
      if (!isDeepValid) {
        return res.status(400).json({ message: 'Invalid email domain. Please check for typos.' });
      }
    }
    
    const userExists = await User.findOne({ [type]: identifier });
    if (userExists) return res.status(400).json({ message: `${type === 'email' ? 'Email' : 'Phone'} is already registered.` });

    const plainOtp = generateSecureOTP();
    const hashedOtp = await bcrypt.hash(plainOtp, 10);
    const otpToken = jwt.sign({ identifier, type, hashedOtp }, 'cis_secure_jwt_secret', { expiresIn: '60s' });

    let simulatedOtp = null;
    if (type === 'email') {
      try {
        await transporter.sendMail({
          from: `"CIS Identity Secure" <${transporter.options.auth.user}>`,
          to: identifier,
          subject: 'CIS Verification - Your Secure Access Code',
          html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Identity Verification</h2>
            <p>Your 6-digit email secure access code is:</p>
            <h1 style="color: #2563eb; letter-spacing: 5px;">${plainOtp}</h1>
            <p style="color: #666; font-size: 12px; margin-top:20px;">Code expires in 60 seconds. Do not share this.</p>
          </div>`
        });
      } catch (e) {
        console.log('Failed to send email OTP via transporter. Ensure Gmail App Password is valid.');
      }
    } else if (type === 'phone') {
      console.log(`\n\n[SECURE SMS GATEWAY SIMULATION] -> To: ${identifier} | Your Phone OTP is: ${plainOtp}\n\n`);
      simulatedOtp = plainOtp; // Pass to frontend for testing purposes since no real gateway is used
    }

    res.status(200).json({ message: `Secure OTP dispatched to ${identifier}`, otpToken, simulatedOtp });
  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP.', error: err.message });
  }
});

app.post('/api/auth/verify-pre-otp', async (req, res) => {
  const { otpToken, otp } = req.body;
  try {
    if (!otpToken || !otp) return res.status(400).json({ message: 'OTP and secure token required' });
    
    let decoded;
    try {
      decoded = jwt.verify(otpToken, 'cis_secure_jwt_secret');
    } catch (e) {
      return res.status(400).json({ message: 'OTP session expired or invalid.' });
    }

    const isMatch = await bcrypt.compare(otp, decoded.hashedOtp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Verification Code.' });

    const verifiedToken = jwt.sign({ identifier: decoded.identifier, type: decoded.type, verified: true }, 'cis_secure_jwt_secret', { expiresIn: '30m' });
    res.status(200).json({ message: 'Identity verified successfully', verifiedToken });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying OTP.', error: err.message });
  }
});

// A. Registration
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, recaptchaToken, emailVerifiedToken } = req.body;
  try {
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    // Validate emailVerifiedToken
    try {
      const decodedEmail = jwt.verify(emailVerifiedToken, 'cis_secure_jwt_secret');
      if (decodedEmail.identifier !== email || !decodedEmail.verified) throw new Error();
    } catch(e) {
      return res.status(400).json({ message: 'Email not verified or session expired.' });
    }

    // 1. reCAPTCHA Verification
    // const isBot = await verifyRecaptcha(recaptchaToken);
    // if (!isBot) return res.status(403).json({ message: 'Recaptcha verification failed. Are you a robot?' });

    // 2. Strict Validations
    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format.' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be 8+ chars with uppercase, lowercase, number, and special character.' });

    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered.' });

    const user = await User.create({ 
      name, email, password, role,
      accountStatus: 'verified',
      emailVerified: true
    });

    await AuditLog.create({ action: `New Account Registered (${role}) - Fully Verified`, performedBy: user.name });

    res.status(201).json({ message: 'Account registered securely. You can now login.', _id: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Database error storing user.', error: err.message });
  }
});

// B. Login
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password, role, recaptchaToken } = req.body;
  try {
    if (!identifier || !password) return res.status(400).json({ message: 'Please enter email and password' });

    // 1. reCAPTCHA Verification
    const isBot = await verifyRecaptcha(recaptchaToken);
    if (!isBot) return res.status(403).json({ message: 'Recaptcha verification failed. Are you a robot?' });

    if (!validateEmail(identifier)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // 2. Fetch via Email identifier
    const user = await User.findOne({ email: identifier });

    if (!user) return res.status(404).json({ message: 'Account not found. Please register first' });
    if (!user.password && user.googleId) return res.status(400).json({ message: 'Account uses Google Auth exclusively. Please Continue with Google' });

    // 3. Brute Force Protection (Lockout check)
    if (user.accountStatus === 'locked' && user.lockUntil && user.lockUntil > Date.now()) {
      const waitTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Account temporarily locked due to security policy. Try again in ${waitTime} minutes.` });
    } else if (user.accountStatus === 'locked' && user.lockUntil && user.lockUntil <= Date.now()) {
      // Auto-unlock if time has passed
      user.accountStatus = user.emailVerified ? 'verified' : 'pending';
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    if (user.role !== role && role) return res.status(403).json({ message: `Access denied. Role mismatch.` });

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.accountStatus = 'locked';
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await AuditLog.create({ action: `Brute Force Lockout Triggered (${user.email})`, performedBy: 'System Defense' });
      }
      await user.save();
      return res.status(401).json({ message: 'Incorrect password entered. Please try again.' });
    }

    // 4. Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // 5. Single Verification Check
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: 'Account pending secure email verification.',
        needsVerification: true,
        _id: user._id
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    await AuditLog.create({ action: `User Authenticated (${user.role})`, performedBy: user.name });
    res.json({ _id: user._id, name: user.name, role: user.role, token });
  } catch (err) {
    res.status(500).json({ message: 'Error validating login.', error: err.message });
  }
});

// B1. Verify Email OTP
app.post('/api/auth/verify-email', async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });
    
    if (user.emailOtpExpiry < Date.now()) return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    const isMatch = await bcrypt.compare(otp, user.emailOtp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP code' });

    user.emailVerified = true;
    user.emailOtp = null;
    if (user.phoneVerified) user.accountStatus = 'verified';
    await user.save();

    res.json({ message: 'Email verified successfully', phoneVerified: user.phoneVerified });
  } catch (err) {
    res.status(500).json({ message: 'Verification error', error: err.message });
  }
});

// B2. Verify Phone OTP
app.post('/api/auth/verify-phone', async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.phoneVerified) return res.status(400).json({ message: 'Phone already verified' });
    
    if (user.phoneOtpExpiry < Date.now()) return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    const isMatch = await bcrypt.compare(otp, user.phoneOtp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP code' });

    user.phoneVerified = true;
    user.phoneOtp = null;
    if (user.emailVerified) user.accountStatus = 'verified';
    await user.save();

    const token = user.accountStatus === 'verified' ? jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' }) : null;
    
    res.json({ message: 'Phone verified successfully', emailVerified: user.emailVerified, token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Verification error', error: err.message });
  }
});

// B3. Resend OTP
app.post('/api/auth/resend-otp', async (req, res) => {
  const { userId, type } = req.body; // type: 'email' or 'phone'
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const plainOtp = generateSecureOTP();
    const hashedOtp = await bcrypt.hash(plainOtp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (type === 'email') {
      if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });
      user.emailOtp = hashedOtp;
      user.emailOtpExpiry = otpExpiry;
      
      try {
        await transporter.sendMail({
          from: `"CIS Identity Secure" <${transporter.options.auth.user}>`,
          to: user.email,
          subject: 'CIS Verification - New Secure Access Code',
          html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Identity Verification</h2>
            <p>Your new 6-digit email secure access code is:</p>
            <h1 style="color: #2563eb; letter-spacing: 5px;">${plainOtp}</h1>
            <p style="color: #666; font-size: 12px; margin-top:20px;">Code expires in 10 minutes.</p>
          </div>`
        });
      } catch (e) {
        console.log('Failed to resend email.');
      }
    } else if (type === 'phone') {
      if (user.phoneVerified) return res.status(400).json({ message: 'Phone already verified' });
      user.phoneOtp = hashedOtp;
      user.phoneOtpExpiry = otpExpiry;
      console.log(`\n\n[SECURE SMS GATEWAY SIMULATION] -> To: ${user.phone} | Your New Phone OTP is: ${plainOtp}\n\n`);
    } else {
      return res.status(400).json({ message: 'Invalid OTP type' });
    }

    await user.save();
    res.json({ message: `New ${type} OTP dispatched successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Error resending OTP', error: err.message });
  }
});

// C. Google Login (Real implementation)
app.post('/api/auth/google', async (req, res) => {
  const { credential, role } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({ 
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || '412104144621-af2g32q0q5nj7elna2d5v57jlctn5kov.apps.googleusercontent.com'
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      // Production Rule: Elevate to admin automatically if email matches the ROOT_ADMIN_EMAIL in .env
      const isRootAdmin = email === process.env.ROOT_ADMIN_EMAIL;
      const assignedRole = isRootAdmin ? 'admin' : (role || 'public');
      
      user = await User.create({ 
        name, 
        email, 
        googleId, 
        role: assignedRole, 
        accountStatus: 'verified',
        emailVerified: true
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (email === process.env.ROOT_ADMIN_EMAIL && user.role !== 'admin') {
        user.role = 'admin';
      }
      await user.save();
    } else if (email === process.env.ROOT_ADMIN_EMAIL && user.role !== 'admin') {
      // Ensure the root admin always retains admin rights if they sign in via Google
      user.role = 'admin';
      await user.save();
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    await AuditLog.create({ action: `Google Auth (${user.role})`, performedBy: user.name });
    res.json({ _id: user._id, name: user.name, role: user.role, token });
  } catch (err) {
    res.status(401).json({ message: 'Google Token Verification Failed', error: err.message });
  }
});

// D. Forgot Password (OTP Generation)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { identifier } = req.body;
  try {
    if (!validateEmail(identifier)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    const isDeepValid = await verifyEmailDeep(identifier);
    if (!isDeepValid) {
      return res.status(400).json({ message: 'Invalid email domain. Please check for typos.' });
    }
    let user = await User.findOne({ email: identifier });
    
    // Real Authentication: Explicitly tell the user if the account doesn't exist
    if (!user || !user.email) {
      return res.status(404).json({ message: 'Account not found. Please ensure you are registered.' });
    }

    const plainOtp = generateSecureOTP();
    const hashedOtp = await bcrypt.hash(plainOtp, 10);
    
    user.forgotPasswordOtp = hashedOtp;
    user.forgotPasswordOtpExpiry = Date.now() + 60 * 1000; // 60 seconds
    await user.save();

    console.log(`[FORGOT PASSWORD OTP DISPATCH TARGET] -> ${user.email}\nYour OTP: ${plainOtp}`);

    try {
      await transporter.sendMail({
        from: `"CIS Safety Security" <${transporter.options.auth.user}>`,
        to: user.email,
        subject: 'CIS System - Secure Password Reset Code',
        html: `<div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Your 6-digit secure password reset code is:</p>
          <h1 style="color: #2563eb; letter-spacing: 5px;">${plainOtp}</h1>
          <p style="color: #666; font-size: 12px; margin-top:20px;">Code expires in 60 seconds. If you did not request this, ignore this email.</p>
        </div>`
      });
    } catch (err) {
      console.log('Error dispatching forgot password email OTP.');
    }

    res.json({ message: 'If an account exists, a secure OTP has been dispatched.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error processing request.' });
  }
});

// D2. Verify Forgot Password OTP
app.post('/api/auth/verify-forgot-password-otp', async (req, res) => {
  const { identifier, otp } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
    if (!user || !user.forgotPasswordOtp) return res.status(400).json({ message: 'Invalid request' });

    if (user.forgotPasswordOtpExpiry < Date.now()) return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    const isMatch = await bcrypt.compare(otp, user.forgotPasswordOtp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP code' });

    // Issue a short-lived reset token specifically for the reset password step
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    
    // Clear the OTP so it can't be reused
    user.forgotPasswordOtp = null;
    user.forgotPasswordOtpExpiry = null;
    await user.save();

    res.json({ message: 'OTP verified', resetToken });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// E. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { identifier, resetToken, newPassword } = req.body;
  try {
    if (!validatePassword(newPassword)) return res.status(400).json({ message: 'Password does not meet complexity requirements.' });

    let user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }],
      resetToken, 
      resetTokenExpiry: { $gt: Date.now() } 
    });
    
    if (!user) return res.status(400).json({ message: 'Invalid or expired secure reset session.' });

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    
    // Optionally unlock the account if they reset their password
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    if (user.accountStatus === 'locked' && user.emailVerified && user.phoneVerified) {
      user.accountStatus = 'verified';
    }

    await user.save(); // pre('save') middleware automatically bcrypts this!

    await AuditLog.create({ action: `Password Reset (${user.email})`, performedBy: user.name || 'System' });

    res.json({ message: 'Password cryptographic reset successful. You may now login.' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// F. User Profile
app.get('/api/users/me', protect, async (req, res) => {
  try {
    // Send user without password
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch(err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

app.put('/api/users/profile', protect, async (req, res) => {
  const { name, phone } = req.body;
  try {
    req.user.name = name || req.user.name;
    req.user.phone = phone || req.user.phone;
    await req.user.save();
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

// 2. CASES
app.post('/api/cases', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Anti-Fake Protection 1: Only Verified Users (Google Auth users are implicitly verified)
    if (user.role === 'public' && user.accountStatus !== 'verified' && !user.googleId) {
      return res.status(403).json({ message: 'Only fully verified identities can submit intelligence reports.' });
    }

    // Anti-Fake Protection 2: reCAPTCHA
    const isBot = await verifyRecaptcha(req.body.recaptchaToken);
    if (!isBot) return res.status(403).json({ message: 'Recaptcha verification failed. Automated submissions are blocked.' });

    // Anti-Fake Protection 3: Duplicate Detection (Same subject within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await Case.findOne({
      reporterId: req.user._id,
      subjectName: { $regex: new RegExp(`^${req.body.subjectName}$`, 'i') },
      createdAt: { $gte: twentyFourHoursAgo }
    });

    if (duplicate) {
      // Anti-Fake Protection 4: Suspicious Activity Flagging
      await AuditLog.create({ action: `Blocked Duplicate Report Submission (Subject: ${req.body.subjectName})`, performedBy: user.name });
      return res.status(429).json({ message: 'A report on this subject was already submitted recently. Duplicate intercepted.' });
    }

    req.body.reporterId = req.user._id;
    // Admin Review: Default to 'Pending Review' instead of 'Submitted' for strict vetting
    req.body.status = 'Pending Review';

    const newCase = await Case.create(req.body);
    await AuditLog.create({ action: `Case Generated: ${newCase.caseId} (Pending Review)`, performedBy: 'System Public Portal' });
    
    // Fire and forget the email alert
    sendAlert(req.user.email, req.user.phone, newCase.caseId, 'Pending Review', 'Your Intelligence Report is under rigorous system review before network dispatch.', 'System Core').catch(console.error);
    
    const populatedCase = await Case.findById(newCase._id).populate('reporterId', 'name email phone');
    io.emit('new_case', populatedCase);
    
    res.status(201).json(populatedCase);
  } catch (err) {
    res.status(500).json({ message: 'Error submitting case', error: err.message });
  }
});

app.get('/api/cases', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'investigator') {
       query.assignedInvestigator = req.user._id;
       console.log("Logged user:", req.user._id);
    } else if (req.user.role === 'public') {
       query.reporterId = req.user._id;
    }
    const cases = await Case.find(query)
      .populate('assignedInvestigator', 'name')
      .populate('reporterId', 'name email phone');
    
    // Developer Request: Debug Check
    if(req.user.role === 'investigator' && cases.length > 0) {
        console.log("Assigned investigator:", cases[0].assignedInvestigator?._id || cases[0].assignedInvestigator);
    }

    res.json(cases);
  } catch(err) {
    res.status(500).json({ message: 'Error retrieving cases' });
  }
});

// Public Endpoint for Live Heatmap and Alerts (No JWT required, sanitized data)
app.get('/api/public/cases', async (req, res) => {
  try {
    const cases = await Case.find({ status: { $ne: 'Closed' } })
      .select('caseId location latitude longitude priority status updatedAt subjectName age gender updates')
      .sort('-updatedAt')
      .limit(50);
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving public cases' });
  }
});

// Dynamic Public Metrics
app.get('/api/public/metrics', async (req, res) => {
  try {
    const totalCases = await Case.countDocuments();
    const activeCases = await Case.countDocuments({ status: { $ne: 'Closed' } });
    const closedCases = await Case.countDocuments({ status: 'Closed' });
    const totalUsers = await User.countDocuments();
    
    res.json({
      totalCases,
      activeCases,
      closedCases,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving metrics' });
  }
});

app.get('/api/cases/:id', protect, async (req, res) => {
  // Can be Case ID string or Mongo _id
  let q = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { caseId: req.params.id };
  const targetCase = await Case.findOne(q)
    .populate('assignedInvestigator', 'name')
    .populate('reporterId', 'name email phone');
  
  if (!targetCase) return res.status(404).json({ message: 'Not Found' });
  
  // Security Check: Public users can only track their own submissions
  if (req.user.role === 'public') {
    const reporterIdStr = targetCase.reporterId?._id?.toString() || targetCase.reporterId?.toString();
    if (reporterIdStr !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You can only track cases you submitted.' });
    }
  }

  res.json(targetCase);
});

app.put('/api/cases/:id/status', protect, async (req, res) => {
  try {
    let q = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { caseId: req.params.id };
    const target = await Case.findOne(q).populate('reporterId', 'email phone name');
    if (!target) return res.status(404).json({ message: 'Case not found' });
    
    // Strict Role Validation
    const s = req.body.status;
    if ((s === 'Evidence Verified' || s === 'In Progress') && (req.user.role !== 'investigator' && req.user.role !== 'admin')) {
        return res.status(403).json({message: 'Only authorized Investigation personnel can elevate case tiers.'});
    }
    if (s === 'Closed' && req.user.role !== 'admin' && req.user.role !== 'investigator') {
        return res.status(403).json({message: 'Only Central Administrators and Investigators have authorization to definitively close active pipelines.'});
    }

    target.status = s;
    const msg = req.body.message || `Case tracking protocol mechanically elevated to ${s}`;
    target.updates.push({ status: s, message: msg, investigatorName: req.user.name });
    
    await target.save();
    await AuditLog.create({ action: `Status updated to ${s} on ${target.caseId}`, performedBy: req.user.name });
    
    if (target.reporterId) {
      sendAlert(target.reporterId.email, target.reporterId.phone, target.caseId, s, msg, req.user.name).catch(console.error);
    }
    
    const populatedTarget = await Case.findById(target._id).populate('reporterId', 'email phone name').populate('assignedInvestigator', 'name');
    io.emit('case_updated', populatedTarget);
    
    res.json(populatedTarget);
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

app.put('/api/cases/:id/priority', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin access strictly required for priority overrides.' });
    let q = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { caseId: req.params.id };
    const target = await Case.findOne(q).populate('reporterId', 'email phone name');
    if (!target) return res.status(404).json({ message: 'Case not found' });

    const p = req.body.priority;
    target.priority = p;
    target.updates.push({ status: target.status, message: `System Priority Protocol manually overridden to ${p}`, investigatorName: req.user.name });
    await target.save();
    await AuditLog.create({ action: `Priority Override to ${p} for ${target.caseId}`, performedBy: req.user.name });

    if (target.reporterId) {
      sendAlert(target.reporterId.email, target.reporterId.phone, target.caseId, target.status, `Your case priority has been escalated to ${p}`, req.user.name).catch(console.error);
    }
    res.json(target);
  } catch (err) {
    res.status(500).json({ message: 'Error overriding constraint.', error: err.message });
  }
});

app.post('/api/cases/:id/activate-gps', protect, async (req, res) => {
  try {
    let q = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { caseId: req.params.id };
    const target = await Case.findOne(q).populate('reporterId', 'email phone name');
    if (!target) return res.status(404).json({ message: 'Case not found' });
    
    // Initialize random coordinates around Bangalore
    target.latitude = 12.9716 + (Math.random() - 0.5) * 0.1;
    target.longitude = 77.5946 + (Math.random() - 0.5) * 0.1;
    target.updates.push({ status: target.status, message: `GPS tracking beacon securely engaged. Live link established.`, investigatorName: req.user.name });
    
    await target.save();
    await AuditLog.create({ action: `GPS Activated for ${target.caseId}`, performedBy: req.user.name });
    
    const populatedTarget = await Case.findById(target._id).populate('reporterId', 'email phone name').populate('assignedInvestigator', 'name');
    io.emit('case_updated', populatedTarget);
    res.json(populatedTarget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cases/:id/location', protect, async (req, res) => {
  try {
    let q = mongoose.Types.ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { caseId: req.params.id };
    const target = await Case.findOne(q).populate('reporterId', 'email phone name');
    if (!target) return res.status(404).json({ message: 'Case not found' });
    
    if (req.user.role !== 'investigator' && req.user.role !== 'admin') {
        return res.status(403).json({message: 'Only authorized Investigation personnel can update case locations.'});
    }

    const { latitude, longitude } = req.body;
    target.latitude = latitude;
    target.longitude = longitude;
    target.updates.push({ status: target.status, message: `Geographical location coordinates locked`, investigatorName: req.user.name });
    
    await target.save();
    await AuditLog.create({ action: `Geographical location updated on ${target.caseId}`, performedBy: req.user.name });
    
    const populatedTarget = await Case.findById(target._id).populate('reporterId', 'email phone name').populate('assignedInvestigator', 'name');
    io.emit('case_updated', populatedTarget);
    
    res.json(populatedTarget);
  } catch (err) {
    res.status(500).json({ message: 'Error updating location', error: err.message });
  }
});

// 3. EVIDENCE & NOTES
app.post('/api/evidence/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  try {
    let targetId = req.body.caseId;
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      const c = await Case.findOne({ caseId: targetId });
      if (!c) return res.status(404).json({ message: 'Case not found' });
      targetId = c._id;
    }
    const ev = await Evidence.create({
      caseId: targetId, fileUrl: `/uploads/${req.file.filename}`, fileType: req.file.mimetype
    });
    res.json(ev);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/evidence/:id', async (req, res) => {
  try {
    let q = mongoose.Types.ObjectId.isValid(req.params.id) ? { caseId: req.params.id } : {};
    if (!q.caseId) {
      const c = await Case.findOne({ caseId: req.params.id });
      if (c) q.caseId = c._id;
    }
    res.json(await Evidence.find(q));
  } catch (err) { res.status(500).json([]); }
});

app.post('/api/notes', protect, async (req, res) => {
  const note = await Note.create({ ...req.body, author: req.user.name });
  
  // Notify assigned investigator if someone else posted a note
  try {
    const c = await Case.findById(req.body.caseId);
    if (c && c.assignedInvestigator && String(c.assignedInvestigator) !== String(req.user._id)) {
      sendNotification(c.assignedInvestigator, `New note added to Case ${c.caseId} by ${req.user.name}`, 'info');
    }
  } catch (err) { console.error(err); }

  res.json(note);
});

app.get('/api/notes/:id', protect, async (req, res) => {
  try {
    let q = {};
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      q.caseId = req.params.id;
    } else {
      const c = await Case.findOne({ caseId: req.params.id });
      if (c) q.caseId = c._id;
    }
    if (req.user.role === 'public') q.visibility = 'public';
    const notes = await Note.find(q).sort('-createdAt');
    res.json(notes);
  } catch (err) { res.status(500).json([]); }
});

// 4. ADMIN DASHBOARD
app.get('/api/admin/dashboard', async (req, res) => {
  const total = await Case.countDocuments();
  const open = await Case.countDocuments({ status: { $ne: 'Closed' } });
  const hp = await Case.countDocuments({ priority: 'High', status: { $ne: 'Closed' } });
  res.json({ totalCases: total, openCases: open, highPriority: hp });
});

app.post('/api/admin/assign', protect, async (req, res) => {
  const { caseId, investigatorId } = req.body;
  const c = await Case.findById(caseId).populate('reporterId', 'email phone name');
  const inv = await User.findById(investigatorId);
  c.assignedInvestigator = investigatorId;

  c.updates.push({
    status: c.status,
    message: `Officer ${inv.name} has been definitively designated as the lead remote investigator for this operation.`,
    investigatorName: inv.name
  });

  await c.save();
  await User.findByIdAndUpdate(investigatorId, { $inc: { activeCases: 1 } });

  await AuditLog.create({ action: `Mapped Case ${c.caseId} to ${inv.name}`, performedBy: req.user.name });
  if (c.reporterId) {
      sendAlert(c.reporterId.email, c.reporterId.phone, c.caseId, 'Investigator Assigned', `Officer ${inv.name} has been definitively designated as the lead remote investigator for your operation.`, inv.name).catch(console.error);
  }
  
  // Trigger real-time Notification to the Investigator
  sendNotification(investigatorId, `You have been assigned to Case ${c.caseId}`, 'alert');
  
  res.json({ success: true });
});

app.get('/api/admin/investigators', protect, async (req, res) => {
  try {
    const invs = await User.find({ role: 'investigator' }).select('name email');
    const results = await Promise.all(invs.map(async (inv) => {
      const activeCount = await Case.countDocuments({
        assignedInvestigator: inv._id,
        status: { $ne: 'Closed' }
      });
      return { _id: inv._id, name: inv.name, email: inv.email, activeCases: activeCount };
    }));
    res.json(results);
  } catch (e) { res.status(500).json([]); }
});

app.post('/api/admin/investigators', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin access strictly required.' });
    const { name, email, password } = req.body;
    
    // Check if exists
    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already mapped to an existing officer.' });

    const inv = await User.create({ name, email, password, role: 'investigator', activeCases: 0 });
    await AuditLog.create({ action: `Admin manually provisioned Officer: ${name}`, performedBy: req.user.name });
    res.status(201).json(inv);
  } catch (err) {
    res.status(400).json({ message: 'Error provisioning officer.', error: err.message });
  }
});

app.get('/api/admin/audit-logs', async (req, res) => {
  const logs = await AuditLog.find().sort('-createdAt').limit(20);
  res.json(logs);
});

// 5. REPORT GENERATION
app.get('/api/reports/:caseId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admin access strictly required.' });

    // Fetch all unified Case Data!
    const targetCase = await Case.findOne(mongoose.Types.ObjectId.isValid(req.params.caseId) ? { _id: req.params.caseId } : { caseId: req.params.caseId }).populate('assignedInvestigator', 'name');
    if (!targetCase) return res.status(404).json({ message: 'Case not found' });

    const notes = await Note.find({ caseId: targetCase._id }).sort('-createdAt');
    const evidence = await Evidence.find({ caseId: targetCase._id });

    // Initialize PDFStream directly into Response buffers
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=CIS_Report_${targetCase.caseId}.pdf`);
    doc.pipe(res);

    // Document Generation Start
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e40af').text('Central Investigation System - Official Case Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#64748b').text(`Report Generated On: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Section: Case Metadata
    doc.fontSize(14).fillColor('#334155').text('1. Case Overview', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('black')
      .text(`Case Tracking ID: ${targetCase.caseId}`)
      .text(`Subject Name / Alias: ${targetCase.subjectName}`)
      .text(`Age: ${targetCase.age || 'Not Specified'} | Gender: ${targetCase.gender || 'Not Specified'}`)
      .text(`Location of Interest: ${targetCase.location}`)
      .text(`System Priority: ${targetCase.priority}`)
      .text(`Current Legal Status: ${targetCase.status}`);
    doc.moveDown(1.5);

    // Section: Incident
    doc.fontSize(14).fillColor('#334155').text('2. Initial Incident Report', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('black').text(targetCase.description, { width: 400, align: 'justify' });
    doc.moveDown(1.5);

    // Section: Investigator Logs
    doc.fontSize(14).fillColor('#334155').text('3. Authorized Investigator Logs', { underline: true });
    doc.fontSize(11).fillColor('black').text(`Lead Investigator: ${targetCase.assignedInvestigator ? targetCase.assignedInvestigator.name : 'Unassigned'}`);
    doc.moveDown(0.5);

    if (notes.length === 0) {
      doc.fontSize(10).fillColor('gray').text('No investigator notes appended yet.');
    } else {
      notes.forEach(note => {
        doc.fontSize(9).fillColor('#64748b').text(`[${new Date(note.createdAt).toLocaleString()}] ${note.author} (${note.visibility}):`);
        doc.fontSize(10).fillColor('black').text(note.text);
        doc.moveDown(0.5);
      });
    }
    doc.moveDown();

    // Section: Evidence
    doc.fontSize(14).fillColor('#334155').text('4. Captured Evidence Ledger', { underline: true });
    doc.moveDown(0.5);
    if (evidence.length === 0) {
      doc.fontSize(10).fillColor('gray').text('No photographic/documentary evidence was submitted.');
    } else {
      evidence.forEach((ev, idx) => {
        doc.fontSize(10).fillColor('black').text(`Exhibit ${idx + 1}: File Resource -> ${ev.fileUrl} (${ev.fileType})`);
      });
    }

    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: 'Error generating compilation.', error: err.message });
  }
});

// === SERVER BOOTSTRAP ===
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cis_db';
    
    // Connect Mongoose to persistent database
    await mongoose.connect(mongoUri);
    console.log('✅ Persistent MongoDB Connected');

    // --- NOTIFICATIONS API ---
    app.get('/api/notifications', protect, async (req, res) => {
      try {
        const user = await User.findById(req.user._id);
        res.json(user.notifications || []);
      } catch (err) {
        res.status(500).json({ message: 'Error fetching notifications' });
      }
    });

    app.put('/api/notifications/:id/read', protect, async (req, res) => {
      try {
        const user = await User.findById(req.user._id);
        const notif = user.notifications.id(req.params.id);
        if (notif) {
          notif.read = true;
          await user.save();
        }
        res.json(user.notifications);
      } catch (err) {
        res.status(500).json({ message: 'Error marking notification as read' });
      }
    });

    app.put('/api/notifications/read-all', protect, async (req, res) => {
      try {
        const user = await User.findById(req.user._id);
        user.notifications.forEach(n => n.read = true);
        await user.save();
        res.json(user.notifications);
      } catch (err) {
        res.status(500).json({ message: 'Error marking all notifications as read' });
      }
    });

    // Start Live GPS Simulator Loop
    setInterval(async () => {
      try {
        const activeCases = await Case.find({ latitude: { $ne: null }, longitude: { $ne: null }, status: { $ne: 'Closed' } });
        for (let c of activeCases) {
          c.latitude += (Math.random() - 0.5) * 0.0005;
          c.longitude += (Math.random() - 0.5) * 0.0005;
          await Case.updateOne({ _id: c._id }, { $set: { latitude: c.latitude, longitude: c.longitude } });
          io.emit('live_gps_update', { id: c._id.toString(), caseId: c.caseId, latitude: c.latitude, longitude: c.longitude });
        }
      } catch (e) {
        console.error("GPS Simulator Loop Error", e.message);
      }
    }, 2000); // 2 seconds

    server.listen(5000, () => {
      console.log('🚀 Backend API listening unconditionally on port 5000');
    });
  } catch (e) {
    console.error('Fatal Server Error. Is MongoDB running locally?', e);
  }
};

startServer();
