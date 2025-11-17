import twilio from "twilio";
import nodemailer from "nodemailer";
import { settingsKV } from "./storage";
import type { Booking, Room } from "./types";

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<boolean> {
  try {
    const settings = await settingsKV.getItem("settings");
    if (
      !settings?.twilioAccountSid ||
      !settings?.twilioAuthToken ||
      !settings?.twilioWhatsAppFrom
    ) {
      console.warn("Twilio not configured, skipping WhatsApp message");
      return false;
    }

    const client = twilio(settings.twilioAccountSid, settings.twilioAuthToken);
    await client.messages.create({
      from: `whatsapp:${settings.twilioWhatsAppFrom}`,
      to: `whatsapp:${to}`,
      body: message,
    });

    return true;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return false;
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const settings = await settingsKV.getItem("settings");
    if (
      !settings?.smtpHost ||
      !settings?.smtpUser ||
      !settings?.smtpPassword
    ) {
      console.warn("SMTP not configured, skipping email");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    await transporter.sendMail({
      from: settings.smtpFrom || settings.smtpUser,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function notifyAdminNewBooking(
  booking: Booking,
  room: Room
): Promise<void> {
  const settings = await settingsKV.getItem("settings");
  if (!settings) return;

  const message = `
🎤 New Booking Request

Customer: ${booking.fullName}
Date: ${booking.date}
Time: ${booking.startTime}
Duration: ${booking.hours} hour${booking.hours > 1 ? "s" : ""}
Room: ${room.name}
People: ${booking.numberOfPeople}
Mobile: ${booking.mobile}
Email: ${booking.email}
${booking.notes ? `Notes: ${booking.notes}` : ""}

Status: ${booking.status.toUpperCase()}
  `.trim();

  if (settings.adminWhatsApp) {
    await sendWhatsAppMessage(settings.adminWhatsApp, message);
  }

  if (settings.adminEmail) {
    await sendEmail(
      settings.adminEmail,
      "New Booking Request",
      `<pre>${message}</pre>`
    );
  }
}

export async function sendBookingConfirmation(
  booking: Booking,
  room: Room
): Promise<void> {
  const settings = await settingsKV.getItem("settings");
  if (!settings) return;

  const cancellationUrl = `${process.env.APP_URL || "http://localhost:5173"}/cancel/${booking.cancellationToken}`;
  
  const message = `
✅ Booking Confirmed!

${settings.venueName}
${booking.fullName}, your booking is confirmed!

📅 Date: ${booking.date}
🕐 Time: ${booking.startTime}
⏱️ Duration: ${booking.hours} hour${booking.hours > 1 ? "s" : ""}
🚪 Room: ${room.name}
👥 People: ${booking.numberOfPeople}

${booking.totalPrice ? `💰 Total: $${booking.totalPrice}` : ""}
${booking.depositAmount ? `✅ Deposit Paid: $${booking.depositAmount}` : ""}
${booking.remainingAmount ? `⚠️ Remaining: $${booking.remainingAmount}` : ""}

${settings.venueAddress ? `📍 Location: ${settings.venueAddress}` : ""}
${settings.venueLocationLink ? `🗺️ Map: ${settings.venueLocationLink}` : ""}

❌ Cancel booking: ${cancellationUrl}

See you soon! 🎵
  `.trim();

  const htmlMessage = `
    <h2>✅ Booking Confirmed!</h2>
    <h3>${settings.venueName}</h3>
    <p>${booking.fullName}, your booking is confirmed!</p>
    <ul>
      <li><strong>Date:</strong> ${booking.date}</li>
      <li><strong>Time:</strong> ${booking.startTime}</li>
      <li><strong>Duration:</strong> ${booking.hours} hour${booking.hours > 1 ? "s" : ""}</li>
      <li><strong>Room:</strong> ${room.name}</li>
      <li><strong>People:</strong> ${booking.numberOfPeople}</li>
      ${booking.totalPrice ? `<li><strong>Total:</strong> $${booking.totalPrice}</li>` : ""}
      ${booking.depositAmount ? `<li><strong>Deposit Paid:</strong> $${booking.depositAmount}</li>` : ""}
      ${booking.remainingAmount ? `<li><strong>Remaining:</strong> $${booking.remainingAmount}</li>` : ""}
    </ul>
    ${settings.venueAddress ? `<p><strong>Location:</strong> ${settings.venueAddress}</p>` : ""}
    ${settings.venueLocationLink ? `<p><a href="${settings.venueLocationLink}">View on Map</a></p>` : ""}
    <p><a href="${cancellationUrl}">Cancel Booking</a></p>
    <p>See you soon! 🎵</p>
  `;

  if (booking.preferredCommunication === "whatsapp") {
    await sendWhatsAppMessage(booking.mobile, message);
  } else {
    await sendEmail(booking.email, "Booking Confirmed", htmlMessage);
  }
}

export async function sendReminder(
  booking: Booking,
  room: Room,
  hoursBeforeType: "24h" | "2h"
): Promise<void> {
  const settings = await settingsKV.getItem("settings");
  if (!settings) return;

  const isEarly = hoursBeforeType === "24h";
  
  const message = isEarly
    ? `
🎤 Reminder: Booking Tomorrow!

Hi ${booking.fullName}!

Your karaoke session is tomorrow:
📅 ${booking.date} at ${booking.startTime}
🚪 Room: ${room.name}
⏱️ Duration: ${booking.hours} hour${booking.hours > 1 ? "s" : ""}

${booking.remainingAmount ? `⚠️ Balance Due: $${booking.remainingAmount}` : ""}

See you soon! 🎵
    `.trim()
    : `
🎤 Reminder: Booking in 2 Hours!

Hi ${booking.fullName}!

Your karaoke session starts in 2 hours:
🕐 ${booking.startTime}
🚪 Room: ${room.name}

${settings.venueAddress ? `📍 ${settings.venueAddress}` : ""}
${settings.venueLocationLink ? `🗺️ ${settings.venueLocationLink}` : ""}

See you soon! 🎵
    `.trim();

  if (booking.preferredCommunication === "whatsapp") {
    await sendWhatsAppMessage(booking.mobile, message);
  } else {
    await sendEmail(
      booking.email,
      isEarly ? "Reminder: Booking Tomorrow" : "Reminder: Booking in 2 Hours",
      `<pre>${message}</pre>`
    );
  }
}

export async function notifyAdminCancellation(
  booking: Booking,
  room: Room
): Promise<void> {
  const settings = await settingsKV.getItem("settings");
  if (!settings) return;

  const message = `
❌ Booking Cancelled

Customer: ${booking.fullName}
Date: ${booking.date}
Time: ${booking.startTime}
Room: ${room.name}
Mobile: ${booking.mobile}
Email: ${booking.email}

The room is now available again.
  `.trim();

  if (settings.adminWhatsApp) {
    await sendWhatsAppMessage(settings.adminWhatsApp, message);
  }
}
