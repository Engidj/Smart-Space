
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                message: "Server configuration error"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({
                message: "Invalid or expired session. Please log in again."
            });
        }

        if (!decoded.userId) {
            return res.status(401).json({
                message: "Invalid session"
            });
        }

        const [users] = await db.promise().query(
            `SELECT user_id, name, email, role, organization_id
             FROM users
             WHERE user_id = ?
             LIMIT 1`,
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "User account not found"
            });
        }

        const user = users[0];

        req.user = {
            userId: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organization_id === null
                ? null
                : Number(user.organization_id)
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(500).json({
            message: "Authentication failed"
        });
    }
};

module.exports = authMiddleware;
