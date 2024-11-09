import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.svg"
        alt="MPLGPT"
        width={128}
        height={128}
        className="rounded-lg"
      />
      <span className="text-xl font-bold">MPLGPT</span>
    </div>
  );
}