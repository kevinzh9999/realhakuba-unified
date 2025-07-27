import * as React from "react"
import { cn } from "@/lib/utils/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
          variant === 'default' && "bg-primary text-white hover:bg-primary/90",
          variant === 'outline' && "border border-input bg-background hover:bg-accent",
          variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
