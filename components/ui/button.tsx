import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#0e639c] text-white hover:bg-[#1177bb] shadow-none rounded-none",
        destructive:
          "bg-[#c72e0f] text-white hover:bg-[#d9331a] shadow-none rounded-none",
        outline:
          "border border-[#3c3c3c] bg-transparent hover:bg-[#3c3c3c] shadow-none rounded-none",
        secondary:
          "bg-[#3c3c3c] text-white hover:bg-[#4a4a4a] shadow-none rounded-none",
        ghost: "hover:bg-[#3c3c3c] hover:text-white shadow-none rounded-none",
        link: "text-[#0e639c] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
