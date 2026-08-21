import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Send } from 'lucide-react'
import { aiApi, requestsApi, matchingApi } from '../api'
import ProviderCard from '../components/ProviderCard'
import { extractError } from '../api/client'
import { LoadingScreen, EmptyState, ErrorAlert, Spinner } from '../components/ui/Feedback'

export default function RequestNewPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState(params.get('q') || '')
  const [location, setLocation] = useState(params.get('location') || 'Addis Ababa')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [step, setStep] = useState('input') // input | results | done

  const runAI = async (e) => {
    e?.preventDefault()
    if (!message.trim()) { setError('Please describe what you need'); return }
    setLoading(true)
    setError('')
    try {
      const result = await aiApi.chat({ message: message.trim() })
      setAiResult(result)
      setStep('results')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const createRequestAndMatches = async () => {
    setLoading(true)
    setError('')
    try {
      const intent = aiResult?.intent || {}
      const request = await requestsApi.create({
        title: intent.category || message.slice(0, 80),
        description: message,
        ai_extracted_intent: intent,
        location_city: location,
        urgency: intent.urgency || 'normal',
        category_id: intent.category_id || undefined,
        budget_min: intent.budget_min,
        budget_max: intent.budget_max,
      })

      const providers = aiResult?.providers || []
      for (const p of providers.slice(0, 5)) {
        try {
          await matchingApi.create(request.id, {
            entity_type: p.entity_type || 'provider',
            entity_id: p.id || p.entity_id,
            match_score: p.match_score || p.score || 0,
            score_breakdown: p.score_breakdown || {},
            status: 'pending',
          })
        } catch { /* skip failed match */ }
      }

      navigate(`/requests/${request.id}`)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Describe Your Need</h1>
          <p className="text-sm text-slate-500">AI will understand and find the best matches</p>
        </div>
      </div>

      {step === 'input' && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={runAI} className="glass-card p-6">
          <label className="mb-2 block text-sm font-medium">What do you need?</label>
          <textarea
            className="input-field min-h-[120px]"
            placeholder='e.g. "My phone screen is broken and I need someone to fix it nearby"'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium">Location</label>
            <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
            {loading ? <span className="inline-flex items-center gap-2"><Spinner size={18} /> Analyzing...</span> : (
              <span className="inline-flex items-center gap-2"><Send size={18} /> Find Matches</span>
            )}
          </button>
        </motion.form>
      )}

      {step === 'results' && aiResult && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-6">
            <h2 className="font-semibold text-emerald-800">AI Understanding</h2>
            <p className="mt-2 text-slate-600">{aiResult.message}</p>
            {aiResult.intent && (
              <div className="mt-3 flex flex-wrap gap-2">
                {aiResult.intent.category && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    {aiResult.intent.category}
                  </span>
                )}
                {aiResult.intent.urgency && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {aiResult.intent.urgency} urgency
                  </span>
                )}
              </div>
            )}
          </div>

          <h2 className="mb-4 mt-6 text-lg font-semibold">Matched Providers</h2>
          {(aiResult.providers || []).length === 0 ? (
            <p className="text-slate-500">No providers matched yet. You can still save your request.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(aiResult.providers || []).map((p) => (
                <ProviderCard key={p.id || p.entity_id} provider={p} matchScore={p.match_score || p.score} />
              ))}
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={createRequestAndMatches} className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Request & View Matches'}
            </button>
            <button type="button" onClick={() => setStep('input')} className="btn-secondary">Edit</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
