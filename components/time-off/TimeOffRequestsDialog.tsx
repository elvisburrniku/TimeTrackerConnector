'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Department, TimeOffRequest } from "@prisma/client"
import { useEffect, useState } from "react"
import { TimeOffRequestViewCard } from "@/components/time-off/TimeOffRequestViewCard"
import { approveTimeOff, getTimeOffRequestsByDeparmentId, rejectTimeOff } from "@/actions/time-off"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"

interface TimeOffRequestsDialogProps {
    department: Department
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

const statusFilters = [
    { value: 'ALL', label: 'All Requests' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
]

export function TimeOffRequestsDialog({
    department,
    isOpen,
    onOpenChange
}: TimeOffRequestsDialogProps) {
    const [requests, setRequests] = useState<TimeOffRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const { toast } = useToast()
    const { data: session } = useSession()

    const fetchRequests = async () => {
        try {
            const response = await getTimeOffRequestsByDeparmentId(department.id)
            if (response.error) {
                toast({
                    title: 'Error',
                    description: response.error,
                    variant: 'destructive'
                })
                return
            }
            setRequests(response.data ?? [])
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to fetch time off requests',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchRequests()
        }
    }, [isOpen, department.id])

    const handleApprove = async (requestId: string) => {
        if (!session?.user?.id) return
        try {
            const response = await approveTimeOff(requestId, session.user.id)
            if (response.error) {
                toast({
                    title: 'Error',
                    description: response.error,
                    variant: 'destructive'
                })
                return
            }
            toast({
                title: 'Success',
                description: response.success
            })
            fetchRequests()
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to approve request',
                variant: 'destructive'
            })
        }
    }

    const handleReject = async (requestId: string) => {
        if (!session?.user?.id) return
        try {
            const response = await rejectTimeOff(requestId, session.user.id)
            if (response.error) {
                toast({
                    title: 'Error',
                    description: response.error,
                    variant: 'destructive'
                })
                return
            }
            toast({
                title: 'Success',
                description: response.success
            })
            fetchRequests()
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to reject request',
                variant: 'destructive'
            })
        }
    }

    const filteredRequests = requests.filter(request => 
        statusFilter === 'ALL' || request.status === statusFilter
    )

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Time Off Requests - {department.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusFilters.map(filter => (
                                <SelectItem key={filter.value} value={filter.value}>
                                    {filter.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {loading ? (
                        <div className="flex justify-center p-8">
                            <LoadingSpinner />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No time off requests found
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRequests.map(request => (
                                <TimeOffRequestViewCard
                                    key={request.id}
                                    timeOffRequest={request}
                                    onApproved={() => handleApprove(request.id)}
                                    onRejected={() => handleReject(request.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}