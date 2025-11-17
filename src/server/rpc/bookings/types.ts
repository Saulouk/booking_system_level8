import { z } from "zod";

export const BookingStatusSchema = z.enum([
  "pending",
  "approved",
  "confirmed",
  "cancelled",
  "rejected",
]);

export const CommunicationPreferenceSchema = z.enum(["whatsapp", "email"]);

export const BookingSchema = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  hours: z.number().min(1).max(12),
  numberOfPeople: z.number().min(1),
  fullName: z.string().min(1),
  mobile: z.string().min(1),
  email: z.string().email(),
  notes: z.string().optional(),
  preferredCommunication: CommunicationPreferenceSchema,
  roomId: z.string(),
  status: BookingStatusSchema,
  totalPrice: z.number().optional(),
  depositAmount: z.number().optional(),
  depositPaid: z.boolean().default(false),
  remainingAmount: z.number().optional(),
  stripePaymentIntentId: z.string().optional(),
  cancellationToken: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  customerId: z.string().optional(),
  reminderSent24h: z.boolean().default(false),
  reminderSent2h: z.boolean().default(false),
  customPriceOverride: z.number().optional(),
  adminNotes: z.string().optional(),
});

export const CreateBookingInputSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  hours: z.number().min(1).max(12),
  numberOfPeople: z.number().min(1),
  fullName: z.string().min(1),
  mobile: z.string().min(1),
  email: z.string().email(),
  notes: z.string().optional(),
  preferredCommunication: CommunicationPreferenceSchema,
  promoCode: z.string().optional(),
});

export const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number(),
  hourlyRate: z.number(),
  order: z.number(),
  createdAt: z.string(),
});

export const CustomerSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  mobile: z.string(),
  email: z.string().email(),
  totalVisits: z.number().default(0),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SettingsSchema = z.object({
  depositPercentage: z.number().min(0).max(100).default(30),
  adminWhatsApp: z.string(),
  adminEmail: z.string().email(),
  peakHours: z.array(z.number()).optional(),
  peakPriceMultiplier: z.number().default(1.5),
  offPeakDiscount: z.number().default(0),
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  whatsappAccessToken: z.string().optional(),
  whatsappPhoneNumberId: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpFrom: z.string().optional(),
  venueName: z.string().default("Karaoke Paradise"),
  venueAddress: z.string().optional(),
  venueLocationLink: z.string().optional(),
  baseHours: z.number().default(3),
  pricePerPersonBase: z.number().default(20),
  pricePerPersonAdditional: z.number().default(5),
  currency: z.string().default("GBP"),
  currencySymbol: z.string().default("£"),
});

export const PromoCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  discountPercentage: z.number().min(0).max(100),
  active: z.boolean().default(true),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
});

export type Booking = z.infer<typeof BookingSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type PromoCode = z.infer<typeof PromoCodeSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type CommunicationPreference = z.infer<
  typeof CommunicationPreferenceSchema
>;
