const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const adminRoutes = require("./routes/adminRoutes");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const spaceRoutes = require("./routes/spaceRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const searchRoutes = require("./routes/searchRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

dotenv.config();

const { startBookingReminder } = require("./services/bookingReminder");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/spaces", spaceRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Smart Space Platform Backend is running"
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // NEW: Start automatic booking reminders
    startBookingReminder();
});
