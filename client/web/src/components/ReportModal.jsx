import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { reportsApi } from '../api'
import { extractError } from '../api/client'

export default function ReportModal({ isOpen, onClose, entityType, entityId }) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await reportsApi.create({ entity_type: entityType, entity_id: entityId, reason, description })
      setSuccess(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass w-full max-w-md rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Report Content</h3>
              <button type="button" onClick={onClose}><X size={20} /></button>
            </div>
            {success ? (
              <p className="text-emerald-700">Report submitted. Thank you.</p>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Reason</label>
                  <select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)} required>
                    <option value="">Select reason</option>
                    <option value="spam">Spam</option>
                    <option value="fraud">Fraud</option>
                    <option value="harassment">Harassment</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Details</label>
                  <textarea className="input-field min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
