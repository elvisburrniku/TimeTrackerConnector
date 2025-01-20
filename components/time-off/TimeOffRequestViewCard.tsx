import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TimeOffRequest } from "@prisma/client";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";


interface TimeOffRequestViewCardProps {
    timeOffRequest: TimeOffRequest;
    onDeleted?: () => void;
    onRejected?: () => void;
}

export function TimeOffRequestViewCard({ timeOffRequest, onDeleted, onRejected }: TimeOffRequestViewCardProps) {
    return (
        <div
            className={cn(
                "p-4 rounded-lg border",
                TimeOffStatusColors[timeOffRequest.status]
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">Time Off Request</h4>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">
                        {timeOffRequest.status}
                    </Badge>
                    {onDeleted && (
                        <Button
                            onClick={onDeleted}
                            className="text-white hover:text-red-700"
                            aria-label="Delete request">
                            <Trash2 />
                        </Button>
                    )}

                    {onRejected && timeOffRequest.status === 'PENDING' && (
                        <Button
                            onClick={onRejected}
                            className="text-red hover:text-red-700"
                            aria-label="Reject request">
                            <Trash2 />

                        </Button>

                    )}

                </div>
            </div>
            <p className="text-sm mb-2">
                Type: {timeOffRequest.requestType}
            </p>
            {timeOffRequest.message && (
                <p className="text-sm italic">
                    &quot;{timeOffRequest.message}&quot;
                </p>
            )}
        </div>
    );
}

// Add status color mapping
export const TimeOffStatusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    NOTSUBMITTED: 'bg-gray-100 text-gray-800 border-gray-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200'
} as const
