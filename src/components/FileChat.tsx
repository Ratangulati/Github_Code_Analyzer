import React, { useMemo, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface FileChatProps {
  filePath?: string
  fileContent?: string
  onAsk: (question: string) => Promise<string>
}

const FileChat: React.FC<FileChatProps> = ({ filePath, fileContent, onAsk }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const canChat = useMemo(() => Boolean(filePath && fileContent), [filePath, fileContent])

  const send = async () => {
    if (!input.trim() || !canChat || loading) return
    const q: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, q])
    setInput('')
    setLoading(true)
    try {
      const answer = await onAsk(q.content)
      const a: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: answer }
      setMessages(prev => [...prev, a])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      send()
    }
  }

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">AI Q&A</h3>
        <p className="text-xs text-muted-foreground">
          {canChat ? `Chat about: ${filePath}` : 'Select a text file to start chatting'}
        </p>
      </div>
      <ScrollArea className="flex-1 pr-3 border rounded-md bg-secondary/30">
        <div className="p-3 space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`text-sm ${m.role === 'user' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className="font-medium mb-1">{m.role === 'user' ? 'You' : 'Assistant'}</div>
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="mt-3 flex gap-2">
        <Input
          placeholder={canChat ? 'Ask a question about the file...' : 'Select a file first'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={!canChat || loading}
        />
        <Button onClick={send} disabled={!canChat || loading || !input.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ask'}
        </Button>
      </div>
    </Card>
  )
}

export default FileChat


