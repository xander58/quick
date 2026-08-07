import Image from "next/image";

export default function LandingHeader() {
  return (
    <header className="border-b border-muted/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
        <Image src="/logo.svg" alt="Quick" width={32} height={32} className="rounded-lg" />
        <span className="font-semibold tracking-tight">Quick</span>
      </div>
    </header>
  );
}
