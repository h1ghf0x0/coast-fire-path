import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STRIPE_LINK = "https://buy.stripe.com/test_xxxx";
const GUMROAD_LINK = "https://gumroad.com/l/your-product";

export function MonetizationSection() {
  const [pdfOpen, setPdfOpen] = useState(false);
  const [paid, setPaid] = useState(false);
  const [email, setEmail] = useState("");

  function openCheckout() {
    // Open Stripe Payment Link in a new tab; flip to "paid" state in modal.
    window.open(STRIPE_LINK, "_blank", "noopener,noreferrer");
    setPaid(true);
  }

  function resetModal(open: boolean) {
    setPdfOpen(open);
    if (!open) {
      setPaid(false);
      setEmail("");
    }
  }

  return (
    <section
      className="px-6 md:px-8 py-20 md:py-28 bg-ink text-white border-t border-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-700"
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
              <p className="text-sm text-zinc-400 leading-relaxed mb-8 flex-grow">
                A personalized PDF with your numbers, the math explained, and a
                10-year projection table.
              </p>

              <ul className="space-y-2 mb-8 text-xs text-zinc-500 uppercase tracking-widest">
                <li className="flex gap-3">
                  <span className="text-horizon">→</span> Personalized
                  projections
                </li>
                <li className="flex gap-3">
                  <span className="text-horizon">→</span> Year-by-year table
                </li>
                <li className="flex gap-3">
                  <span className="text-horizon">→</span> Methodology breakdown
                </li>
              </ul>

              <button
                onClick={() => setPdfOpen(true)}
                className="w-full bg-horizon hover:bg-horizon/90 text-ink text-xs uppercase tracking-[0.25em] font-medium py-4 transition-colors"
              >
                Get my PDF →
              </button>
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
                  <span className="text-horizon">→</span> Duplicate to your
                  workspace
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

      <Dialog open={pdfOpen} onOpenChange={resetModal}>
        <DialogContent className="bg-ink border-zinc-800 text-white max-w-md">
          {!paid ? (
            <>
              <DialogHeader>
                <span className="text-[10px] uppercase tracking-[0.3em] text-horizon block mb-2">
                  Secure Checkout
                </span>
                <DialogTitle className="font-display text-2xl leading-tight">
                  Coast FIRE Blueprint — $5
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-sm leading-relaxed pt-2">
                  You'll be redirected to Stripe to complete payment. Your PDF
                  is generated from the numbers currently in the calculator.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-3">
                  <span>Coast FIRE Blueprint (PDF)</span>
                  <span className="text-white font-mono">$5.00</span>
                </div>
                <button
                  onClick={openCheckout}
                  className="w-full bg-horizon hover:bg-horizon/90 text-ink text-xs uppercase tracking-[0.25em] font-medium py-4 transition-colors"
                >
                  Continue to Stripe →
                </button>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 text-center">
                  Powered by Stripe · Encrypted
                </p>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <span className="text-[10px] uppercase tracking-[0.3em] text-horizon block mb-2">
                  Payment Received
                </span>
                <DialogTitle className="font-display text-2xl leading-tight">
                  Thank you — your PDF will be emailed within 2 hours.
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-sm leading-relaxed pt-2">
                  Confirm the address where we should send your Coast FIRE
                  Blueprint.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                    Delivery Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent border-b border-zinc-700 focus:border-horizon py-2 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors"
                  />
                </label>
                <button
                  onClick={() => resetModal(false)}
                  className="w-full bg-horizon hover:bg-horizon/90 text-ink text-xs uppercase tracking-[0.25em] font-medium py-4 transition-colors mt-4"
                >
                  Confirm email →
                </button>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 text-center">
                  Check your spam folder if you don't see it
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
