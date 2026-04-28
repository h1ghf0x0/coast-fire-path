export interface CoastInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  annualExpenses: number;
  expectedReturn: number; // percent, e.g. 7
  withdrawalRate: number; // percent, e.g. 4
}

export interface CoastResults {
  fireNumber: number;
  coastNumber: number;
  progressPct: number; // 0-100
  yearsToRetirement: number;
  projectedAtRetirement: number;
  coastAge: number | null; // age at which current savings (no contributions) reach coast
  shortfall: number; // amount still needed to coast today
  trajectory: { age: number; coasting: number; threshold: number }[];
}

export function calculateCoast(inputs: CoastInputs): CoastResults {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    annualExpenses,
    expectedReturn,
    withdrawalRate,
  } = inputs;

  const r = expectedReturn / 100;
  const swr = withdrawalRate / 100;
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  const fireNumber = annualExpenses / swr;
  const growthFactor = Math.pow(1 + r, yearsToRetirement);
  const coastNumber = fireNumber / growthFactor;
  const projectedAtRetirement = currentSavings * growthFactor;
  const progressPct = Math.min(100, (currentSavings / coastNumber) * 100);
  const shortfall = Math.max(0, coastNumber - currentSavings);

  // Age at which current savings (with no contributions) reach the FIRE number
  let coastAge: number | null = null;
  if (currentSavings > 0 && r > 0 && currentSavings < fireNumber) {
    const yrs = Math.log(fireNumber / currentSavings) / Math.log(1 + r);
    const age = currentAge + yrs;
    coastAge = age <= retirementAge + 50 ? age : null;
  } else if (currentSavings >= fireNumber) {
    coastAge = currentAge;
  }

  const trajectory: { age: number; coasting: number; threshold: number }[] = [];
  for (let i = 0; i <= yearsToRetirement; i++) {
    const age = currentAge + i;
    const coasting = currentSavings * Math.pow(1 + r, i);
    const threshold = fireNumber / Math.pow(1 + r, yearsToRetirement - i);
    trajectory.push({ age, coasting, threshold });
  }

  return {
    fireNumber,
    coastNumber,
    progressPct,
    yearsToRetirement,
    projectedAtRetirement,
    coastAge,
    shortfall,
    trajectory,
  };
}

// Monthly savings needed to reach Coast FIRE number by a target age
export function monthlySavingsToCoast(
  inputs: CoastInputs,
  targetCoastAge: number,
): number | null {
  const { currentAge, currentSavings, expectedReturn } = inputs;
  const { coastNumber } = calculateCoast(inputs);
  const years = targetCoastAge - currentAge;
  if (years <= 0) return null;

  const r = expectedReturn / 100;
  const monthlyRate = r / 12;
  const months = years * 12;
  const futureFromCurrent = currentSavings * Math.pow(1 + r, years);
  const needed = coastNumber - futureFromCurrent;
  if (needed <= 0) return 0;

  if (monthlyRate === 0) return needed / months;
  // Future value of ordinary annuity: PMT * ((1+i)^n - 1) / i
  const factor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return needed / factor;
}

export function formatCurrency(n: number, opts?: { compact?: boolean }): string {
  if (!isFinite(n)) return "—";
  if (opts?.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
