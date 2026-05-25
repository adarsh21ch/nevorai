import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Automation {
  id: string
  name: string
  description: string
  trigger_type: string
  status: string
  sequence_steps: unknown[]
}

export function AutomationsTab() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['whatsapp-automations', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      const res = await fetch(`/api/admin/whatsapp-automations?${params}`)
      if (!res.ok) throw new Error('Failed to fetch automations')
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
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>
        <Button disabled>Create Automation</Button>
      </div>

      {isLoading ? (
        <div>Loading automations...</div>
      ) : automations.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No automations created yet</div>
      ) : (
        <div className="space-y-3">
          {automations.map((automation: Automation) => (
            <Card key={automation.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{automation.name}</h3>
                  <p className="text-sm text-gray-600">{automation.description}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge>{automation.trigger_type}</Badge>
                    <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                      {automation.status}
                    </Badge>
                    <Badge variant="outline">
                      {automation.sequence_steps?.length || 0} steps
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" disabled>Edit</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
