import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Lead {
  id: string
  phone_number: string
  name: string
  status: string
  source: string
  lead_score: number
  tags: string[]
  last_contacted_at: string | null
}

export function LeadsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['whatsapp-leads-table', searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter) params.append('status', statusFilter)
      const res = await fetch(`/api/admin/whatsapp-leads?${params}`)
      if (!res.ok) throw new Error('Failed to fetch leads')
      return res.json()
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="px-2 py-1 border rounded"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="converted">Converted</option>
          <option value="dropped">Dropped</option>
        </select>
        <Button disabled>Import CSV</Button>
        <Button disabled>Add Lead</Button>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Last Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">Loading leads...</TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">No leads found</TableCell>
              </TableRow>
            ) : (
              leads.map((lead: Lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-semibold">{lead.name || '—'}</TableCell>
                  <TableCell>{lead.phone_number}</TableCell>
                  <TableCell>
                    <Badge variant={lead.status === 'active' ? 'default' : 'secondary'}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{lead.source}</TableCell>
                  <TableCell>{lead.lead_score}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {lead.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {lead.last_contacted_at
                      ? new Date(lead.last_contacted_at).toLocaleDateString()
                      : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
