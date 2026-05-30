import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-11 items-center justify-center gap-2 rounded-[8px] px-4 text-sm font-semibold outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-red-200/70 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default:
          "button-primary-text bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_18px_42px_rgba(255,255,255,0.12)] hover:bg-red-50",
        secondary:
          "border border-white/12 bg-white/[0.055] text-white hover:border-red-200/35 hover:bg-red-500/10",
        ghost:
          "text-white/72 hover:bg-white/[0.055] hover:text-white",
        danger:
          "border border-red-300/24 bg-red-500/16 text-red-50 shadow-[0_0_36px_rgba(220,38,38,0.16)] hover:bg-red-500/24",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-11 px-4",
        lg: "h-12 px-5 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
