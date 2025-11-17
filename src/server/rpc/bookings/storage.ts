import { createKV } from "../../lib/create-kv";
import type { Booking, Room, Customer, Settings, PromoCode } from "./types";

export const bookingsKV = createKV<Booking>("bookings");
export const roomsKV = createKV<Room>("rooms");
export const customersKV = createKV<Customer>("customers");
export const settingsKV = createKV<Settings>("settings");
export const promoCodesKV = createKV<PromoCode>("promo-codes");
