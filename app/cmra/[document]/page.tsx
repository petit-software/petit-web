import { notFound } from "next/navigation";
import MarkdownContent from "@/components/MarkdownContent";
import { cmraDocuments, cmraMetadata, isCmraDocument, loadCmraContent } from "@/lib/cmra";

interface Props {
  params: Promise<{ document: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return cmraDocuments.map((document) => ({ document }));
}

export async function generateMetadata({ params }: Props) {
  const { document } = await params;
  if (!isCmraDocument(document)) notFound();
  return cmraMetadata(document);
}

export default async function CmraDocumentPage({ params }: Props) {
  const { document } = await params;
  if (!isCmraDocument(document)) notFound();
  const { body } = await loadCmraContent(document);
  return <MarkdownContent slug="cmra" body={body} />;
}
