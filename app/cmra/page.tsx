import Image from "next/image";
import { cmraMetadata } from "@/lib/cmra";

export function generateMetadata() {
  return cmraMetadata("index");
}

export default function CmraPage() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <Image
        src="/images/cmra-app.jpg"
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-contain object-center"
      />
    </div>
  );
}
