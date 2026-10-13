const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==================== CREATE BOOKING ====================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            space_id,
            date,
            start_time,
            end_time,
            purpose
        } = req.body;

        if (!space_id || !date || !start_time || !end_time) {
            return res.status(400).json({
                message: "Space, date, start time and end time are required"
            });
        }

        if (start_time >= end_time) {
            return res.status(400).json({
                message: "Start time must be before end time"
            });
        }

        // Check space exists
        const [spaces] = await db.promise().query(
            "SELECT space_id FROM spaces WHERE space_id = ?",
            [space_id]
        );

        if (spaces.length === 0) {
            return res.status(404).json({
                message: "Space not found"
            });
        }

        // Check schedule conflict
        const [scheduleConflicts] = await db.promise().query(
            `SELECT schedule_id
             FROM schedules
             WHERE space_id = ?
             AND date = ?
             AND start_time < ?
             AND end_time > ?`,
            [
                space_id,
                date,
                end_time,
                start_time
            ]
        );

        if (scheduleConflicts.length > 0) {
            return res.status(409).json({
                message: "Space is occupied during this time"
            });
        }

        // Check booking conflict
        const [bookingConflicts] = await db.promise().query(
            `SELECT booking_id
             FROM bookings
             WHERE space_id = ?
             AND date = ?
             AND status != 'cancelled'
             AND start_time < ?
             AND end_time > ?`,
            [
                space_id,
                date,
                end_time,
                start_time
            ]
        );

        if (bookingConflicts.length > 0) {
            return res.status(409).json({
                message: "Space is already booked during this time"
            });
        }

        // Create booking
        const [result] = await db.promise().query(
            `INSERT INTO bookings
             (user_id, space_id, date, start_time, end_time, purpose, status)
             VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
            [
                req.user.userId,
                space_id,
                date,
                start_time,
                end_time,
                purpose || null
            ]
        );

        res.status(201).json({
            message: "Space booked successfully",
            bookingId: result.insertId
        });

    } catch (error) {
        console.error("Create booking error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==================== MY BOOKINGS ====================

router.get("/my", authMiddleware, async (req, res) => {
    try {
        const [bookings] = await db.promise().query(
            `SELECT
                b.booking_id,
                b.space_id,
                s.name AS space_name,
                s.type,
                s.location,
                DATE_FORMAT(b.date, '%Y-%m-%d') AS date,
                b.start_time,
                b.end_time,
                b.purpose,
                b.status
             FROM bookings b
             INNER JOIN spaces s
                ON b.space_id = s.space_id
             WHERE b.user_id = ?
             ORDER BY b.date DESC, b.start_time DESC`,
            [req.user.userId]
        );

        res.json({
            bookings
        });

    } catch (error) {
        console.error("Get bookings error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==================== CANCEL BOOKING ====================

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.promise().query(
            `UPDATE bookings
             SET status = 'cancelled'
             WHERE booking_id = ?
             AND user_id = ?
             AND status != 'cancelled'`,
            [id, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.json({
            message: "Booking cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel booking error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;