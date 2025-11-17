import { os } from "@orpc/server";
import { z } from "zod";
import { settingsKV, promoCodesKV } from "./storage";
import { SettingsSchema, PromoCodeSchema } from "./types";

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

const getSettings = os.handler(async () => {
  return await settingsKV.getItem("settings");
});

const updateSettings = os
  .input(SettingsSchema.partial())
  .handler(async ({ input }) => {
    let settings = await settingsKV.getItem("settings");

    if (!settings) {
      settings = {
        depositPercentage: 30,
        adminWhatsApp: "",
        adminEmail: "",
        peakPriceMultiplier: 1.5,
        offPeakDiscount: 0,
        venueName: "Karaoke Paradise",
        baseHours: 3,
        pricePerPersonBase: 20,
        pricePerPersonAdditional: 5,
        currency: "GBP",
        currencySymbol: "£",
      };
    }

    const updatedSettings = { ...settings, ...input };
    await settingsKV.setItem("settings", updatedSettings);

    return updatedSettings;
  });

const listPromoCodes = os.handler(async () => {
  const codes = await promoCodesKV.getAllItems();
  return codes.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

const createPromoCode = os
  .input(
    z.object({
      code: z.string(),
      discountPercentage: z.number(),
      expiresAt: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
    const promoCode = {
      id: generateId(),
      code: input.code.toLowerCase(),
      discountPercentage: input.discountPercentage,
      active: true,
      expiresAt: input.expiresAt,
      createdAt: new Date().toISOString(),
    };

    await promoCodesKV.setItem(promoCode.code, promoCode);
    return promoCode;
  });

const updatePromoCode = os
  .input(
    z.object({
      code: z.string(),
      active: z.boolean().optional(),
      discountPercentage: z.number().optional(),
      expiresAt: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
    const promoCode = await promoCodesKV.getItem(input.code.toLowerCase());
    if (!promoCode) throw new Error("Promo code not found");

    if (input.active !== undefined) promoCode.active = input.active;
    if (input.discountPercentage !== undefined)
      promoCode.discountPercentage = input.discountPercentage;
    if (input.expiresAt !== undefined) promoCode.expiresAt = input.expiresAt;

    await promoCodesKV.setItem(promoCode.code, promoCode);
    return promoCode;
  });

const deletePromoCode = os
  .input(z.object({ code: z.string() }))
  .handler(async ({ input }) => {
    await promoCodesKV.removeItem(input.code.toLowerCase());
    return true;
  });

export const router = {
  getSettings,
  updateSettings,
  listPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
};
