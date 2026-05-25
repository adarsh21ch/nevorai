import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Broadcast {
  id: string
  name: string
  status: string
  total_leads_targeted: number
  total_sent: number
}

export function BroadcastsTab() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ['whatsapp-broadcasts', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      const res = await fetch(`/api/admin/whatsapp-broadcasts?${params}`)
      if (!res.ok) throw new Error('Failed to fetch broadcasts')
      return res.json()
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="px-2 py-1 border rounded"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
        </select>
        <Button disabled>Create Broadcast</Button>
      </div>

      {isLoading ? (
        <div>Loading broadcasts...</div>
      ) : broadcasts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No broadcasts created yet</div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((broadcast: Broadcast) => (
            <Card key={broadcast.id} className="p-4">
              <h3 className="font-semibold">{broadcast.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Targets: {broadcast.total_leads_targeted} | Sent: {broadcast.total_sent}
              </p>
              <div className="mt-2">
                <Badge>{broadcast.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
