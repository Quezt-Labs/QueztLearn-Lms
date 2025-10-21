"use client";

import Image from "next/image";

interface LoginHeaderProps {
  logoSrc: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  logoClassName?: string;
}

export function LoginHeader({
  logoSrc,
  logoAlt,
  logoWidth,
  logoHeight,
  logoClassName = "w-auto h-24 mx-auto scale-250",
}: LoginHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={logoWidth}
        height={logoHeight}
        className={logoClassName}
      />
    </div>
  );
}
