import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ className, variant = "secondary", ...props }: ButtonProps) {
  return <button className={cn("button", variant, className)} {...props} />;
}
