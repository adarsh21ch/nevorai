import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

interface Lead {
  id: string
  phone_number: string
  name: string
  status: string
  tags: string[]
  lead_score: number
  last_contacted_at: string | null
}

interface Message {
  id: string
  direction: 'inbound' | 'outbound'
  message_body: string
  delivery_status: string
  sent_at: string
  created_at: string
}

export function ConversationsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['whatsapp-leads', searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter) params.append('status', statusFilter)
      const res = await fetch(`/api/admin/whatsapp-leads?${params}`)
      if (!res.ok) throw new Error('Failed to fetch leads')
      return res.json()
    }
  })

  const selectedLead = leads.find((l: Lead) => l.id === selectedLeadId)

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['whatsapp-messages', selectedLeadId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/whatsapp-messages/${selectedLeadId}`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json()
    },
    enabled: !!selectedLeadId
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await fetch('/api/admin/whatsapp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_phone: selectedLead?.phone_number, message_body: body })
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    },
    onSuccess: () => setMessageInput('')
  })

  return (
    <div className="flex gap-4 h-[calc(100vh-200px)]">
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 sticky top-0 bg-white border-b">
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="w-full px-2 py-1 border rounded"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="converted">Converted</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>
        {leadsLoading ? (
          <div className="p-4">Loading leads...</div>
        ) : (
          <div>
            {leads.map((lead: Lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedLeadId === lead.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-semibold">{lead.name || lead.phone_number}</div>
                <div className="text-sm text-gray-500">{lead.phone_number}</div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {lead.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-2/3 flex flex-col">
        {selectedLead ? (
          <>
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-bold text-lg">{selectedLead.name || selectedLead.phone_number}</h2>
              <p className="text-sm text-gray-600">{selectedLead.phone_number}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {messagesLoading ? (
                <div>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet</div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg max-w-md ${
                        msg.direction === 'outbound'
                          ? 'ml-auto bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p>{msg.message_body}</p>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => messageInput && sendMessageMutation.mutate(messageInput)}
                  disabled={!messageInput}
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a lead to view conversation
          </div>
        )}
      </div>
    </div>
  )
}
