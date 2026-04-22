function toNumber(value: any): number | null {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function formatCurrencyAmount(value: any) {
  const amount = toNumber(value);

  if (amount === null) {
    return 'On request';
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getDisplayAmount(value: any) {
  const formatted = formatCurrencyAmount(value);
  return formatted === 'On request' ? formatted : `₹${formatted}`;
}

export function getActivePricingPlans(ground: any) {
  return (ground?.pricing_plans || [])
    .filter((plan: any) => plan?.is_active)
    .sort((first: any, second: any) => {
      const firstDuration = Number(first?.duration_hours || 0);
      const secondDuration = Number(second?.duration_hours || 0);

      if (firstDuration !== secondDuration) {
        return firstDuration - secondDuration;
      }

      return Number(first?.price || 0) - Number(second?.price || 0);
    });
}

export function getDurationLabel(plan: any) {
  if (plan?.duration_display) {
    return plan.duration_display;
  }

  const durationHours = Number(plan?.duration_hours || 0);

  if (!durationHours) {
    return 'Custom duration';
  }

  return durationHours === 1 ? '1 hour slot' : `${durationHours} hour slot`;
}

export function getEffectivePlanPrice(plan: any, bookingDate?: string) {
  if (!plan) {
    return null;
  }

  const isWeekend = bookingDate ? new Date(bookingDate).getDay() >= 5 : false;
  const weekendPrice = toNumber(plan?.weekend_price);

  if (isWeekend && weekendPrice !== null) {
    return weekendPrice;
  }

  return toNumber(plan?.price);
}

export function getGroundPriceHeadline(ground: any) {
  const activePlans = getActivePricingPlans(ground);
  const lowestPlan = activePlans[0];

  if (lowestPlan) {
    return {
      amount: getDisplayAmount(lowestPlan.price),
      duration: getDurationLabel(lowestPlan),
      supportsWeekendPricing: activePlans.some((plan: any) => plan?.weekend_price),
    };
  }

  if (ground?.min_price?.amount) {
    return {
      amount: getDisplayAmount(ground.min_price.amount),
      duration: ground.min_price.duration || 'Starting price',
      supportsWeekendPricing: Boolean(ground?.pricing_summary?.supports_weekend_pricing),
    };
  }

  if (ground?.pricing_summary?.lowest_price) {
    return {
      amount: getDisplayAmount(ground.pricing_summary.lowest_price),
      duration: 'Starting price',
      supportsWeekendPricing: Boolean(ground?.pricing_summary?.supports_weekend_pricing),
    };
  }

  return {
    amount: 'On request',
    duration: 'Add pricing to book',
    supportsWeekendPricing: false,
  };
}

/**
 * Convert a 24-hour time string like "06:00" or "14:30:00" to "6:00 AM" or "2:30 PM".
 */
export function formatTime12h(time?: string): string {
  if (!time) return '--:--';

  const parts = time.split(':');
  let hour = Number(parts[0]);
  const minute = parts[1] || '00';

  if (isNaN(hour)) return time;

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return `${displayHour}:${minute} ${ampm}`;
}

/**
 * Calculate the total price for a per_hour pricing plan across multiple slots.
 * If the plan is not per_hour, returns the single plan price.
 */
export function getMultiSlotPrice(
  plan: any,
  totalDurationHours: number,
  bookingDate?: string,
): number | null {
  if (!plan) return null;

  const unitPrice = getEffectivePlanPrice(plan, bookingDate);
  if (unitPrice === null) return null;

  if (plan.duration_type === 'per_hour') {
    return unitPrice * totalDurationHours;
  }

  return unitPrice;
}
