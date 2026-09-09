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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

const TITLE = "Join the Clarity beta";
const DESCRIPTION =
  "Enter your email to request access to the private iOS beta on TestFlight.";

function SignupForm() {
  return (
    <>
      <EmailSignup
        buttonLabel="Request access"
        placeholder="Email address"
        source="clarity-testflight"
        stacked
      />
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        We’ll only email you about Clarity.
      </p>
    </>
  );
}

export default function ClarityBetaSignup() {
  const isMobile = useIsMobile();
  const trigger = (
    <Button size="xl" className="w-full sm:w-auto">
      Sign up for beta
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <div className="flex flex-col gap-6 px-6 pt-2 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <DrawerHeader className="p-0 text-center">
              <DrawerTitle>{TITLE}</DrawerTitle>
              <DrawerDescription>{DESCRIPTION}</DrawerDescription>
            </DrawerHeader>
            <SignupForm />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-[1.5rem] p-8 [&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:right-3">
        <DialogHeader className="items-center text-center">
          <DialogTitle>{TITLE}</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <SignupForm />
      </DialogContent>
    </Dialog>
  );
}
