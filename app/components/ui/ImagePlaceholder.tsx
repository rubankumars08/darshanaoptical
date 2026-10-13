import { ImageIcon, type LucideIcon } from "lucide-react";

type ImagePlaceholderProps = {
  ratio?: "4/3" | "3/4" | "4/5" | "16/9" | "1/1";
  icon?: LucideIcon;
  dark?: boolean;
  className?: string;
};

export default function ImagePlaceholder({
  ratio = "4/3",
  icon: Icon = ImageIcon,
  dark = false,
  className = "",
}: ImagePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-l ${
        dark ? "bg-neutral-800" : "bg-neutral-200"
      } ${className}`}
      style={{ aspectRatio: ratio.replace("/", " / ") }}
    >
      <Icon
        size={28}
        strokeWidth={1.5}
        className={dark ? "text-neutral-500" : "text-neutral-400"}
      />
    </div>
  );
}
