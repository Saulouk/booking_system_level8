import { settingsKV } from "./storage";
import { promoCodesKV } from "./storage";

export async function calculatePrice(
  roomHourlyRate: number,
  hours: number,
  startTime: string,
  promoCode?: string
): Promise<{
  basePrice: number;
  finalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  discount: number;
  isPeakTime: boolean;
}> {
  const settings = await settingsKV.getItem("settings");
  
  let basePrice = roomHourlyRate * hours;
  let isPeakTime = false;
  
  if (settings?.peakHours && settings.peakHours.length > 0) {
    const hour = parseInt(startTime.split(":")[0]);
    isPeakTime = settings.peakHours.includes(hour);
    
    if (isPeakTime && settings.peakPriceMultiplier) {
      basePrice *= settings.peakPriceMultiplier;
    }
  }

  let discount = 0;
  
  if (promoCode) {
    const promo = await promoCodesKV.getItem(promoCode.toLowerCase());
    if (promo && promo.active) {
      if (!promo.expiresAt || new Date(promo.expiresAt) > new Date()) {
        discount = (basePrice * promo.discountPercentage) / 100;
      }
    }
  }

  const finalPrice = basePrice - discount;
  const depositPercentage = settings?.depositPercentage || 30;
  const depositAmount = Math.round((finalPrice * depositPercentage) / 100);
  const remainingAmount = finalPrice - depositAmount;

  return {
    basePrice,
    finalPrice,
    depositAmount,
    remainingAmount,
    discount,
    isPeakTime,
  };
}
