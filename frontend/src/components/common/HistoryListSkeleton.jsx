import { Skeleton } from "@/components/ui/skeleton";
const HistoryListSkeleton = () => {
    return (
        <div className="divide-y divide-border">
            {[1, 2, 3].map((index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center p-5 gap-4">
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                        <Skeleton className="size-14 rounded-full shrink-0" />
                        <div className="space-y-2 w-full sm:w-auto">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-36 sm:w-56" /> 
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-52 sm:w-80" /> 
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default HistoryListSkeleton