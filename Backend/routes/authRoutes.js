
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = db.promise();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPassword(password) {
    return password.length >= 8 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /\d/.test(password);
}

function hashOtp(otp) {
    return crypto.createHash("sha256").update(otp).digest("hex");
}

router.post("/register", async (req, res) => {
    try {
        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                message: "Name must be under 100 characters"
            });
        }

        if (!validEmail(email)) {
            return res.status(400).json({
                message: "Enter a valid email address"
            });
        }

        if (!validPassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and contain uppercase, lowercase and a number"
            });
        }

        const [existing] = await pool.query(
            "SELECT user_id, email_verified FROM users WHERE email = ?",
            [email]
        );

        if (existing.length && existing[0].email_verified) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = hashOtp(otp);
        const passwordHash = await bcrypt.hash(password, 12);

        let userId;

        if (existing.length) {
            userId = existing[0].user_id;

            await pool.query(
                `UPDATE users
                 SET name = ?, password = ?, email_verification_otp_hash = ?,
                     email_verification_expires = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
                 WHERE user_id = ? AND email_verified = 0`,
                [name, passwordHash, otpHash, userId]
            );
        } else {
            const [result] = await pool.query(
                `INSERT INTO users
                 (name, email, password, role, email_verified,
                  email_verification_otp_hash, email_verification_expires)
                 VALUES (?, ?, ?, 'user', 0, ?,
                         DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
                [name, email, passwordHash, otpHash]
            );

            userId = result.insertId;
        }

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Smart Space Platform - Email Verification",
                text: `Your verification code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`
            });
        } catch (mailError) {
            console.error("OTP email failed:", mailError.message);

            await pool.query(
                `UPDATE users
                 SET email_verification_otp_hash = NULL,
                     email_verification_expires = NULL
                 WHERE user_id = ? AND email_verified = 0`,
                [userId]
            );

            return res.status(503).json({
                message: "Could not send verification email. Check email configuration and try again."
            });
        }

        res.status(201).json({
            message: "Verification code sent to your email",
            email
        });
    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

router.post("/verify-email", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const otp = String(req.body.otp || "").trim();

        if (!validEmail(email) || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: "Enter a valid email and 6-digit OTP"
            });
        }

        const [users] = await pool.query(
            `SELECT user_id, email_verification_otp_hash
             FROM users
             WHERE email = ?
               AND email_verified = 0
               AND email_verification_expires > NOW()`,
            [email]
        );

        if (!users.length || !users[0].email_verification_otp_hash) {
            return res.status(400).json({
                message: "Invalid or expired verification code"
            });
        }

        const submittedHash = hashOtp(otp);
        const savedHash = users[0].email_verification_otp_hash;

        const matches = crypto.timingSafeEqual(
            Buffer.from(submittedHash, "hex"),
            Buffer.from(savedHash, "hex")
        );

        if (!matches) {
            return res.status(400).json({
                message: "Invalid or expired verification code"
            });
        }

        await pool.query(
            `UPDATE users
             SET email_verified = 1,
                 email_verification_otp_hash = NULL,
                 email_verification_expires = NULL
             WHERE user_id = ?`,
            [users[0].user_id]
        );

        res.json({
            message: "Email verified successfully. You can now log in."
        });
    } catch (error) {
        console.error("Email verification error:", error);

        res.status(500).json({
            message: "Email verification failed"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!validEmail(email) || !password) {
            return res.status(400).json({
                message: "Enter a valid email and password"
            });
        }

        const [users] = await pool.query(
            `SELECT user_id, name, email, password, role, email_verified
             FROM users WHERE email = ?`,
            [email]
        );

        if (!users.length) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.email_verified) {
            return res.status(403).json({
                message: "Please verify your email before logging in"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                message: "Server authentication is not configured"
            });
        }

        const token = jwt.sign(
            {
                userId: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Login successful",
            user: {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT user_id, name, email, role
             FROM users WHERE user_id = ?`,
            [req.user.userId]
        );

        if (!users.length) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error("Profile error:", error);

        res.status(500).json({
            message: "Could not load profile"
        });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.json({ message: "Logout successful" });
});

module.exports = router;
