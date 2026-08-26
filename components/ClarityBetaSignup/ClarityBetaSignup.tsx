"use client";

import EmailSignup from "@/components/EmailSignup";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ClarityBetaSignup() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="xl">Sign up for beta</Button>
      </DialogTrigger>
      <DialogContent className="rounded-[1.5rem] p-8 [&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:right-3">
        <DialogHeader className="items-center text-center">
          <DialogTitle>Join the Clarity beta</DialogTitle>
          <DialogDescription>
            Enter your email to request access to the private iOS beta on TestFlight.
          </DialogDescription>
        </DialogHeader>
        <EmailSignup
          buttonLabel="Request access"
          placeholder="Email address"
          source="clarity-testflight"
          stacked
        />
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          We’ll only email you about Clarity.
        </p>
      </DialogContent>
    </Dialog>
  );
}
