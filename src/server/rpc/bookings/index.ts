import { router as bookingsRouter } from "./bookings";
import { router as roomsRouter } from "./rooms";
import { router as customersRouter } from "./customers";
import { router as settingsRouter } from "./settings";

export const bookingSystem = {
  bookings: bookingsRouter,
  rooms: roomsRouter,
  customers: customersRouter,
  settings: settingsRouter,
};
