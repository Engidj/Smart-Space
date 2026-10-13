const express = require("express");
const db = require("../config/db");

const router = express.Router();

// ==================== SEARCH AVAILABLE SPACES ====================

router.get("/", async (req, res) => {
    try {
        const {
            date,
            start_time,
            end_time,
            capacity,
            location,
            facility
        } = req.query;

        // Required fields
        if (!date || !start_time || !end_time || !capacity) {
            return res.status(400).json({
                message: "Date, start time, end time and capacity are required"
            });
        }

        // Validate time
        if (start_time >= end_time) {
            return res.status(400).json({
                message: "Start time must be before end time"
            });
        }

        let query = `
            SELECT DISTINCT
                s.space_id,
                s.organization_id,
                s.name,
                s.type,
                s.capacity,
                s.location
            FROM spaces s
        `;

        const params = [];

        // Join facilities only when requested
        if (facility) {
            query += `
                INNER JOIN space_facilities sf
                    ON s.space_id = sf.space_id
                INNER JOIN facilities f
                    ON sf.facility_id = f.facility_id
            `;
        }

        query += `
            WHERE s.capacity >= ?
        `;

        params.push(Number(capacity));

        // Location filter
        if (location) {
            query += ` AND s.location = ?`;
            params.push(location);
        }

        // Facility filter
        if (facility) {
            query += ` AND f.name = ?`;
            params.push(facility);
        }

        // Exclude spaces having schedule conflicts
        query += `
            AND NOT EXISTS (
                SELECT 1
                FROM schedules sc
                WHERE sc.space_id = s.space_id
                AND sc.date = ?
                AND sc.start_time < ?
                AND sc.end_time > ?
            )
        `;

        params.push(date, end_time, start_time);

        // Exclude spaces having booking conflicts
        query += `
            AND NOT EXISTS (
                SELECT 1
                FROM bookings b
                WHERE b.space_id = s.space_id
                AND b.date = ?
                AND b.status != 'cancelled'
                AND b.start_time < ?
                AND b.end_time > ?
            )
        `;

        params.push(date, end_time, start_time);

        query += `
            ORDER BY s.capacity ASC
        `;

        const [spaces] = await db.promise().query(query, params);

        res.json({
            count: spaces.length,
            spaces
        });

    } catch (error) {
        console.error("Search spaces error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;