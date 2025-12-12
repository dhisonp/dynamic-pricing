export interface PricingFactors {
  daysUntilEvent: number;
  percentSold: number;
  demandScore: number;
}

export interface PricingBreakdown {
  basePrice: number;
  timeDecayMultiplier: number;
  scarcityMultiplier: number;
  demandMultiplier: number;
  finalPrice: number;
}

const BASE_PRICE = 100;

export function calculateTimeDecayMultiplier(daysUntilEvent: number): number {
  if (daysUntilEvent > 7) {
    return 1.0 + (30 - daysUntilEvent) * 0.01;
  }

  const exponentialFactor = Math.pow(2, (7 - daysUntilEvent) / 7);
  return 1.0 + (exponentialFactor - 1) * 0.5;
}

export function calculateScarcityMultiplier(percentSold: number): number {
  if (percentSold < 50) {
    return 1.0;
  } else if (percentSold < 70) {
    return 1.0 + (percentSold - 50) * 0.005;
  } else if (percentSold < 90) {
    return 1.1 + (percentSold - 70) * 0.01;
  } else {
    return 1.3 + (percentSold - 90) * 0.02;
  }
}

export function calculateDemandMultiplier(demandScore: number): number {
  return 1.0 + (demandScore - 1) * 0.05;
}

export function calculateDynamicPrice(factors: PricingFactors): PricingBreakdown {
  const timeDecayMultiplier = calculateTimeDecayMultiplier(factors.daysUntilEvent);
  const scarcityMultiplier = calculateScarcityMultiplier(factors.percentSold);
  const demandMultiplier = calculateDemandMultiplier(factors.demandScore);

  const finalPrice = BASE_PRICE * timeDecayMultiplier * scarcityMultiplier * demandMultiplier;

  return {
    basePrice: BASE_PRICE,
    timeDecayMultiplier,
    scarcityMultiplier,
    demandMultiplier,
    finalPrice: Math.round(finalPrice * 100) / 100,
  };
}
