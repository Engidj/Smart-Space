
const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const pool = db.promise();

function hasManagerAccess(req, res) {
    if (!req.user || !["manager", "admin"].includes(req.user.role)) {
        res.status(403).json({
            message: "Only managers and admins can manage schedules"
        });
        return false;
    }

    if (req.user.role === "manager" && !req.user.organizationId) {
        res.status(403).json({
            message: "Your account is not assigned to an organization"
        });
        return false;
    }

    return true;
}

async function getAuthorizedSpace(spaceId, user) {
    let query = `
        SELECT space_id
        FROM spaces
        WHERE space_id = ?
    `;

    const params = [spaceId];

    if (user.role === "manager") {
        query += " AND organization_id = ?";
        params.push(user.organizationId);
    }

    const [spaces] = await pool.query(query, params);
    return spaces.length > 0;
}

async function getAuthorizedSchedule(scheduleId, user) {
    let query = `
        SELECT s.schedule_id, s.space_id
        FROM schedules s
        JOIN spaces sp ON sp.space_id = s.space_id
        WHERE s.schedule_id = ?
    `;

    const params = [scheduleId];

    if (user.role === "manager") {
        query += " AND sp.organization_id = ?";
        params.push(user.organizationId);
    }

    const [schedules] = await pool.query(query, params);
    return schedules[0] || null;
}

router.post("/", authMiddleware, async (req, res) => {
    try {
        if (!hasManagerAccess(req, res)) return;

        const { space_id, date, start_time, end_time, purpose } = req.body;

        if (!space_id || !date || !start_time || !end_time) {
            return res.status(400).json({
                message: "Space, date, start time and end time are required"
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                message: "Date must be in YYYY-MM-DD format"
            });
        }

        if (start_time >= end_time) {
            return res.status(400).json({
                message: "Start time must be before end time"
            });
        }

        const authorized = await getAuthorizedSpace(space_id, req.user);

        if (!authorized) {
            return res.status(404).json({
                message: "Space not found or you do not have access to it"
            });
        }

        const [conflicts] = await pool.query(
            `SELECT schedule_id
             FROM schedules
             WHERE space_id = ?
             AND date = ?
             AND start_time < ?
             AND end_time > ?`,
            [space_id, date, end_time, start_time]
        );

        if (conflicts.length > 0) {
            return res.status(409).json({
                message: "Space already has a schedule during this time"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO schedules
             (space_id, date, start_time, end_time, purpose)
             VALUES (?, CAST(? AS DATE), ?, ?, ?)`,
            [space_id, date, start_time, end_time, purpose || null]
        );

        res.status(201).json({
            message: "Schedule created successfully",
            scheduleId: result.insertId
        });
    } catch (error) {
        console.error("Add schedule error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/space/:spaceId", async (req, res) => {
    try {
        const { spaceId } = req.params;

        const [schedules] = await pool.query(
            `SELECT
                schedule_id,
                space_id,
                DATE_FORMAT(date, '%Y-%m-%d') AS date,
                start_time,
                end_time,
                purpose
             FROM schedules
             WHERE space_id = ?
             ORDER BY date, start_time`,
            [spaceId]
        );

        res.json({ schedules });
    } catch (error) {
        console.error("Get schedules error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        if (!hasManagerAccess(req, res)) return;

        const { id } = req.params;
        const { date, start_time, end_time, purpose } = req.body;

        if (!date || !start_time || !end_time) {
            return res.status(400).json({
                message: "Date, start time and end time are required"
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                message: "Date must be in YYYY-MM-DD format"
            });
        }

        if (start_time >= end_time) {
            return res.status(400).json({
                message: "Start time must be before end time"
            });
        }

        const schedule = await getAuthorizedSchedule(id, req.user);

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found or you do not have access to it"
            });
        }

        const [conflicts] = await pool.query(
            `SELECT schedule_id
             FROM schedules
             WHERE space_id = ?
             AND date = ?
             AND schedule_id != ?
             AND start_time < ?
             AND end_time > ?`,
            [schedule.space_id, date, id, end_time, start_time]
        );

        if (conflicts.length > 0) {
            return res.status(409).json({
                message: "Space already has a schedule during this time"
            });
        }

        await pool.query(
            `UPDATE schedules
             SET date = CAST(? AS DATE),
                 start_time = ?,
                 end_time = ?,
                 purpose = ?
             WHERE schedule_id = ?`,
            [date, start_time, end_time, purpose || null, id]
        );

        res.json({ message: "Schedule updated successfully" });
    } catch (error) {
        console.error("Update schedule error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!hasManagerAccess(req, res)) return;

        const { id } = req.params;
        const schedule = await getAuthorizedSchedule(id, req.user);

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found or you do not have access to it"
            });
        }

        await pool.query(
            "DELETE FROM schedules WHERE schedule_id = ?",
            [id]
        );

        res.json({ message: "Schedule deleted successfully" });
    } catch (error) {
        console.error("Delete schedule error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
