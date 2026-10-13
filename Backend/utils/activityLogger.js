
const db = require("../config/db");

const logActivity = async (userId, action, details) => {
    try {
        await db.promise().query(
            `INSERT INTO activity_logs (user_id, action, details)
             VALUES (?, ?, ?)`,
            [userId || null, action, details || null]
        );
    } catch (error) {
        console.error("Activity logging error:", error);
    }
};

module.exports = logActivity;
