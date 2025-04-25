import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
const badgeVariants = cva(
  "inline-flex items-center rounded-full border text-[0.9rem] rounded-[16px] px-4 py-2 border-[1.8px] font-semibold transition-colors !outline-none !ring-0 !focus:outline-none !focus:ring-0 !focus-visible:ring-0",
  {
    variants: {
      variant: {
        default:
          "border-white bg-transparent text-white hover:bg-white hover:text-black",
        red: "bg-red-500 text-white border-red-500",
        disabled:
          "bg-gray-600 text-white border-gray-600 cursor-not-allowed pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
