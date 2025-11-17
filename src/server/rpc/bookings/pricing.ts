import { settingsKV } from "./storage";
import { promoCodesKV } from "./storage";

export async function calculatePrice(
  numberOfPeople: number,
  hours: number,
  startTime: string,
  promoCode?: string,
  customPriceOverride?: number
): Promise<{
  basePrice: number;
  finalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  discount: number;
  isPeakTime: boolean;
}> {
  const settings = await settingsKV.getItem("settings");
  
  // If admin has set a custom price override, use that
  if (customPriceOverride && customPriceOverride > 0) {
    const depositPercentage = settings?.depositPercentage || 30;
    const depositAmount = Math.round((customPriceOverride * depositPercentage) / 100);
    const remainingAmount = customPriceOverride - depositAmount;

    return {
      basePrice: customPriceOverride,
      finalPrice: customPriceOverride,
      depositAmount,
      remainingAmount,
      discount: 0,
      isPeakTime: false,
    };
  }

  // Default pricing: £20 per person for 3 hours, £5 per person for each additional hour
  const baseHours = settings?.baseHours || 3;
  const pricePerPersonBase = settings?.pricePerPersonBase || 20;
  const pricePerPersonAdditional = settings?.pricePerPersonAdditional || 5;

  let basePrice = 0;
  
  if (hours <= baseHours) {
    // Within base hours
    basePrice = numberOfPeople * pricePerPersonBase;
  } else {
    // Base hours + additional hours
    const additionalHours = hours - baseHours;
    basePrice = numberOfPeople * (pricePerPersonBase + (additionalHours * pricePerPersonAdditional));
  }
  
  let isPeakTime = false;
  
  // Apply peak time multiplier if configured
  if (settings?.peakHours && settings.peakHours.length > 0) {
    const hour = parseInt(startTime.split(":")[0]);
    isPeakTime = settings.peakHours.includes(hour);
    
    if (isPeakTime && settings.peakPriceMultiplier) {
      basePrice *= settings.peakPriceMultiplier;
    }
  }

  let discount = 0;
  
  // Apply promo code discount if provided
  if (promoCode) {
    const promo = await promoCodesKV.getItem(promoCode.toLowerCase());
    if (promo && promo.active) {
      if (!promo.expiresAt || new Date(promo.expiresAt) > new Date()) {
        discount = (basePrice * promo.discountPercentage) / 100;
      }
    }
  }

  const finalPrice = Math.round(basePrice - discount);
  const depositPercentage = settings?.depositPercentage || 30;
  const depositAmount = Math.round((finalPrice * depositPercentage) / 100);
  const remainingAmount = finalPrice - depositAmount;

  return {
    basePrice: Math.round(basePrice),
    finalPrice,
    depositAmount,
    remainingAmount,
    discount: Math.round(discount),
    isPeakTime,
  };
}
