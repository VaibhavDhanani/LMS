import React from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const spinnerVariants = {
    default: "text-slate-950 dark:text-slate-50",
    primary: "text-blue-600 dark:text-blue-400",
    secondary: "text-purple-600 dark:text-purple-400",
    destructive: "text-red-600 dark:text-red-400"
};

const LoadingSpinner = React.forwardRef(({
                                             className,
                                             variant = "default",
                                             size = "default",
                                             ...props
                                         }, ref) => (
    <div
        ref={ref}
        role="status"
        className={cn(
            "relative inline-flex items-center justify-center",
            className
        )}
        {...props}
    >
        <div className={cn(
            // Base styles
            "inline-block animate-spin",
            // Size variations
            size === "small" && "h-4 w-4",
            size === "default" && "h-6 w-6",
            size === "large" && "h-8 w-8",
            // Variant colors
            spinnerVariants[variant]
        )}>
            <svg
                className="animate-spin"
                viewBox="0 0 24 24"
                fill="none"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
        <span className="sr-only">Loading...</span>
        <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `}</style>
    </div>
));

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };