import CmraPhone from "@/components/CmraPhone/CmraPhone";
import { cmraMetadata } from "@/lib/cmra";

export function generateMetadata() {
  return cmraMetadata("index");
}

export default function CmraPage() {
  return <CmraPhone />;
}
