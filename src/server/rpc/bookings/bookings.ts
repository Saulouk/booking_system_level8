import { os, call } from "@orpc/server";
import { z } from "zod";
import {
  bookingsKV,
  roomsKV,
  customersKV,
  settingsKV,
  promoCodesKV,
} from "./storage";
import {
  BookingSchema,
  CreateBookingInputSchema,
  RoomSchema,
  CustomerSchema,
  SettingsSchema,
  PromoCodeSchema,
} from "./types";
import {
  notifyAdminNewBooking,
  sendBookingConfirmation,
  notifyAdminCancellation,
} from "./notifications";
import { calculatePrice } from "./pricing";
import Stripe from "stripe";

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

function generateCancellationToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const createBooking = os
  .input(CreateBookingInputSchema)
  .handler(async ({ input }) => {
      const rooms = await roomsKV.getAllItems();
      if (!rooms || rooms.length === 0) {
        throw new Error("No rooms available");
      }

      const availableRoom = await findAvailableRoom(
        input.date,
        input.startTime,
        input.hours
      );

      if (!availableRoom) {
        throw new Error("No rooms available for the selected time slot");
      }

      const pricing = await calculatePrice(
        input.numberOfPeople,
        input.hours,
        input.startTime,
        input.promoCode
      );

      let customer = await findCustomerByMobileOrEmail(
        input.mobile,
        input.email
      );

      if (!customer) {
        customer = {
          id: generateId(),
          fullName: input.fullName,
          mobile: input.mobile,
          email: input.email,
          totalVisits: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await customersKV.setItem(customer.id, customer);
      }

      const booking = {
        id: generateId(),
        date: input.date,
        startTime: input.startTime,
        hours: input.hours,
        numberOfPeople: input.numberOfPeople,
        fullName: input.fullName,
        mobile: input.mobile,
        email: input.email,
        notes: input.notes,
        preferredCommunication: input.preferredCommunication,
        roomId: availableRoom.id,
        status: "pending" as const,
        totalPrice: pricing.finalPrice,
        depositAmount: pricing.depositAmount,
        depositPaid: false,
        remainingAmount: pricing.remainingAmount,
        cancellationToken: generateCancellationToken(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerId: customer.id,
        reminderSent24h: false,
        reminderSent2h: false,
      };

      await bookingsKV.setItem(booking.id, booking);
      await notifyAdminNewBooking(booking, availableRoom);

      return booking;
  });

const listBookings = os
  .input(
    z.object({
      status: z.string().optional(),
      date: z.string().optional(),
      roomId: z.string().optional(),
      customerName: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
      let bookings = await bookingsKV.getAllItems();

      if (input.status) {
        bookings = bookings.filter((b) => b.status === input.status);
      }
      if (input.date) {
        bookings = bookings.filter((b) => b.date === input.date);
      }
      if (input.roomId) {
        bookings = bookings.filter((b) => b.roomId === input.roomId);
      }
      if (input.customerName) {
        const searchName = input.customerName.toLowerCase();
        bookings = bookings.filter((b) =>
          b.fullName.toLowerCase().includes(searchName)
        );
      }

      return bookings.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  });

const getBooking = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
      return await bookingsKV.getItem(input.id);
  });

const approveBooking = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
      const booking = await bookingsKV.getItem(input.id);
      if (!booking) throw new Error("Booking not found");

      const settings = await settingsKV.getItem("settings");
      if (!settings?.stripeSecretKey) {
        throw new Error("Stripe not configured");
      }

      const stripe = new Stripe(settings.stripeSecretKey);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `Karaoke Booking Deposit - ${booking.date}`,
                description: `Room booking for ${booking.hours} hour(s) on ${booking.date} at ${booking.startTime}`,
              },
              unit_amount: Math.round((booking.depositAmount || 0) * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL || "http://localhost:5173"}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || "http://localhost:5173"}/booking-cancelled`,
        metadata: {
          bookingId: booking.id,
        },
      });

      booking.status = "approved";
      booking.stripePaymentIntentId = session.id;
      booking.updatedAt = new Date().toISOString();
      await bookingsKV.setItem(booking.id, booking);

      return { paymentUrl: session.url! };
  });

const confirmPayment = os
  .input(z.object({ sessionId: z.string() }))
  .handler(async ({ input }) => {
      const bookings = await bookingsKV.getAllItems();
      const booking = bookings.find(
        (b) => b.stripePaymentIntentId === input.sessionId
      );

      if (!booking) throw new Error("Booking not found");

      booking.status = "confirmed";
      booking.depositPaid = true;
      booking.updatedAt = new Date().toISOString();
      await bookingsKV.setItem(booking.id, booking);

      const room = await roomsKV.getItem(booking.roomId);
      if (room) {
        await sendBookingConfirmation(booking, room);
      }

      const customer = await customersKV.getItem(booking.customerId!);
      if (customer) {
        customer.totalVisits += 1;
        customer.updatedAt = new Date().toISOString();
        await customersKV.setItem(customer.id, customer);
      }

      return booking;
  });

const rejectBooking = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
      const booking = await bookingsKV.getItem(input.id);
      if (!booking) throw new Error("Booking not found");

      booking.status = "rejected";
      booking.updatedAt = new Date().toISOString();
      await bookingsKV.setItem(booking.id, booking);

      return booking;
  });

const cancelBooking = os
  .input(z.object({ token: z.string() }))
  .handler(async ({ input }) => {
      const bookings = await bookingsKV.getAllItems();
      const booking = bookings.find((b) => b.cancellationToken === input.token);

      if (!booking) throw new Error("Booking not found");
      if (booking.status === "cancelled") {
        throw new Error("Booking already cancelled");
      }

      booking.status = "cancelled";
      booking.updatedAt = new Date().toISOString();
      await bookingsKV.setItem(booking.id, booking);

      const room = await roomsKV.getItem(booking.roomId);
      if (room) {
        await notifyAdminCancellation(booking, room);
      }

      return booking;
  });

const updateBooking = os
  .input(
    z.object({
      id: z.string(),
      date: z.string().optional(),
      startTime: z.string().optional(),
      hours: z.number().optional(),
      numberOfPeople: z.number().optional(),
      roomId: z.string().optional(),
      notes: z.string().optional(),
      customPriceOverride: z.number().optional(),
      adminNotes: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
      const booking = await bookingsKV.getItem(input.id);
      if (!booking) throw new Error("Booking not found");

      if (input.date) booking.date = input.date;
      if (input.startTime) booking.startTime = input.startTime;
      if (input.hours) booking.hours = input.hours;
      if (input.numberOfPeople) booking.numberOfPeople = input.numberOfPeople;
      if (input.roomId) booking.roomId = input.roomId;
      if (input.notes !== undefined) booking.notes = input.notes;
      if (input.adminNotes !== undefined) booking.adminNotes = input.adminNotes;
      
      // Handle custom price override
      if (input.customPriceOverride !== undefined) {
        booking.customPriceOverride = input.customPriceOverride;
        
        // Recalculate pricing with override
        const pricing = await calculatePrice(
          booking.numberOfPeople,
          booking.hours,
          booking.startTime,
          undefined,
          input.customPriceOverride
        );
        
        booking.totalPrice = pricing.finalPrice;
        booking.depositAmount = pricing.depositAmount;
        booking.remainingAmount = pricing.remainingAmount;
      }

      booking.updatedAt = new Date().toISOString();
      await bookingsKV.setItem(booking.id, booking);

      return booking;
  });

const calculateEstimate = os
  .input(
    z.object({
      hours: z.number(),
      numberOfPeople: z.number(),
      startTime: z.string(),
      promoCode: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
      return await calculatePrice(
        input.numberOfPeople,
        input.hours,
        input.startTime,
        input.promoCode
      );
  });

const subscribeToBookings = os.handler(async function* ({ signal }) {
  yield call(listBookings, {}, { signal });
  for await (const _event of bookingsKV.subscribe()) {
    yield call(listBookings, {}, { signal });
  }
});

export const router = {
  createBooking,
  listBookings,
  getBooking,
  approveBooking,
  confirmPayment,
  rejectBooking,
  cancelBooking,
  updateBooking,
  calculateEstimate,
  live: {
    bookings: subscribeToBookings,
  },
};

async function findAvailableRoom(
  date: string,
  startTime: string,
  hours: number
): Promise<any> {
  const rooms = await roomsKV.getAllItems();
  const allBookings = await bookingsKV.getAllItems();

  const activeBookings = allBookings.filter(
    (b) =>
      b.date === date &&
      (b.status === "pending" ||
        b.status === "approved" ||
        b.status === "confirmed")
  );

  const startHour = parseInt(startTime.split(":")[0]);
  const endHour = startHour + hours;

  for (const room of rooms) {
    const roomBookings = activeBookings.filter((b) => b.roomId === room.id);

    const hasConflict = roomBookings.some((b) => {
      const bookingStart = parseInt(b.startTime.split(":")[0]);
      const bookingEnd = bookingStart + b.hours;

      return (
        (startHour >= bookingStart && startHour < bookingEnd) ||
        (endHour > bookingStart && endHour <= bookingEnd) ||
        (startHour <= bookingStart && endHour >= bookingEnd)
      );
    });

    if (!hasConflict) {
      return room;
    }
  }

  return null;
}

async function findCustomerByMobileOrEmail(
  mobile: string,
  email: string
): Promise<any> {
  const customers = await customersKV.getAllItems();
  return customers.find((c) => c.mobile === mobile || c.email === email);
}
