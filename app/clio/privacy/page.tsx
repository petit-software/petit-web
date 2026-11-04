import type { Metadata } from "next";
import { SITE_EMAIL, siteUrl } from "@/lib/metadata";

const title = "Clio Privacy Policy";
const description = "How Clio for iOS handles your recordings, transcripts, and personal information.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: siteUrl("/clio/privacy") },
  openGraph: { title, description, url: siteUrl("/clio/privacy"), type: "website" },
  twitter: { card: "summary", title, description },
};

export default function ClioPrivacyPage() {
  return (
    <main className="min-h-svh bg-background px-6 py-16 text-foreground sm:py-24">
      <article className="prose prose-neutral mx-auto max-w-2xl dark:prose-invert">
        <h1>Clio Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: 5 November 2026</p>

        <p>
          Clio for iOS, made by Petit, records and transcribes audio on your
          device. No account is required. We do not collect your recordings or
          transcripts, sell personal information, or use advertising or analytics
          trackers in the app.
        </p>

        <h2>Your recordings stay under your control</h2>
        <p>
          Audio, transcripts, titles, summaries, and preferences are stored on
          your device. Transcription and summarization run locally, using
          downloaded models or Apple’s on-device model. Clio does not send your
          recordings or text to a cloud AI service or to us.
        </p>

        <h2>Permissions and location</h2>
        <p>
          Clio asks for microphone access to record audio. If you enable
          “Include location” and grant permission, it saves your location with
          each recording. Apple’s geocoding service receives coordinates to look
          up a place name. Tapping a saved location opens it in Apple Maps. We do
          not receive your location. You can change microphone and location
          permissions in iOS Settings at any time.
        </p>

        <h2>Model downloads</h2>
        <p>
          Clio connects to Hugging Face to download AI models. These requests
          expose your IP address and the requested model files to the download
          provider, but do not include your recordings or transcripts. Once the
          models are installed, transcription and summarization work offline.
        </p>

        <h2>Sharing and backups</h2>
        <p>
          When you choose to share audio or text, it is sent to the app or
          recipient you select. Their privacy practices apply to that copy.
          Clio’s local data may also be included in iCloud or computer backups,
          depending on your device settings. Downloaded models are excluded from
          backups.
        </p>

        <h2>Deleting your data</h2>
        <p>
          You can delete recordings and their associated audio and text in Clio.
          Deleting the app removes its local data. Copies you have shared or
          backed up need to be managed separately in the relevant app or backup
          service.
        </p>

        <h2>Contact and changes</h2>
        <p>
          For privacy questions, email <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>.
          If you contact us, we receive your email address and anything you
          include, and use that information to respond to your request. We will
          update this page and its date if Clio’s privacy practices change.
        </p>
      </article>
    </main>
  );
}
