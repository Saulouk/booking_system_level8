import cron from "node-cron";
import { bookingsKV, roomsKV } from "../rpc/bookings/storage";
import { sendReminder } from "../rpc/bookings/notifications";
import { differenceInHours, parseISO } from "date-fns";

export function startReminderScheduler() {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const bookings = await bookingsKV.getAllItems();
      const confirmedBookings = bookings.filter(
        (b) => b.status === "confirmed"
      );

      for (const booking of confirmedBookings) {
        const bookingDateTime = parseISO(
          `${booking.date}T${booking.startTime}`
        );
        const now = new Date();
        const hoursUntil = differenceInHours(bookingDateTime, now);

        if (hoursUntil <= 24 && hoursUntil > 23 && !booking.reminderSent24h) {
          const room = await roomsKV.getItem(booking.roomId);
          if (room) {
            await sendReminder(booking, room, "24h");
            booking.reminderSent24h = true;
            await bookingsKV.setItem(booking.id, booking);
            console.log(`Sent 24h reminder for booking ${booking.id}`);
          }
        }

        if (hoursUntil <= 2 && hoursUntil > 1 && !booking.reminderSent2h) {
          const room = await roomsKV.getItem(booking.roomId);
          if (room) {
            await sendReminder(booking, room, "2h");
            booking.reminderSent2h = true;
            await bookingsKV.setItem(booking.id, booking);
            console.log(`Sent 2h reminder for booking ${booking.id}`);
          }
        }
      }
    } catch (error) {
      console.error("Error in reminder scheduler:", error);
    }
  });

  console.log("Reminder scheduler started (runs every 15 minutes)");
}
