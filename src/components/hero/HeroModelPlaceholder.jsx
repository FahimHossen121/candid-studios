export default function HeroModelPlaceholder({ children, className = "" }) {
  return (
    <div
      className={`relative mx-auto aspect-square w-full max-w-xl overflow-hidden sm:max-w-2xl sm:aspect-[16/11] lg:max-w-[42rem] ${className}`}
    >
      <div className="absolute inset-x-[20%] bottom-[10%] h-12 rounded-full bg-primary/10 blur-3xl sm:h-16 lg:h-20" />
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
