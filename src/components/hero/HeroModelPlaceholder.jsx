export default function HeroModelPlaceholder({ children, className = "" }) {
  return (
    <div
      className={`relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden sm:aspect-[16/11] lg:max-w-4xl xl:max-w-[56rem] ${className}`}
    >
      <div className="absolute inset-x-[20%] bottom-[10%] h-12 rounded-full bg-primary/10 blur-3xl sm:h-16 lg:h-20" />
      <div className="h-full w-full">{children}</div>
      <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-text-muted sm:bottom-4 sm:text-sm">
        3D model placeholder
      </div>
    </div>
  );
}
