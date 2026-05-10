export interface ProratedUpgrade {
  currentTierPrice: number;
  newTierPrice: number;
  priceDifference: number;
  daysRemaining: number;
  daysInCycle: number;
  proratedCharge: number;
  renewalDate: Date;
  newMonthlyPrice: number;
}

export const calculateProratedUpgrade = (
  currentTierPrice: number,
  newTierPrice: number,
  expiresAt: Date | string
): ProratedUpgrade => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiresAt);
  expiry.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.max(
    1,
    Math.ceil((expiry.getTime() - today.getTime()) / msPerDay)
  );

  const daysInCycle = 30;
  const priceDifference = Math.max(0, newTierPrice - currentTierPrice);
  const dailyDifference = priceDifference / daysInCycle;
  const proratedCharge = Math.max(1, Math.round(dailyDifference * Math.min(daysRemaining, daysInCycle)));

  return {
    currentTierPrice,
    newTierPrice,
    priceDifference,
    daysRemaining,
    daysInCycle,
    proratedCharge,
    renewalDate: expiry,
    newMonthlyPrice: newTierPrice,
  };
};

export const formatProratedSummary = (calc: ProratedUpgrade): string => {
  const days = Math.min(calc.daysRemaining, calc.daysInCycle);
  return `₹${calc.priceDifference} difference × ${days} days ÷ ${calc.daysInCycle} days`;
};
