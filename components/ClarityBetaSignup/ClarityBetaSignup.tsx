"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronRight, LoaderCircle, X } from "lucide-react";

export default function ClarityBetaSignup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const submitting = useRef(false);
  const id = useId();
  const reduceMotion = useReducedMotion();
  const expanded = open || status === "success";
  const fade = { duration: reduceMotion ? 0 : 0.16 };

  function close() {
    if (submitting.current) return;
    setOpen(false);
    setError("");
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "clarity-testflight" }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setStatus("idle");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setOpen(false);
      setEmail("");
    } catch {
      setStatus("idle");
      setError("Couldn’t connect. Please try again.");
    } finally {
      submitting.current = false;
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 lg:landscape:items-start">
      <motion.div
        layout={!reduceMotion}
        initial={false}
        animate={{ backgroundColor: expanded ? "#f7f8f7" : "#191b1b" }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
        style={{ width: expanded ? "100%" : "max-content", borderRadius: 999 }}
        className="relative h-12 max-w-full border border-black/10 focus-within:ring-2 focus-within:ring-[#505656]/30 focus-within:ring-offset-2 focus-within:ring-offset-[#e3e5e4]"
      >
        <motion.button
          layout="position"
          ref={triggerRef}
          type="button"
          initial={false}
          animate={{ opacity: expanded ? 0 : 1 }}
          transition={fade}
          disabled={expanded}
          aria-hidden={expanded}
          aria-expanded={open}
          aria-controls={open ? `${id}-form` : undefined}
          tabIndex={expanded ? -1 : 0}
          onClick={() => setOpen(true)}
          className="h-full rounded-full px-6 text-base font-medium whitespace-nowrap text-white outline-none enabled:hover:bg-white/10 disabled:pointer-events-none"
        >
          Sign up for beta
        </motion.button>

        <AnimatePresence initial={false}>
          {open && status !== "success" && (
            <motion.form
              layout="position"
              key="email"
              id={`${id}-form`}
              aria-label="Join the Clarity beta"
              aria-busy={status === "loading"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={fade}
              onSubmit={submit}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  close();
                }
              }}
              className="absolute inset-0 flex items-center gap-1 rounded-full p-1"
            >
              <button
                type="button"
                aria-label="Close signup"
                onClick={close}
                disabled={status === "loading"}
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#505656] transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:opacity-40"
              >
                <X size={18} aria-hidden="true" />
              </button>
              <input
                autoFocus
                type="email"
                name="email"
                aria-label="Email address"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                autoComplete="email"
                inputMode="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                readOnly={status === "loading"}
                className="h-full min-w-0 flex-1 bg-transparent px-1 text-base text-[#191b1b] outline-none placeholder:text-[#747a7a]"
              />
              <button
                type="submit"
                aria-label={status === "loading" ? "Requesting access" : "Request access"}
                disabled={status === "loading"}
                className="flex h-10 w-12 shrink-0 items-center justify-center rounded-full bg-[#191b1b] text-white transition-colors hover:bg-[#303434] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#505656] disabled:opacity-60"
              >
                {status === "loading" ? (
                  <LoaderCircle size={20} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <ChevronRight size={20} aria-hidden="true" />
                )}
              </button>
            </motion.form>
          )}
          {status === "success" && (
            <motion.div
              key="success"
              tabIndex={-1}
              ref={(node) => { node?.focus(); }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={fade}
              className="absolute inset-0 flex items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-[#191b1b] outline-none"
            >
              <Check size={18} aria-hidden="true" />
              You’re on the list
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div role="status" className="sr-only">
        {status === "loading" ? "Requesting access…" : status === "success" ? "You’re on the list. We’ll be in touch." : ""}
      </div>
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-[#9e2929]">{error}</p>}
    </div>
  );
}
