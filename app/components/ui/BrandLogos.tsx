import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

// 1. Moult Logo
export function MoultLogo({ className = "h-8 w-auto", size }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 font-serif font-black tracking-widest text-neutral-900 uppercase ${className}`}>
      <svg className="h-6 w-6 text-brand-orange shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span className="text-base tracking-[0.2em]">MOULT</span>
    </div>
  );
}

// 2. Sizzler Curve Logo
export function SizzlerCurveLogo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <div className={`flex items-center gap-1.5 font-sans font-extrabold text-neutral-900 italic ${className}`}>
      <svg className="h-6 w-6 text-brand-orange shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4 14c4-5 12-5 16 0" />
        <circle cx="7" cy="14" r="2.5" />
        <circle cx="17" cy="14" r="2.5" />
      </svg>
      <span className="text-sm tracking-tight text-neutral-950">SIZZLER <span className="text-brand-orange font-black">CURVE</span></span>
    </div>
  );
}

// 3. Rexter Logo
export function RexterLogo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 font-sans font-black tracking-wider text-neutral-950 uppercase ${className}`}>
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-950 text-white font-extrabold text-xs">
        R
      </div>
      <span className="text-base tracking-[0.15em] text-neutral-900">REXTER</span>
    </div>
  );
}

// 4. Sizzler TR90 Logo
export function SizzlerTR90Logo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <div className={`flex items-center gap-1.5 font-sans font-extrabold text-neutral-900 ${className}`}>
      <span className="rounded-md bg-brand-orange-soft px-1.5 py-0.5 text-xs font-black text-brand-orange border border-brand-orange/30">
        TR90
      </span>
      <span className="text-sm tracking-tight">SIZZLER <span className="text-neutral-500 font-medium">FLEX</span></span>
    </div>
  );
}

// 5. Legend Logo
export function LegendLogo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 font-serif tracking-widest text-neutral-900 uppercase ${className}`}>
      <svg className="h-6 w-6 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
      <span className="text-base font-bold tracking-[0.25em]">LEGEND</span>
    </div>
  );
}

// 6. Enterprises Lenses Logo
export function EnterprisesLogo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 font-sans font-bold text-neutral-950 ${className}`}>
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-orange text-white font-black text-xs shadow-xs">
        EP
      </div>
      <div>
        <div className="text-xs font-extrabold tracking-wider leading-none text-neutral-900">ENTERPRISES</div>
        <div className="text-[9px] font-semibold text-brand-orange tracking-widest leading-none mt-0.5">OPTICAL LENSES</div>
      </div>
    </div>
  );
}

// 7. Ash Lenses Logo
export function AshLogo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 font-sans font-bold text-neutral-950 ${className}`}>
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutral-950 text-neutral-950 font-black text-xs">
        ASH
      </div>
      <div>
        <div className="text-xs font-extrabold tracking-widest leading-none text-neutral-950">ASH HD</div>
        <div className="text-[9px] font-semibold text-neutral-500 tracking-wider leading-none mt-0.5">PRECISION LENSES</div>
      </div>
    </div>
  );
}
