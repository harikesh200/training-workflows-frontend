import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkflowDetailSkeleton() {
    return (
        <div className="space-y-6" aria-label="Loading workflow">
            <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full max-w-xl" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
