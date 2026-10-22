require("dotenv").config();

const cron = require("node-cron");
const nodemailer = require("nodemailer");
const db = require("../config/db");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function processBookingReminders() {
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const [bookings] = await connection.query(
      `SELECT
                b.booking_id,
                b.date,
                b.start_time,
                b.end_time,
                b.purpose,
                b.reminder_sent_at,
                u.name AS user_name,
                u.email AS user_email,
                s.name AS space_name,
                s.location AS space_location
             FROM bookings b
             INNER JOIN users u ON u.user_id = b.user_id
             INNER JOIN spaces s ON s.space_id = b.space_id
             WHERE b.status <> 'cancelled'
               AND b.reminder_sent_at IS NULL
               AND TIMESTAMP(b.date, b.start_time)
                   BETWEEN DATE_ADD(NOW(), INTERVAL 4 HOUR)
                       AND DATE_ADD(NOW(), INTERVAL 4 HOUR) + INTERVAL 1 MINUTE
             FOR UPDATE`,
    );

    const claimed = [];

    for (const booking of bookings) {
      // Conditional update prevents duplicate claims.
      const [result] = await connection.query(
        `UPDATE bookings
                 SET reminder_sent_at = '2000-01-01 00:00:00'
                 WHERE booking_id = ?
                   AND reminder_sent_at IS NULL
                   AND status <> 'cancelled'`,
        [booking.booking_id],
      );

      if (result.affectedRows === 1) {
        claimed.push(booking);
      }
    }

    await connection.commit();

    for (const booking of claimed) {
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: booking.user_email,
          subject: "Reminder: Your Smart Space booking is in 4 hours",
          text: `Hi ${booking.user_name},

This is a reminder that your Smart Space booking starts in approximately 4 hours.

Space: ${booking.space_name}
Location: ${booking.space_location || "Not specified"}
Date: ${booking.date}
Start time: ${booking.start_time}
End time: ${booking.end_time}
Purpose: ${booking.purpose || "General Booking"}

Please plan accordingly.

Regards,
Smart Space Team`,
        });
        await db.promise().query(
          `UPDATE bookings
                     SET reminder_sent_at = NOW()
                     WHERE booking_id = ?
                       AND reminder_sent_at = '2000-01-01 00:00:00'`,
          [booking.booking_id],
        );

        console.log(`Reminder sent for booking ${booking.booking_id}`);
      } catch (error) {
        console.error(
          `Reminder failed for booking ${booking.booking_id}:`,
          error.message,
        );

        await db.promise().query(
          `UPDATE bookings
                     SET reminder_sent_at = NULL
                     WHERE booking_id = ?
                       AND reminder_sent_at = '2000-01-01 00:00:00'`,
          [booking.booking_id],
        );
      }
    }
  } catch (error) {
    await connection.rollback();
    console.error("Booking reminder worker error:", error);
  } finally {
    connection.release();
  }
}

function startBookingReminder() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("Gmail credentials are missing from .env");
    return;
  }

  cron.schedule(
    "* * * * *",
    () => {
      processBookingReminders().catch((error) => {
        console.error("Reminder scheduler error:", error);
      });
    },
    {
      timezone: "Asia/Kolkata",
    },
  );

  console.log("Booking reminder scheduler started.");
}

module.exports = { startBookingReminder };
