import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center">
      <Image
        src="/logo.png"
        width={140}
        height={56}
        className="object-contain"
        alt="Miss Somali logo"
        quality={100}
        priority
      />
    </div>
  );
}
