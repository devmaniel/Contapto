import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export const PhoneInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    const { onChange, value, className, ...restProps } = props
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Get only digits from input
      let digits = e.target.value.replace(/\D/g, "")

      // Convert 09 to 9
      if (digits.startsWith("09")) {
        digits = digits.slice(1)
      }

      // Limit to 10 digits
      if (digits.length > 10) {
        digits = digits.slice(0, 10)
      }

      // Format as +63 + digits for the form value
      const formatted = digits ? `+63${digits}` : ""

      // Call onChange with a synthetic event compatible with RHF
      onChange?.({
        ...e,
        target: {
          ...e.target,
          name: (e.target as HTMLInputElement).name,
          value: formatted,
        },
      } as React.ChangeEvent<HTMLInputElement>)
    }

    // Extract digits from value for display (remove +63 prefix)
    let displayValue = ""
    if (typeof value === "string") {
      if (value.startsWith("+63")) {
        displayValue = value.slice(3)
      } else if (value.startsWith("63")) {
        displayValue = value.slice(2)
      } else {
        displayValue = value
      }
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          placeholder="9xxxxxxxxx"
          maxLength={10}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            "pl-17",
            className
          )}
          {...restProps}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-700 font-medium pointer-events-none">
          <span>🇵🇭</span>
          <span>+63</span>
        </span>
      </div>
    )
  }
)

PhoneInput.displayName = "PhoneInput"
