const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const logActivity = require("../utils/activityLogger");

const router = express.Router();

router.get(
    "/users",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const [users] = await db.promise().query(
                `SELECT user_id, name, email, role, organization_id
                 FROM users
                 ORDER BY user_id DESC`
            );

            res.json({ users });
        } catch (error) {
            console.error("Get users error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);



router.put(
    "/users/:id/role",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const userId = Number(req.params.id);
            const { role } = req.body;
            const allowedRoles = ["user", "manager", "admin"];

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({
                    message: "Invalid user ID"
                });
            }

            if (!allowedRoles.includes(role)) {
                return res.status(400).json({
                    message: "Invalid role"
                });
            }

            let organizationId = null;

            if (role === "manager") {
                organizationId = Number(req.body.organization_id);

                if (
                    !Number.isInteger(organizationId) ||
                    organizationId <= 0
                ) {
                    return res.status(400).json({
                        message: "Select an organization for the manager"
                    });
                }

                const [organizations] = await db.promise().query(
                    "SELECT organization_id FROM organizations WHERE organization_id = ?",
                    [organizationId]
                );

                if (organizations.length === 0) {
                    return res.status(400).json({
                        message: "Selected organization does not exist"
                    });
                }
            }

            const [users] = await db.promise().query(
                "SELECT user_id FROM users WHERE user_id = ?",
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            await db.promise().query(
                `UPDATE users
                 SET role = ?, organization_id = ?
                 WHERE user_id = ?`,
                [role, organizationId, userId]
            );

            await logActivity(
                req.user.userId,
                "USER_ROLE_UPDATED",
                `Changed user ID ${userId} role to ${role}` +
                    (role === "manager"
                        ? ` and assigned organization ID ${organizationId}`
                        : "")
            );

            res.json({
                message: role === "manager"
                    ? "Manager role and organization assigned successfully"
                    : "User role updated successfully"
            });
        } catch (error) {
            console.error("Update role error:", error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);



router.put(
    "/users/:id/organization",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const userId = Number(req.params.id);
            const organizationId = Number(req.body.organization_id);

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(400).json({ message: "Invalid user ID" });
            }

            if (!Number.isInteger(organizationId) || organizationId <= 0) {
                return res.status(400).json({
                    message: "Valid organization ID is required"
                });
            }

            const [users] = await db.promise().query(
                "SELECT user_id, role FROM users WHERE user_id = ?",
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            if (users[0].role !== "manager") {
                return res.status(400).json({
                    message: "Only managers can be assigned to an organization"
                });
            }

            const [organizations] = await db.promise().query(
                "SELECT organization_id FROM organizations WHERE organization_id = ?",
                [organizationId]
            );

            if (organizations.length === 0) {
                return res.status(404).json({
                    message: "Organization not found"
                });
            }

            await db.promise().query(
                "UPDATE users SET organization_id = ? WHERE user_id = ?",
                [organizationId, userId]
            );

            await logActivity(
                req.user.userId,
                "MANAGER_ORGANIZATION_ASSIGNED",
                `Assigned manager ID ${userId} to organization ID ${organizationId}`
            );

            res.json({
                message: "Manager organization assigned successfully"
            });
        } catch (error) {
            console.error("Assign organization error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.get(
    "/spaces",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const [spaces] = await db.promise().query(
                `SELECT
                    s.space_id,
                    s.organization_id,
                    s.name,
                    s.type,
                    s.capacity,
                    s.location,
                    o.name AS organization_name
                 FROM spaces s
                 LEFT JOIN organizations o
                    ON s.organization_id = o.organization_id
                 ORDER BY s.space_id DESC`
            );

            res.json({ spaces });
        } catch (error) {
            console.error("Get admin spaces error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.get(
    "/bookings",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const { start_date, end_date } = req.query;

            const isValidDate = (value) => {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
                    return false;
                }

                const date = new Date(`${value}T00:00:00Z`);

                return (
                    !Number.isNaN(date.getTime()) &&
                    date.toISOString().slice(0, 10) === value
                );
            };

            if (
                (start_date && !isValidDate(start_date)) ||
                (end_date && !isValidDate(end_date))
            ) {
                return res.status(400).json({
                    message: "Dates must be valid and use YYYY-MM-DD format"
                });
            }

            if (start_date && end_date && start_date > end_date) {
                return res.status(400).json({
                    message: "Start date cannot be after end date"
                });
            }

            let query = `
                SELECT
                    b.booking_id,
                    u.name AS user_name,
                    u.email AS user_email,
                    s.name AS space_name,
                    b.date,
                    b.start_time,
                    b.end_time,
                    b.purpose,
                    b.status
                FROM bookings b
                JOIN users u ON b.user_id = u.user_id
                JOIN spaces s ON b.space_id = s.space_id
            `;

            const conditions = [];
            const values = [];

            if (start_date) {
                conditions.push("b.date >= ?");
                values.push(start_date);
            }

            if (end_date) {
                conditions.push("b.date <= ?");
                values.push(end_date);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(" AND ")}`;
            }

            query += " ORDER BY b.date DESC, b.booking_id DESC";

            const [bookings] = await db.promise().query(query, values);

            res.json({ bookings });
        } catch (error) {
            console.error("Get admin bookings error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.post(
    "/organizations",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const { name, type, location } = req.body;

            if (
                typeof name !== "string" ||
                typeof type !== "string" ||
                typeof location !== "string" ||
                !name.trim() ||
                !type.trim() ||
                !location.trim()
            ) {
                return res.status(400).json({
                    message: "All fields are required"
                });
            }

            const [result] = await db.promise().query(
                "INSERT INTO organizations (name, type, location) VALUES (?, ?, ?)",
                [name.trim(), type.trim(), location.trim()]
            );

            await logActivity(
                req.user.userId,
                "ORGANIZATION_CREATED",
                `Created organization ID ${result.insertId}: ${name.trim()}`
            );

            res.status(201).json({
                message: "Organization created successfully",
                organization_id: result.insertId
            });
        } catch (error) {
            console.error("Create organization error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.get(
    "/organizations",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const [organizations] = await db.promise().query(
                `SELECT organization_id, name, type, location
                 FROM organizations
                 ORDER BY organization_id ASC`
            );

            res.json({ organizations });
        } catch (error) {
            console.error("Get organizations error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.put(
    "/organizations/:id",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const organizationId = Number(req.params.id);
            const { name, type, location } = req.body;

            if (!Number.isInteger(organizationId) || organizationId <= 0) {
                return res.status(400).json({
                    message: "Invalid organization ID"
                });
            }

            if (
                typeof name !== "string" ||
                typeof type !== "string" ||
                typeof location !== "string" ||
                !name.trim() ||
                !type.trim() ||
                !location.trim()
            ) {
                return res.status(400).json({
                    message: "All fields are required"
                });
            }

            if (
                name.trim().length > 100 ||
                type.trim().length > 50 ||
                location.trim().length > 150
            ) {
                return res.status(400).json({
                    message: "One or more fields exceed the allowed length"
                });
            }

            const [result] = await db.promise().query(
                `UPDATE organizations
                 SET name = ?, type = ?, location = ?
                 WHERE organization_id = ?`,
                [name.trim(), type.trim(), location.trim(), organizationId]
            );

            if (result.affectedRows === 0) {
                const [existing] = await db.promise().query(
                    "SELECT organization_id FROM organizations WHERE organization_id = ?",
                    [organizationId]
                );

                if (existing.length === 0) {
                    return res.status(404).json({
                        message: "Organization not found"
                    });
                }
            }

            await logActivity(
                req.user.userId,
                "ORGANIZATION_UPDATED",
                `Updated organization ID ${organizationId}: ${name.trim()}`
            );

            res.json({ message: "Organization updated successfully" });
        } catch (error) {
            console.error("Update organization error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.delete(
    "/organizations/:id",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const organizationId = Number(req.params.id);

            if (!Number.isInteger(organizationId) || organizationId <= 0) {
                return res.status(400).json({
                    message: "Invalid organization ID"
                });
            }

            const [organizations] = await db.promise().query(
                "SELECT organization_id FROM organizations WHERE organization_id = ?",
                [organizationId]
            );

            if (organizations.length === 0) {
                return res.status(404).json({
                    message: "Organization not found"
                });
            }

            const [spaces] = await db.promise().query(
                "SELECT space_id FROM spaces WHERE organization_id = ? LIMIT 1",
                [organizationId]
            );

            if (spaces.length > 0) {
                return res.status(409).json({
                    message: "Cannot delete this organization because it has spaces. Remove or reassign its spaces first."
                });
            }

            const [users] = await db.promise().query(
                "SELECT user_id FROM users WHERE organization_id = ? LIMIT 1",
                [organizationId]
            );

            if (users.length > 0) {
                return res.status(409).json({
                    message: "Cannot delete this organization because users are associated with it."
                });
            }

            await db.promise().query(
                "DELETE FROM organizations WHERE organization_id = ?",
                [organizationId]
            );

            await logActivity(
                req.user.userId,
                "ORGANIZATION_DELETED",
                `Deleted organization ID ${organizationId}`
            );

            res.json({ message: "Organization deleted successfully" });
        } catch (error) {
            console.error("Delete organization error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.get(
    "/analytics",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const [summary] = await db.promise().query(`
                SELECT
                    COUNT(*) AS total_bookings,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings
                FROM bookings
            `);

            const [popularSpaces] = await db.promise().query(`
                SELECT
                    s.space_id,
                    s.name AS space_name,
                    COUNT(b.booking_id) AS booking_count
                FROM spaces s
                LEFT JOIN bookings b ON b.space_id = s.space_id
                GROUP BY s.space_id, s.name
                ORDER BY booking_count DESC, s.name ASC
                LIMIT 10
            `);

            const [monthlyBookings] = await db.promise().query(`
                SELECT
                    DATE_FORMAT(date, '%Y-%m') AS month,
                    COUNT(*) AS booking_count
                FROM bookings
                GROUP BY DATE_FORMAT(date, '%Y-%m')
                ORDER BY month ASC
            `);

            res.json({
                summary: summary[0],
                popularSpaces,
                monthlyBookings
            });
        } catch (error) {
            console.error("Get analytics error:", error);
            res.status(500).json({
                message: "Failed to load analytics"
            });
        }
    }
);

router.get(
    "/activity-logs",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const [logs] = await db.promise().query(`
                SELECT
                    al.log_id,
                    al.user_id,
                    u.name AS user_name,
                    u.email AS user_email,
                    al.action,
                    al.details,
                    al.created_at
                FROM activity_logs al
                LEFT JOIN users u ON al.user_id = u.user_id
                ORDER BY al.created_at DESC, al.log_id DESC
                LIMIT 200
            `);

            res.json({ logs });
        } catch (error) {
            console.error("Get activity logs error:", error);
            res.status(500).json({
                message: "Failed to load activity logs"
            });
        }
    }
);

module.exports = router;