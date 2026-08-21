import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Send, Sparkles } from 'lucide-react'
import { messagingApi } from '../api'
import { useAuthStore } from '../store/authStore'
import { getSocket } from '../hooks/useSocket'
import { LoadingScreen, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function ChatPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [aiResponses, setAiResponses] = useState({})
  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    (async () => {
      try {
        const data = await messagingApi.messages(id)
        setMessages(Array.isArray(data?.messages) ? data.messages : Array.isArray(data) ? data : [])
        await messagingApi.markRead(id).catch(() => {})
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket
    if (!socket.connected) socket.connect()
    socket.emit('join_conversation', { conversationId: id })

    const onMessage = (msg) => {
      if (msg.conversation_id === id) setMessages((prev) => [...prev, msg])
    }
    const onAI = ({ messageId, aiResponse }) => {
      setAiResponses((prev) => ({ ...prev, [messageId]: aiResponse }))
    }

    socket.on('new_message', onMessage)
    socket.on('ai_advisor_response', onAI)

    return () => {
      socket.off('new_message', onMessage)
      socket.off('ai_advisor_response', onAI)
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiResponses])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const content = text.trim()
    setText('')

    try {
      const msg = await messagingApi.sendMessage(id, { content })
      setMessages((prev) => [...prev, msg])

      const socket = socketRef.current
      if (socket?.connected) {
        socket.emit('send_message', {
          conversationId: id,
          senderId: user.id,
          senderType: 'user',
          content,
        })
      }
    } catch (err) {
      setError(extractError(err))
    }
  }

  if (loading) return <LoadingScreen />
  if (error && messages.length === 0) return <ErrorAlert message={error} />

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link to="/messages" className="mb-3 text-sm text-emerald-700">← Back</Link>
      <div className="glass-card flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => {
            const isMe = m.sender_id === user?.id
            return (
              <div key={m.id}>
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMe ? 'bg-blue-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'
                  }`}>
                    {m.content}
                  </div>
                </div>
                {aiResponses[m.id] && (
                  <div className="mt-2 flex justify-start">
                    <div className="max-w-[85%] rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm">
                      <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-violet-700">
                        <Sparkles size={12} /> @AI Trust Advisor
                      </div>
                      <p className="text-slate-700">{aiResponses[m.id]}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="border-t border-slate-100 p-3">
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder='Type a message... (use @AI for trust advice)'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="btn-primary px-4"><Send size={18} /></button>
          </div>
        </form>
      </div>
    </div>
  )
}
