import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-7 items-center gap-2 rounded-[8px] border px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-red-300/20 bg-red-500/10 text-red-50",
        neutral: "border-white/12 bg-white/[0.055] text-white/70",
        success: "border-emerald-300/20 bg-emerald-400/10 text-emerald-50",
        warning: "border-amber-300/24 bg-amber-400/10 text-amber-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
