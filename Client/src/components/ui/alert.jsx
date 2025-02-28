import React from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const alertVariants = {
    default: "bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50",
    destructive: "border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500"
};

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(
            // Base styles
            "relative w-full rounded-lg border border-slate-200 p-4",
            "[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px]",
            "[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-950",
            "dark:border-slate-800 dark:text-slate-50",
            // Animation styles
            "animate-in fade-in-0 slide-in-from-top-1 duration-300",
            "hover:shadow-lg transition-all",
            // Scale up slightly on hover
            "hover:scale-[1.02] transform-gpu",
            // Variant styles
            alertVariants[variant],
            className
        )}
        {...props}
    />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn(
            "mb-1 font-medium leading-none tracking-tight",
            "animate-in fade-in-0 slide-in-from-top-2 duration-300 delay-75",
            className
        )}
        {...props}
    />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "text-sm [&_p]:leading-relaxed",
            "animate-in fade-in-0 slide-in-from-top-3 duration-300 delay-150",
            className
        )}
        {...props}
    />
));
AlertDescription.displayName = "AlertDescription";

// Add animation keyframes
const GlobalStyles = () => (
    <style>{`
    @keyframes fade-in-0 {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slide-in-from-top-1 {
      from { transform: translateY(-0.5rem); }
      to { transform: translateY(0); }
    }

    @keyframes slide-in-from-top-2 {
      from { transform: translateY(-0.25rem); }
      to { transform: translateY(0); }
    }

    @keyframes slide-in-from-top-3 {
      from { transform: translateY(-0.125rem); }
      to { transform: translateY(0); }
    }

    .animate-in {
      animation-duration: 300ms;
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      animation-fill-mode: both;
    }

    .fade-in-0 {
      animation-name: fade-in-0;
    }

    .slide-in-from-top-1 {
      animation-name: slide-in-from-top-1;
    }

    .slide-in-from-top-2 {
      animation-name: slide-in-from-top-2;
    }

    .slide-in-from-top-3 {
      animation-name: slide-in-from-top-3;
    }

    .duration-300 {
      animation-duration: 300ms;
    }

    .delay-75 {
      animation-delay: 75ms;
    }

    .delay-150 {
      animation-delay: 150ms;
    }
  `}</style>
);

// Export everything together
export { Alert, AlertTitle, AlertDescription, GlobalStyles };