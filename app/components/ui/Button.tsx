import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark" | "text";
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const variantClass: Record<string, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  dark: "btn-dark",
  text: "",
};

const sizeClass: Record<string, string> = {
  sm: "h-9 px-4 text-sm",
  md: "",
  lg: "h-13 px-7 text-base",
};

export default function Button({
  href = "#",
  children,
  variant = "primary",
  icon: Icon,
  size = "md",
  className = "",
  onClick,
  disabled = false,
}: ButtonProps) {
  if (variant === "text") {
    return (
      <Link
        href={href}
        className={`group inline-flex items-center gap-1.5 text-[15px] font-semibold text-neutral-900 transition-colors duration-fast hover:text-brand-orange ${className}`}
      >
        {children}
        <ArrowRight
          size={16}
          strokeWidth={2}
          className="transition-transform duration-fast group-hover:translate-x-1"
        />
      </Link>
    );
  }

  const classes = `${variantClass[variant]} ${sizeClass[size]} gap-2 ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={classes}>
        {Icon && <Icon size={18} strokeWidth={2} />}
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={classes}>
      {Icon && <Icon size={18} strokeWidth={2} />}
      {children}
    </Link>
  );
}
