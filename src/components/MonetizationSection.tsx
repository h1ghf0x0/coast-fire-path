import { useState } from "react";
import { jsPDF } from "jspdf";

const GUMROAD_LINK = "https://gumroad.com/l/your-product";

interface CoastData {
  age: number;
  retirementAge: number;
  netWorth: number;
  expenses: number;
  expectedReturn: number;
  withdrawalRate: number;
  coastNumber?: number;
  coastAge?: number;
}

const DEMO_DATA: CoastData = {
  age: 28,
  retirementAge: 60,
  netWorth: 150_000,
  expenses: 40_000,
  expectedReturn: 7,
  withdrawalRate: 4,
};

function readData(): CoastData {
  if (typeof window === "undefined") return DEMO_DATA;
  try {
    const raw = localStorage.getItem("coastFireData");
    if (!raw) return DEMO_DATA;
    const parsed = JSON.parse(raw);
    return { ...DEMO_DATA, ...parsed };
  } catch {
    return DEMO_DATA;
  }
}

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function generatePdf(data: CoastData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Colors
  const ink: [number, number, number] = [16, 18, 22];
  const teal: [number, number, number] = [120, 200, 190];
  const muted: [number, number, number] = [110, 115, 125];
  const lightRow: [number, number, number] = [245, 246, 248];
  const yellowBg: [number, number, number] = [255, 246, 214];
  const yellowBd: [number, number, number] = [220, 180, 60];
  const green: [number, number, number] = [40, 140, 90];
  const amber: [number, number, number] = [180, 130, 30];

  // Header
  doc.setFillColor(...ink);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...teal);
  doc.text("HORIZON LINE", margin, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 185, 195);
  doc.text("COAST FIRE BLUEPRINT", margin, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Coast FIRE Blueprint", margin, 82);

  let y = 120;

  // Compute derived values if missing
  const yearsToRetire = Math.max(0, data.retirementAge - data.age);
  const targetNestEgg =
    data.coastNumber !== undefined
      ? // back out FV from coast: coast * (1+r)^n = target
        (data.coastNumber ?? 0) *
        Math.pow(1 + data.expectedReturn / 100, yearsToRetire)
      : (data.expenses / (data.withdrawalRate / 100));
  const coastNumber =
    data.coastNumber ??
    targetNestEgg / Math.pow(1 + data.expectedReturn / 100, yearsToRetire);

  // Info cards 2-col grid
  const cards: Array<[string, string]> = [
    ["CURRENT AGE", `${data.age}`],
    ["TARGET RETIREMENT", `${data.retirementAge}`],
    ["NET WORTH", fmt(data.netWorth)],
    ["ANNUAL EXPENSES", fmt(data.expenses)],
    ["EXPECTED RETURN", `${data.expectedReturn}%`],
    ["SAFE WITHDRAWAL", `${data.withdrawalRate}%`],
  ];
  const cardW = (pageW - margin * 2 - 12) / 2;
  const cardH = 50;
  cards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = margin + col * (cardW + 12);
    const cy = y + row * (cardH + 10);
    doc.setDrawColor(220, 222, 228);
    doc.setFillColor(252, 252, 253);
    doc.roundedRect(cx, cy, cardW, cardH, 4, 4, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(c[0], cx + 12, cy + 18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...ink);
    doc.text(c[1], cx + 12, cy + 38);
  });
  y += 3 * (cardH + 10) + 10;

  // Coast number highlight
  doc.setFillColor(...ink);
  doc.roundedRect(margin, y, pageW - margin * 2, 80, 6, 6, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...teal);
  doc.text("YOUR COAST FIRE NUMBER", margin + 20, y + 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(fmt(coastNumber), margin + 20, y + 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 185, 195);
  doc.text(
    `Save this once, stop contributing, retire at ${data.retirementAge}.`,
    margin + 20,
    y + 74,
  );
  y += 100;

  // 10-year projection table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text("10-Year Projection", margin, y);
  y += 14;

  const colX = [margin, margin + 70, margin + 200, margin + 340, margin + 440];
  const headers = ["AGE", "YEAR", "NET WORTH", "COAST TARGET", "STATUS"];
  doc.setFillColor(...ink);
  doc.rect(margin, y, pageW - margin * 2, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  headers.forEach((h, i) => doc.text(h, colX[i] + 8, y + 15));
  y += 22;

  const currentYear = new Date().getFullYear();
  const r = data.expectedReturn / 100;
  let nw = data.netWorth;
  for (let i = 0; i < 10; i++) {
    const age = data.age + i;
    const yr = currentYear + i;
    const yearsLeft = Math.max(0, data.retirementAge - age);
    const coastTarget =
      targetNestEgg / Math.pow(1 + r, yearsLeft);
    const coasting = nw >= coastTarget;
    const rowH = 22;
    if (i % 2 === 0) {
      doc.setFillColor(...lightRow);
      doc.rect(margin, y, pageW - margin * 2, rowH, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...ink);
    doc.text(`${age}`, colX[0] + 8, y + 15);
    doc.text(`${yr}`, colX[1] + 8, y + 15);
    doc.text(fmt(nw), colX[2] + 8, y + 15);
    doc.text(fmt(coastTarget), colX[3] + 8, y + 15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(coasting ? green : amber));
    doc.text(coasting ? "COASTING" : "SAVING", colX[4] + 8, y + 15);
    y += rowH;
    nw = nw * (1 + r);
  }
  y += 16;

  // Methodology
  if (y > pageH - 220) {
    doc.addPage();
    y = margin;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text("Methodology", margin, y);
  y += 16;
  const bullets = [
    `Target nest egg = annual expenses ÷ withdrawal rate (${fmt(data.expenses)} ÷ ${data.withdrawalRate}% = ${fmt(targetNestEgg)}).`,
    `Coast number = target ÷ (1 + return)^years to retirement, compounded at ${data.expectedReturn}%.`,
    "Returns are real (inflation-adjusted); contributions are assumed to stop once coast is reached.",
    "Based on the Trinity Study and standard FIRE community assumptions.",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 65, 75);
  bullets.forEach((b) => {
    doc.text("•", margin, y);
    const lines = doc.splitTextToSize(b, pageW - margin * 2 - 16);
    doc.text(lines, margin + 12, y);
    y += lines.length * 12 + 4;
  });
  y += 8;

  // Disclaimer
  if (y > pageH - 100) {
    doc.addPage();
    y = margin;
  }
  doc.setFillColor(...yellowBg);
  doc.setDrawColor(...yellowBd);
  doc.roundedRect(margin, y, pageW - margin * 2, 44, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120, 80, 10);
  doc.text("⚠ DISCLAIMER", margin + 14, y + 18);
  doc.setFont("helvetica", "normal");
  doc.text("This is a planning tool, not financial advice.", margin + 14, y + 34);

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("coastfirepath.lovable.app", margin, pageH - 20);
    doc.text(`${p} / ${pageCount}`, pageW - margin, pageH - 20, { align: "right" });
  }

  const filename = `Coast-FIRE-Blueprint-${data.age}-${currentYear}.pdf`;
  doc.save(filename);
}

export function MonetizationSection() {
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  async function handlePay() {
    if (status !== "idle") return;
    setStatus("processing");
    await new Promise((res) => setTimeout(res, 1500));
    try {
      generatePdf(readData());
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("PDF generation failed", err);
      setStatus("idle");
    }
  }

  return (
    <section
      className="px-6 md:px-8 py-20 md:py-28 bg-ink text-white border-t border-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-700 relative"
      style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 md:mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-horizon block mb-4">
            Next Step
          </span>
          <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-2xl">
            Lock in your plan.
          </h2>
          <p className="text-sm text-zinc-400 mt-4 max-w-xl leading-relaxed">
            Take your numbers off the screen. Two lightweight tools to keep your
            coast trajectory on course — no subscription, ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* PDF Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-horizon/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full backdrop-blur-md bg-white/[0.03] border border-white/10 p-8 md:p-10 flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <span className="text-[10px] uppercase tracking-widest text-horizon">
                  01 — Report
                </span>
                <span className="text-[10px] uppercase tracking-widest font-mono text-white/60 border border-white/20 px-2 py-1">
                  $5 one-time
                </span>
              </div>

              <h3 className="font-display text-3xl md:text-4xl leading-tight mb-4">
                Download your Coast FIRE Blueprint
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                A personalized PDF with your numbers, the math explained, and a
                10-year projection table.
              </p>

              <ul className="space-y-2 mb-8 text-xs text-zinc-500 uppercase tracking-widest flex-grow">
                <li className="flex gap-3">
                  <span className="text-horizon">→</span> Personalized projections
                </li>
                <li className="flex gap-3">
                  <span className="text-horizon">→</span> Year-by-year growth table
                </li>
                <li className="flex gap-3">
                  <span className="text-horizon">→</span> Methodology breakdown
                </li>
                <li className="flex gap-3">
                  <span className="text-horizon">→</span> Save & print anytime
                </li>
              </ul>

              <button
                onClick={handlePay}
                disabled={status !== "idle"}
                className="w-full bg-horizon hover:bg-horizon/90 text-ink text-xs uppercase tracking-[0.25em] font-medium py-4 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === "processing"
                  ? "⏳ Processing..."
                  : status === "success"
                    ? "✓ Downloaded"
                    : "🔒 Pay $5 & Download PDF"}
              </button>

              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-4 text-center">
                🔒 Secure · 📄 Instant download · 💯 No subscription
              </p>
            </div>
          </div>

          {/* Notion Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blueprint/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full backdrop-blur-md bg-white/[0.03] border border-white/10 p-8 md:p-10 flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <span className="text-[10px] uppercase tracking-widest text-horizon">
                  02 — Tracker
                </span>
                <span className="text-[10px] uppercase tracking-widest font-mono text-white/60 border border-white/20 px-2 py-1">
                  $7 one-time
                </span>
              </div>

              <h3 className="font-display text-3xl md:text-4xl leading-tight mb-4">
                Coast FIRE Tracker (Notion)
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8 flex-grow">
                A dashboard to log your net worth monthly and watch your coast
                number shrink. Instant access.
              </p>

              <ul className="space-y-2 mb-8 text-xs text-zinc-500 uppercase tracking-widest">
                <li className="flex gap-3">
                  <span className="text-horizon">→</span> Monthly net worth log
                </li>
                <li className="flex gap-3">
                  <span className="text-horizon">→</span> Auto coast progress
                </li>
                <li className="flex gap-3">
                  <span className="text-horizon">→</span> Duplicate to your workspace
                </li>
              </ul>

              <a
                href={GUMROAD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-white text-ink hover:bg-white/90 text-xs uppercase tracking-[0.25em] font-medium py-4 transition-colors"
              >
                Get Notion Template ↗
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-zinc-500 mt-10">
          30-day money-back guarantee · No subscription
        </p>
      </div>

      {/* Success overlay */}
      {status === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-ink border border-horizon/40 px-8 py-6 max-w-sm mx-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center">
              <span className="text-green-400 text-2xl">✓</span>
            </div>
            <h4 className="font-display text-xl text-white mb-2">
              Your PDF is ready!
            </h4>
            <p className="text-xs text-zinc-400 uppercase tracking-widest">
              Downloading automatically...
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
