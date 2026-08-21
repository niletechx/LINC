import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { messagingApi, providersApi } from '../api'
import { useAuthStore } from '../store/authStore'
import { LoadingScreen, EmptyState, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function MessagesPage() {
  const [params] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const data = await messagingApi.conversations()
        setConversations(Array.isArray(data) ? data : data?.items || [])
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const providerId = params.get('provider')

  if (providerId) {
    return <StartConversation providerId={providerId} />
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Messages</h1>
      {loading && <LoadingScreen />}
      {error && <div className="mt-4"><ErrorAlert message={error} /></div>}
      {!loading && !error && conversations.length === 0 && (
        <EmptyState icon={MessageSquare} title="No conversations" description="Start chatting with a provider from their profile." />
      )}
      {!loading && conversations.length > 0 && (
        <div className="mt-6 space-y-2">
          {conversations.map((c) => (
            <Link key={c.id} to={`/messages/${c.id}`} className="glass-card flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 font-bold text-white">
                C
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">Conversation</p>
                <p className="truncate text-sm text-slate-500">{c.last_message_at ? new Date(c.last_message_at).toLocaleString() : 'No messages yet'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function StartConversation({ providerId }) {
  const { user } = useAuthStore()
  const [error, setError] = useState('')
  useEffect(() => {
    (async () => {
      try {
        const provider = await providersApi.get(providerId)
        const providerUserId = provider.user_id || provider.users?.id
        if (!providerUserId) throw new Error('Could not find provider user')
        const conv = await messagingApi.createConversation({
          participant_a_type: 'user',
          participant_a_id: user.id,
          participant_b_type: 'user',
          participant_b_id: providerUserId,
        })
        window.location.href = `/messages/${conv.id}`
      } catch (err) {
        setError(extractError(err))
      }
    })()
  }, [providerId, user?.id])

  if (error) return <ErrorAlert message={error} />
  return <LoadingScreen message="Starting conversation..." />
}
