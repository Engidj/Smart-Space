const express = require("express");
const db = require("../config/db");
const roleMiddleware = require("../middleware/roleMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/purposes", authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT DISTINCT TRIM(purpose) AS purpose
             FROM bookings
             WHERE purpose IS NOT NULL
             AND TRIM(purpose) <> ''
             ORDER BY purpose ASC`
        );

        res.json({
            purposes: rows.map((row) => row.purpose)
        });
    } catch (error) {
        console.error("Get booking purposes error:", error);

        res.status(500).json({
            message: "Failed to load booking purposes"
        });
    }
});

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

        const [spaces] = await db.promise().query(
            "SELECT space_id FROM spaces WHERE space_id = ?",
            [space_id]
        );

        if (spaces.length === 0) {
            return res.status(404).json({
                message: "Space not found"
            });
        }

        const [scheduleConflicts] = await db.promise().query(
            `SELECT schedule_id
             FROM schedules
             WHERE space_id = ?
             AND date = ?
             AND start_time < ?
             AND end_time > ?`,
            [space_id, date, end_time, start_time]
        );

        if (scheduleConflicts.length > 0) {
            return res.status(409).json({
                message: "Space is occupied during this time"
            });
        }

        const [bookingConflicts] = await db.promise().query(
            `SELECT booking_id
             FROM bookings
             WHERE space_id = ?
             AND date = ?
             AND status != 'cancelled'
             AND start_time < ?
             AND end_time > ?`,
            [space_id, date, end_time, start_time]
        );

        if (bookingConflicts.length > 0) {
            return res.status(409).json({
                message: "Space is already booked during this time"
            });
        }

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
                purpose && purpose.trim()
                    ? purpose.trim()
                    : "General Booking"
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

        res.json({ bookings });

    } catch (error) {
        console.error("Get bookings error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

router.get(
    "/manager",
    authMiddleware,
    roleMiddleware("manager"),
    async (req, res) => {
        try {
            if (!req.user.organizationId) {
                return res.status(403).json({
                    message: "Your account is not assigned to an organization"
                });
            }

            const [bookings] = await db.promise().query(
                `SELECT
                    b.booking_id,
                    b.user_id,
                    u.name AS user_name,
                    u.email AS user_email,
                    s.space_id,
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
                 INNER JOIN users u
                    ON b.user_id = u.user_id
                 WHERE s.organization_id = ?
                 ORDER BY b.date DESC, b.start_time DESC`,
                [req.user.organizationId]
            );

            res.json({ bookings });
        } catch (error) {
            console.error("Get manager bookings error:", error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

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