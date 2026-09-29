import CmraHero from "@/components/CmraHero/CmraHero";
import { cmraMetadata } from "@/lib/cmra";

export function generateMetadata() {
  return cmraMetadata("index");
}

export default function CmraPage() {
  return <CmraHero />;
}
