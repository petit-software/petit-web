import { NextResponse } from "next/server";
import { Resend } from "resend";

interface SignupBody {
  email?: string;
  source?: string;
  segmentId?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLARITY_SEGMENT_ID = "3d5610ca-bcd3-4163-9894-3c89f1f0ac99";

export async function POST(req: Request) {
  let body: SignupBody;
  try {
    body = (await req.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email-signup] RESEND_API_KEY missing");
    return NextResponse.json({ error: "Signup is not configured yet." }, { status: 503 });
  }

  if (body.source) {
    console.log(`[email-signup] new signup from "${body.source}": ${email}`);
  }

  const resend = new Resend(apiKey);
  const segmentId =
    body.source === "clarity-testflight"
      ? CLARITY_SEGMENT_ID
      : body.segmentId?.trim();

  const { error } = await resend.contacts.create({
    email,
    unsubscribed: false,
    segments: segmentId ? [{ id: segmentId }] : undefined,
  });

  if (error) {
    const alreadyExists = /already exists/i.test(error.message ?? "");
    if (alreadyExists) {
      return NextResponse.json({ ok: true });
    }
    console.error("[email-signup] Resend error", error);
    return NextResponse.json(
      { error: error.message ?? "We couldn't sign you up. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
