import { Construction } from "lucide-react";

export default function UnderConstruction() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
            <Construction className="h-16 w-16 text-orange-500 mb-4" />

            <h1 className="text-3xl font-bold">
                Under Construction
            </h1>

            <p className="mt-2 max-w-md text-muted-foreground">
                This module is currently under development.
                Please check back later.
            </p>
        </div>
    );
}