import LogoSvg from "./LogoSvg";
import { loadLogoSvg } from "./parseLogo";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  drawn?: boolean;
  onUndrawComplete?: () => void;
}

export default function Logo({ width = 368, height = 155, className, drawn, onUndrawComplete }: LogoProps) {
  const data = loadLogoSvg();
  return (
    <LogoSvg
      data={data}
      width={width}
      height={height}
      className={className}
      drawn={drawn}
      onUndrawComplete={onUndrawComplete}
    />
  );
}
