"use client";

import * as React from "react";
import { motion, useAnimationControls } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const wishlistButtonVariants = cva(
  "cursor-pointer flex items-center justify-center rounded-2xl border shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-primary",
        outline: "border-border bg-background text-foreground",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-accent",
      },
      size: {
        default: "size-28",
        sm: "size-20",
        lg: "size-36",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface WishlistButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof wishlistButtonVariants> {
  speed?: number;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const WishlistButton = React.forwardRef<HTMLButtonElement, WishlistButtonProps>(
  (
    {
      className,
      variant,
      size,
      speed = 1.0,
      checked: controlledChecked,
      onCheckedChange,
      ...props
    },
    ref,
  ) => {
    const controls = useAnimationControls();
    const [internalChecked, setInternalChecked] = React.useState(false);
    const running = React.useRef(false);

    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const svgSize = size === "sm" ? "60" : size === "lg" ? "100" : "80";

    const play = async () => {
      if (running.current) return;
      running.current = true;

      if (!checked) {
        await controls.start("collapse");
        await controls.start("stem");
        await controls.start("tail");
      } else {
        await controls.start("untail");
        await controls.start("unstem");
        await controls.start("uncollapse");
      }

      const newChecked = !checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
      running.current = false;
    };

    return (
      <button
        ref={ref}
        onClick={play}
        className={cn(wishlistButtonVariants({ variant, size, className }))}
        {...props}
      >
        <motion.svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 60 60"
          initial="plus"
          animate={controls}
        >
          <motion.line
            x1="10"
            y1="30"
            x2="50"
            y2="30"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            variants={{
              plus: { opacity: 1 },
              collapse: {
                x1: 30,
                x2: 30,
                opacity: 0,
                transition: { duration: 0.28 * speed },
              },
              uncollapse: {
                x1: 10,
                x2: 50,
                opacity: 1,
                transition: { duration: 0.28 * speed },
              },
            }}
          />

          <motion.line
            x1="30"
            y1="10"
            x2="30"
            y2="50"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            variants={{
              plus: { opacity: 1 },
              collapse: { opacity: 1 },
              stem: {
                x1: 28,
                y1: 42,
                x2: 45,
                y2: 25,
                transition: { duration: 0.32 * speed },
              },
              unstem: {
                x1: 30,
                y1: 10,
                x2: 30,
                y2: 50,
                transition: { duration: 0.32 * speed },
              },
            }}
          />

          <motion.line
            x1="28"
            y1="42"
            x2="18"
            y2="32"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ pathLength: 0 }}
            variants={{
              plus: { opacity: 0, pathLength: 0 },
              collapse: { opacity: 0, pathLength: 0 },
              stem: { opacity: 0, pathLength: 0 },
              tail: {
                opacity: 1,
                pathLength: 1,
                transition: { pathLength: { duration: 0.42 * speed } },
              },
              untail: {
                opacity: 0,
                pathLength: 0,
                transition: { pathLength: { duration: 0.3 * speed } },
              },
            }}
          />
        </motion.svg>
      </button>
    );
  },
);

WishlistButton.displayName = "WishlistButton";

export { WishlistButton, wishlistButtonVariants };
