import * as React from "react";
import { cn } from "@/lib/utils"; // Ensure you have a utils.js for classNames

const Card = React.forwardRef(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("rounded-lg border bg-white p-4 shadow", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = ({ className, children }) => (
	<div className={cn("border-b pb-2", className)}>{children}</div>
);

const CardTitle = ({ className, children }) => (
	<h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
);

const CardContent = ({ className, children }) => (
	<div className={cn("py-2", className)}>{children}</div>
);

const CardFooter = ({ className, children }) => (
	<div className={cn("border-t pt-2 text-right", className)}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
