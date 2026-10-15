const express = require("express");
const db = require("../config/db");
const roleMiddleware = require("../middleware/roleMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Facility name is required"
            });
        }

        const [existing] = await db.promise().query(
            "SELECT facility_id FROM facilities WHERE name = ?",
            [name]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Facility already exists"
            });
        }

        const [result] = await db.promise().query(
            "INSERT INTO facilities (name) VALUES (?)",
            [name]
        );

        res.status(201).json({
            message: "Facility created successfully",
            facilityId: result.insertId
        });

    } catch (error) {
        console.error("Add facility error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
router.get("/", async (req, res) => {
    try {
        const [facilities] = await db.promise().query(
            "SELECT facility_id, name FROM facilities ORDER BY name"
        );

        res.json({
            facilities
        });

    } catch (error) {
        console.error("Get facilities error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});



router.post(
    "/space/:spaceId",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    async (req, res) => {
        try {
            const spaceId = Number(req.params.spaceId);
            const facilityId = Number(req.body.facilityId);
            const isAdmin = req.user.role === "admin";

            if (!Number.isInteger(spaceId) || spaceId <= 0) {
                return res.status(400).json({
                    message: "Invalid space ID"
                });
            }

            if (!Number.isInteger(facilityId) || facilityId <= 0) {
                return res.status(400).json({
                    message: "Valid facility ID is required"
                });
            }

            const [spaces] = await db.promise().query(
                `SELECT space_id, organization_id
                 FROM spaces
                 WHERE space_id = ?`,
                [spaceId]
            );

            if (spaces.length === 0) {
                return res.status(404).json({
                    message: "Space not found"
                });
            }

            if (
                !isAdmin &&
                (
                    !req.user.organizationId ||
                    Number(spaces[0].organization_id) !==
                        Number(req.user.organizationId)
                )
            ) {
                return res.status(403).json({
                    message: "You cannot assign facilities to another organization's space"
                });
            }

            const [facilities] = await db.promise().query(
                `SELECT facility_id
                 FROM facilities
                 WHERE facility_id = ?`,
                [facilityId]
            );

            if (facilities.length === 0) {
                return res.status(404).json({
                    message: "Facility not found"
                });
            }

            const [existing] = await db.promise().query(
                `SELECT facility_id
                 FROM space_facilities
                 WHERE space_id = ? AND facility_id = ?`,
                [spaceId, facilityId]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    message: "Facility already assigned to this space"
                });
            }

            await db.promise().query(
                `INSERT INTO space_facilities
                 (space_id, facility_id)
                 VALUES (?, ?)`,
                [spaceId, facilityId]
            );

            res.status(201).json({
                message: "Facility assigned to space successfully"
            });
        } catch (error) {
            console.error("Assign facility error:", error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);



router.post("/space/:spaceId", authMiddleware, async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { facilityId } = req.body;

        if (!facilityId) {
            return res.status(400).json({
                message: "Facility ID is required"
            });
        }

        const [spaces] = await db.promise().query(
            "SELECT space_id FROM spaces WHERE space_id = ?",
            [spaceId]
        );

        if (spaces.length === 0) {
            return res.status(404).json({
                message: "Space not found"
            });
        }

        const [facilities] = await db.promise().query(
            "SELECT facility_id FROM facilities WHERE facility_id = ?",
            [facilityId]
        );

        if (facilities.length === 0) {
            return res.status(404).json({
                message: "Facility not found"
            });
        }

        const [existing] = await db.promise().query(
            `SELECT * FROM space_facilities
             WHERE space_id = ? AND facility_id = ?`,
            [spaceId, facilityId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Facility already assigned to this space"
            });
        }

        await db.promise().query(
            `INSERT INTO space_facilities
             (space_id, facility_id)
             VALUES (?, ?)`,
            [spaceId, facilityId]
        );

        res.status(201).json({
            message: "Facility assigned to space successfully"
        });

    } catch (error) {
        console.error("Assign facility error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});



router.get("/space/:spaceId", async (req, res) => {
    try {
        const { spaceId } = req.params;

        const [facilities] = await db.promise().query(
            `SELECT
                f.facility_id,
                f.name
             FROM facilities f
             INNER JOIN space_facilities sf
                ON f.facility_id = sf.facility_id
             WHERE sf.space_id = ?
             ORDER BY f.name`,
            [spaceId]
        );

        res.json({
            facilities
        });

    } catch (error) {
        console.error("Get space facilities error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;