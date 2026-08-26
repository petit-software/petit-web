"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

interface EmailSignupProps {
  buttonLabel?: string;
  placeholder?: string;
  source?: string;
  segmentId?: string;
  stacked?: boolean;
}

type Status = "idle" | "loading" | "success";

export default function EmailSignup({
  buttonLabel = "Get notified",
  placeholder = "you@company.com",
  source,
  segmentId,
  stacked = false,
}: EmailSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, segmentId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("idle");
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setEmail("");
      toast.success("You're on the list — we'll be in touch.");
    } catch {
      setStatus("idle");
      toast.error("Network error. Please try again.");
    }
  }

  const disabled = status === "loading" || status === "success";

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email-signup" className="sr-only">
            Email address
          </FieldLabel>
          <InputGroup className="h-11">
            <InputGroupInput
              id="email-signup"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disabled}
            />
            {!stacked && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton type="submit" variant="default" size="sm" disabled={disabled}>
                  {status === "loading" ? "Sending…" : buttonLabel}
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          {stacked && (
            <Button type="submit" size="lg" className="w-full" disabled={disabled}>
              {status === "loading" ? "Sending…" : buttonLabel}
            </Button>
          )}
        </Field>
      </FieldGroup>
    </form>
  );
}
