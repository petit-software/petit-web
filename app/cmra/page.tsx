import CmraPhone from "@/components/CmraPhone/CmraPhone";
import { Button } from "@/components/ui/button";
import { cmraMetadata } from "@/lib/cmra";

export function generateMetadata() {
  return cmraMetadata("index");
}

export default function CmraPage() {
  return (
    <section className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-8 px-6 py-6 md:grid-cols-2 md:gap-12">
      <div className="flex min-h-[420px] md:min-h-[520px]">
        <CmraPhone />
      </div>
      <div className="flex flex-col items-center justify-center gap-8 pb-8 text-center md:items-start md:pb-0 md:text-left">
        <h1 className="text-5xl font-medium tracking-tight sm:text-6xl">A Minimalistic Camera for Real Photos</h1>
        <Button disabled className="disabled:opacity-100">
          Download on the App Store
        </Button>
      </div>
    </section>
  );
}
