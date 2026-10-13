const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const logActivity = require("../utils/activityLogger");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    async (req, res) => {
        try {
            const { name, type, capacity, location } = req.body;
            const isAdmin = req.user.role === "admin";

            let organizationId = isAdmin
                ? Number(req.body.organization_id)
                : Number(req.user.organizationId);

            if (!name || !type || !capacity || !location) {
                return res.status(400).json({
                    message: "All space details are required"
                });
            }

            if (!Number.isFinite(Number(capacity)) || Number(capacity) <= 0) {
                return res.status(400).json({
                    message: "Capacity must be greater than 0"
                });
            }

            if (!Number.isInteger(organizationId) || organizationId <= 0) {
                return res.status(400).json({
                    message: isAdmin
                        ? "A valid organization is required"
                        : "Your account is not assigned to an organization"
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

            const [result] = await db.promise().query(
                `INSERT INTO spaces
                (organization_id, name, type, capacity, location)
                VALUES (?, ?, ?, ?, ?)`,
                [organizationId, name, type, Number(capacity), location]
            );

            await logActivity(
                req.user.userId,
                "SPACE_CREATED",
                `Created space ID ${result.insertId}: ${name}`
            );

            res.status(201).json({
                message: "Space created successfully",
                spaceId: result.insertId
            });
        } catch (error) {
            console.error("Add space error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.get("/", authMiddleware, async (req, res) => {
    try {
        let query = `
            SELECT space_id, organization_id, name, type, capacity, location
            FROM spaces
        `;
        const params = [];

        if (req.user.role === "manager") {
            if (!req.user.organizationId) {
                return res.status(403).json({
                    message: "Your account is not assigned to an organization"
                });
            }

            query += " WHERE organization_id = ?";
            params.push(req.user.organizationId);
        } else if (req.user.role !== "admin" && req.user.role !== "user") {
            return res.status(403).json({ message: "Access denied" });
        }

        query += " ORDER BY space_id DESC";

        const [spaces] = await db.promise().query(query, params);
        res.json({ spaces });
    } catch (error) {
        console.error("Get spaces error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const [spaces] = await db.promise().query(
            `SELECT space_id, organization_id, name, type, capacity, location
             FROM spaces
             WHERE space_id = ?`,
            [req.params.id]
        );

        if (spaces.length === 0) {
            return res.status(404).json({ message: "Space not found" });
        }

        res.json({ space: spaces[0] });
    } catch (error) {
        console.error("Get space error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    async (req, res) => {
        try {
            const spaceId = Number(req.params.id);
            const { name, type, capacity, location } = req.body;
            const isAdmin = req.user.role === "admin";

            if (!Number.isInteger(spaceId) || spaceId <= 0) {
                return res.status(400).json({ message: "Invalid space ID" });
            }

            if (!name || !type || !capacity || !location) {
                return res.status(400).json({
                    message: "All space details are required"
                });
            }

            if (!Number.isFinite(Number(capacity)) || Number(capacity) <= 0) {
                return res.status(400).json({
                    message: "Capacity must be greater than 0"
                });
            }

            const [spaces] = await db.promise().query(
                "SELECT space_id, organization_id FROM spaces WHERE space_id = ?",
                [spaceId]
            );

            if (spaces.length === 0) {
                return res.status(404).json({ message: "Space not found" });
            }

            const existingSpace = spaces[0];

            if (
                !isAdmin &&
                (
                    !req.user.organizationId ||
                    Number(existingSpace.organization_id) !== Number(req.user.organizationId)
                )
            ) {
                return res.status(403).json({ message: "Access denied" });
            }

            const organizationId = isAdmin
                ? Number(req.body.organization_id)
                : Number(req.user.organizationId);

            if (!Number.isInteger(organizationId) || organizationId <= 0) {
                return res.status(400).json({
                    message: "A valid organization is required"
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
                `UPDATE spaces
                 SET organization_id = ?, name = ?, type = ?, capacity = ?, location = ?
                 WHERE space_id = ?`,
                [organizationId, name, type, Number(capacity), location, spaceId]
            );

            await logActivity(
                req.user.userId,
                "SPACE_UPDATED",
                `Updated space ID ${spaceId}: ${name}`
            );

            res.json({ message: "Space updated successfully" });
        } catch (error) {
            console.error("Update space error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    async (req, res) => {
        try {
            const spaceId = Number(req.params.id);

            if (!Number.isInteger(spaceId) || spaceId <= 0) {
                return res.status(400).json({ message: "Invalid space ID" });
            }

            const [spaces] = await db.promise().query(
                `SELECT space_id, name, organization_id
                 FROM spaces
                 WHERE space_id = ?`,
                [spaceId]
            );

            if (spaces.length === 0) {
                return res.status(404).json({ message: "Space not found" });
            }

            const space = spaces[0];

            if (
                req.user.role !== "admin" &&
                (
                    !req.user.organizationId ||
                    Number(space.organization_id) !== Number(req.user.organizationId)
                )
            ) {
                return res.status(403).json({ message: "Access denied" });
            }

            const [bookings] = await db.promise().query(
                "SELECT booking_id FROM bookings WHERE space_id = ? LIMIT 1",
                [spaceId]
            );

            if (bookings.length > 0) {
                return res.status(409).json({
                    message: "Cannot delete this space because it has booking records."
                });
            }

            const [facilities] = await db.promise().query(
                "SELECT space_id FROM space_facilities WHERE space_id = ? LIMIT 1",
                [spaceId]
            );

            if (facilities.length > 0) {
                return res.status(409).json({
                    message: "Cannot delete this space because it has assigned facilities."
                });
            }

            await db.promise().query(
                "DELETE FROM spaces WHERE space_id = ?",
                [spaceId]
            );

            await logActivity(
                req.user.userId,
                "SPACE_DELETED",
                `Deleted space ID ${spaceId}: ${space.name}`
            );

            res.json({ message: "Space deleted successfully" });
        } catch (error) {
            console.error("Delete space error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;
