// import * as React from "react"
// import { Slot } from "@radix-ui/react-slot"
// import { cva, type VariantProps } from "class-variance-authority"

// import { cn } from "@/lib/utils"

// const buttonVariants = cva(
//   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
//   {
//     variants: {
//       variant: {
//         default: "bg-primary text-primary-foreground hover:bg-primary/90",
//         destructive:
//           "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
//         outline:
//           "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
//         secondary:
//           "bg-secondary text-secondary-foreground hover:bg-secondary/80",
//         ghost:
//           "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
//         link: "text-primary underline-offset-4 hover:underline",
//       },
//       size: {
//         default: "h-9 px-4 py-2 has-[>svg]:px-3",
//         sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
//         lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
//         icon: "size-9",
//         "icon-sm": "size-8",
//         "icon-lg": "size-10",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// )

// function Button({
//   className,
//   variant,
//   size,
//   asChild = false,
//   ...props
// }: React.ComponentProps<"button"> &
//   VariantProps<typeof buttonVariants> & {
//     asChild?: boolean
//   }) {
//   const Comp = asChild ? Slot : "button"

//   return (
//     <Comp
//       data-slot="button"
//       className={cn(buttonVariants({ variant, size, className }))}
//       {...props}
//     />
//   )
// }

// export { Button, buttonVariants }

import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  size = "medium",
  variant = "default",
  block = false,
  loading = false,
  disabled = false,
  iconRight = null,
  className = "",
  ...props
}) {
  // --- Size Classes ---
  const sizeClasses = {
    small: "py-1.5 text-12 min-h-8",
    medium: "py-2 text-14 min-h-10",
    large: "py-3 text-16 min-h-12",
  };

  // --- Variant Classes ---
  const variantClasses = {
    default: "bg-black-800 text-white",
    secondary: "border border-black-800 text-800",
    ghost: "text-black",
    link: "text-blue-600 underline-offset-2 hover:underline p-0 min-h-0",
  };

  // --- Disabled Classes (independent of loading) ---
  const disabledClasses =
    "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed pointer-events-none";

  // --- Spinner ---
  const Spinner = () => (
    <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
  );

  return (
    <button
      {...props}
      disabled={disabled} // ONLY disabled affects actual disabled attribute
      className={clsx(
        "rounded-xl font-medium transition-all",

        // active scale only when NOT disabled
        !disabled && "active:scale-[0.97]",

        sizeClasses[size],
        variantClasses[variant],
        variant === "link" ? "" : "px-4",
        block && "w-full block",

        // apply disabled styles ONLY when disabled=true
        disabled && disabledClasses,

        className
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <span>{children}</span>

        {/* Spinner shows whenever loading=true, even if disabled */}
        {loading && <Spinner />}

        {/* Right icon only when NOT loading */}
        {!loading && iconRight && (
          <span className="flex items-center">{iconRight}</span>
        )}
      </div>
    </button>
  );
}
