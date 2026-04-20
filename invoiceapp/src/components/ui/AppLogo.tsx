import clsx from "clsx";

interface AppLogoProps {
  size?: number;
  className?: string;
  imageClassName?: string;
}

export function AppLogo({
  size = 20,
  className,
  imageClassName,
}: AppLogoProps) {
  return (
    <div
      className={clsx("shrink-0 rounded-lg overflow-hidden", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src="/app-icon.png"
        alt=""
        width={size}
        height={size}
        className={clsx("w-full h-full object-cover", imageClassName)}
      />
    </div>
  );
}
