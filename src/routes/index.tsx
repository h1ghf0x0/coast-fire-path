import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateCoast,
  formatCurrency,
  monthlySavingsToCoast,
  type CoastInputs,
} from "@/lib/coast-fire";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Coast FIRE Calculator — Horizon Line" },
      {
        name: "description",
        content:
          "Calculate your Coast FIRE number: the amount you need today to stop saving and still retire on schedule. Visualize your trajectory.",
      },
      { property: "og:title", content: "Coast FIRE Calculator — Horizon Line" },
      {
        property: "og:description",
        content:
          "Find the structural point where today's portfolio sustains your retirement — without saving another dollar.",
      },
    ],
  }),
});

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  error?: string | null;
  min?: number;
  max?: number;
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  error,
  min,
  max,
}: NumberFieldProps) {
  const invalid = !!error;
  return (
    <div>
      <span className="text-xs text-zinc-500 block">{label}</span>
      <div
        className={`flex items-center border-b transition-colors ${
          invalid
            ? "border-horizon"
            : "border-zinc-200 focus-within:border-horizon"
        }`}
      >
        {prefix && <span className="text-zinc-400 pr-1">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          aria-invalid={invalid}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            onChange(Number.isFinite(v) ? v : 0);
          }}
          className="w-full bg-transparent py-2 text-2xl outline-none tabular-nums"
        />
        {suffix && <span className="text-zinc-400 pl-1">{suffix}</span>}
      </div>
      {error && (
        <p
          role="alert"
          className="text-[10px] uppercase tracking-widest text-horizon mt-2 leading-relaxed"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface ValidationErrors {
  currentAge?: string;
  retirementAge?: string;
  currentSavings?: string;
  annualExpenses?: string;
  expectedReturn?: string;
  withdrawalRate?: string;
  targetCoastAge?: string;
}

function validate(inputs: CoastInputs, targetCoastAge: number): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!Number.isFinite(inputs.currentAge) || inputs.currentAge <= 0) {
    errors.currentAge = "Enter an age greater than 0";
  } else if (inputs.currentAge > 120) {
    errors.currentAge = "Age must be 120 or below";
  }

  if (!Number.isFinite(inputs.retirementAge) || inputs.retirementAge <= 0) {
    errors.retirementAge = "Enter a retirement age";
  } else if (inputs.retirementAge <= inputs.currentAge) {
    errors.retirementAge = "Must be after your current age";
  } else if (inputs.retirementAge > 120) {
    errors.retirementAge = "Retirement age must be 120 or below";
  }

  if (inputs.currentSavings < 0) {
    errors.currentSavings = "Savings cannot be negative";
  }

  if (!Number.isFinite(inputs.annualExpenses) || inputs.annualExpenses <= 0) {
    errors.annualExpenses = "Enter your annual expenses";
  }

  if (!Number.isFinite(inputs.expectedReturn)) {
    errors.expectedReturn = "Enter an expected return";
  } else if (inputs.expectedReturn <= 0) {
    errors.expectedReturn = "Return must be greater than 0%";
  } else if (inputs.expectedReturn > 30) {
    errors.expectedReturn = "Return above 30% is unrealistic";
  }

  if (!Number.isFinite(inputs.withdrawalRate) || inputs.withdrawalRate <= 0) {
    errors.withdrawalRate = "Withdrawal rate must be greater than 0%";
  } else if (inputs.withdrawalRate > 20) {
    errors.withdrawalRate = "Rate above 20% is unsustainable";
  }

  if (
    Number.isFinite(targetCoastAge) &&
    Number.isFinite(inputs.currentAge) &&
    targetCoastAge <= inputs.currentAge
  ) {
    errors.targetCoastAge = "Target must be after current age";
  }

  return errors;
}


function Index() {
  const [inputs, setInputs] = useState<CoastInputs>({
    currentAge: 31,
    retirementAge: 62,
    currentSavings: 184200,
    annualExpenses: 64000,
    expectedReturn: 7.2,
    withdrawalRate: 4,
  });

  const [targetCoastAge, setTargetCoastAge] = useState<number>(36);

  const errors = useMemo(() => validate(inputs, targetCoastAge), [inputs, targetCoastAge]);
  const inputsValid =
    !errors.currentAge &&
    !errors.retirementAge &&
    !errors.currentSavings &&
    !errors.annualExpenses &&
    !errors.expectedReturn &&
    !errors.withdrawalRate;

  const results = useMemo(() => calculateCoast(inputs), [inputs]);
  const monthlyNeeded = useMemo(
    () =>
      inputsValid && !errors.targetCoastAge
        ? monthlySavingsToCoast(inputs, targetCoastAge)
        : null,
    [inputs, targetCoastAge, inputsValid, errors.targetCoastAge],
  );

  const coastReached = inputsValid && inputs.currentSavings >= results.coastNumber;
  const set = <K extends keyof CoastInputs>(k: K, v: CoastInputs[K]) =>
    setInputs((p) => ({ ...p, [k]: v }));

  return (
    <div className="min-h-dvh bg-paper text-ink selection:bg-horizon selection:text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-5 bg-paper/80 backdrop-blur border-b border-blueprint">
        <div className="flex items-center gap-8">
          <span className="text-sm font-medium tracking-tighter uppercase">
            Horizon Line / 01
          </span>
          <span className="hidden md:inline text-xs uppercase tracking-widest text-zinc-500">
            Coast FIRE Instrument
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="size-2 bg-horizon rounded-full animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-medium">
            Live Calculations
          </span>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto">
        {/* Hero */}
        <section className="px-6 md:px-8 pt-16 md:pt-24 pb-12 border-b border-blueprint">
          <div className="max-w-4xl">
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.85] mb-8">
              Draft your <br />
              freedom.
            </h1>
            <p className="max-w-[55ch] text-base md:text-lg text-zinc-600 leading-relaxed">
              Coast FIRE is the structural point where your current portfolio
              will grow to sustain your lifestyle by retirement age — without
              another dollar saved. This is the blueprint for a life where work
              becomes optional.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] border-b border-blueprint">
          {/* Inputs */}
          <div className="lg:col-span-5 p-6 md:p-8 lg:border-r border-blueprint flex flex-col gap-10">
            <div className="space-y-10">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-6">
                  Primary Metrics
                </label>
                <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                  <NumberField
                    label="Current Age"
                    value={inputs.currentAge}
                    onChange={(v) => set("currentAge", v)}
                  />
                  <NumberField
                    label="Target Age"
                    value={inputs.retirementAge}
                    onChange={(v) => set("retirementAge", v)}
                  />
                  <NumberField
                    label="Current Assets"
                    prefix="$"
                    step={1000}
                    value={inputs.currentSavings}
                    onChange={(v) => set("currentSavings", v)}
                  />
                  <NumberField
                    label="Annual Expenses"
                    prefix="$"
                    step={500}
                    value={inputs.annualExpenses}
                    onChange={(v) => set("annualExpenses", v)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-6">
                  Yield Assumptions
                </label>
                <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                  <NumberField
                    label="Market Return"
                    suffix="%"
                    step={0.1}
                    value={inputs.expectedReturn}
                    onChange={(v) => set("expectedReturn", v)}
                  />
                  <NumberField
                    label="Safe Withdrawal"
                    suffix="%"
                    step={0.1}
                    value={inputs.withdrawalRate}
                    onChange={(v) => set("withdrawalRate", v)}
                  />
                </div>
              </div>
            </div>

            {/* Optimization engine */}
            <div className="mt-auto pt-8 border-t border-dashed border-blueprint">
              <div className="bg-ink text-white p-6 md:p-8 rounded-sm">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                    Optimization Engine
                  </span>
                  <span className="text-horizon text-[10px] uppercase tracking-widest">
                    Drafting
                  </span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-3">
                  Monthly savings to coast by age
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="number"
                    value={targetCoastAge}
                    onChange={(e) =>
                      setTargetCoastAge(e.target.valueAsNumber || 0)
                    }
                    className="w-20 bg-transparent border-b border-zinc-700 focus:border-horizon outline-none text-2xl py-1 tabular-nums"
                  />
                  <span className="text-zinc-500 text-xs uppercase tracking-widest">
                    target age
                  </span>
                </div>
                <div className="font-display text-5xl mb-3">
                  {monthlyNeeded === null
                    ? "—"
                    : monthlyNeeded === 0
                      ? "$0"
                      : formatCurrency(monthlyNeeded)}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {monthlyNeeded === null
                    ? "Choose a target age beyond your current age."
                    : monthlyNeeded === 0
                      ? "You are already on track — no additional contributions required."
                      : `Per month, every month, until age ${targetCoastAge}.`}
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 bg-white blueprint-grid relative overflow-hidden flex flex-col">
            <div className="p-6 md:p-12 relative z-10 flex-1 flex flex-col">
              <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-6 mb-12 md:mb-16">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 block mb-2">
                    Projected Result
                  </span>
                  <h2 className="font-display text-5xl md:text-7xl leading-none">
                    {coastReached ? "Coast Achieved" : "Building Coast"}
                  </h2>
                  <div className="mt-4 flex items-center gap-4 flex-wrap">
                    {results.coastAge !== null ? (
                      <>
                        <span className="text-3xl md:text-5xl tabular-nums">
                          Age {Math.ceil(results.coastAge)}
                        </span>
                        <span className="h-px w-12 bg-zinc-300" />
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">
                          {Math.max(0, Math.ceil(results.coastAge - inputs.currentAge))}{" "}
                          years from today
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-zinc-500 uppercase tracking-widest">
                        Increase contributions to reach coast
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-xs text-zinc-400 block uppercase tracking-widest">
                    Portfolio at {inputs.retirementAge}
                  </span>
                  <span className="text-3xl md:text-4xl tabular-nums">
                    {formatCurrency(results.projectedAtRetirement, { compact: true })}
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 md:h-80 -mx-2 md:-mx-4 mb-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.trajectory} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="coast-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--horizon)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--horizon)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--blueprint)" strokeDasharray="2 4" vertical={false} />
                    <XAxis
                      dataKey="age"
                      stroke="var(--blueprint)"
                      tick={{ fill: "#a1a1aa", fontSize: 10, fontFamily: "var(--font-mono)" }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--blueprint)" }}
                    />
                    <YAxis
                      stroke="var(--blueprint)"
                      tick={{ fill: "#a1a1aa", fontSize: 10, fontFamily: "var(--font-mono)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--ink)",
                        border: "none",
                        borderRadius: 2,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "white",
                      }}
                      labelStyle={{ color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 10 }}
                      formatter={((value: unknown, name: unknown) => [
                        formatCurrency(Number(value)),
                        name === "coasting" ? "Portfolio" : "Coast Threshold",
                      ]) as never}
                      labelFormatter={(age) => `Age ${age}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="coasting"
                      stroke="var(--horizon)"
                      strokeWidth={2}
                      fill="url(#coast-fill)"
                    />
                    <Line
                      type="monotone"
                      dataKey="threshold"
                      stroke="var(--ink)"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    {results.coastAge !== null &&
                      results.coastAge >= inputs.currentAge &&
                      results.coastAge <= inputs.retirementAge && (
                        <ReferenceLine
                          x={Math.round(results.coastAge)}
                          stroke="var(--horizon)"
                          strokeDasharray="2 2"
                          label={{
                            value: "COAST",
                            position: "top",
                            fill: "var(--horizon)",
                            fontSize: 10,
                            fontFamily: "var(--font-mono)",
                          }}
                        />
                      )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 border-t border-blueprint pt-8 md:pt-12 mt-auto">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-2">
                    Coast FIRE Number
                  </span>
                  <div className="text-2xl tabular-nums">
                    {formatCurrency(results.coastNumber)}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    The amount needed today to stop saving forever.
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-2">
                    Current Progress
                  </span>
                  <div className="text-2xl tabular-nums">
                    {results.progressPct.toFixed(1)}%
                  </div>
                  <div className="w-full bg-zinc-100 h-1 mt-3 relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-horizon transition-all duration-500"
                      style={{ width: `${results.progressPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-2">
                    {coastReached ? "FIRE Target" : "Shortfall Today"}
                  </span>
                  <div className="text-2xl tabular-nums">
                    {coastReached
                      ? formatCurrency(results.fireNumber, { compact: true })
                      : formatCurrency(results.shortfall)}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    {coastReached
                      ? `Full nest egg at ${inputs.withdrawalRate}% SWR.`
                      : "Distance to today's coast point."}
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative scale */}
            {results.coastAge !== null && (
              <div className="absolute bottom-0 right-0 p-4 pointer-events-none">
                <span className="font-display text-[120px] md:text-[200px] leading-none text-blueprint select-none -mb-12 block opacity-50">
                  {Math.ceil(results.coastAge)}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Methodology */}
        <section className="px-6 md:px-8 py-16 md:py-24 bg-ink text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 max-w-6xl mx-auto">
            <div>
              <h3 className="font-display text-4xl md:text-5xl mb-8">
                The structural integrity <br />
                of your plan.
              </h3>
              <div className="space-y-6">
                {[
                  {
                    n: "01",
                    t: "Compound Growth",
                    d: "Your savings compound annually at the expected return rate. Coast number is FIRE target discounted back to today.",
                  },
                  {
                    n: "02",
                    t: "Safe Withdrawal Rate",
                    d: "FIRE target equals annual expenses divided by your safe withdrawal rate (4% by default — the Trinity study baseline).",
                  },
                  {
                    n: "03",
                    t: "Client-Side Only",
                    d: "All calculations run in your browser. Nothing is stored, transmitted, or saved anywhere.",
                  },
                ].map((item) => (
                  <div key={item.n} className="flex gap-6 items-start">
                    <div className="size-8 border border-zinc-700 flex items-center justify-center shrink-0 text-xs">
                      {item.n}
                    </div>
                    <div>
                      <h4 className="text-sm uppercase tracking-widest mb-2">
                        {item.t}
                      </h4>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {item.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900 p-10 md:p-12 relative flex flex-col justify-center border border-zinc-800">
              <div className="absolute top-0 right-0 w-12 h-12 bg-horizon" />
              <span className="text-xs uppercase tracking-[0.4em] text-horizon mb-4">
                The Horizon Line
              </span>
              <p className="font-display text-2xl leading-snug">
                "The goal isn't just to stop working — it's to start living from
                a position of architectural certainty."
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 md:px-8 py-8 flex flex-col md:flex-row gap-4 justify-between items-center text-[10px] uppercase tracking-widest text-zinc-400">
        <div>Horizon Line — Coast FIRE Instrument</div>
        <div className="flex gap-6">
          <span>Client-side only</span>
          <span>No data stored</span>
        </div>
      </footer>
    </div>
  );
}
