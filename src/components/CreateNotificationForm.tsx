'use client'

import { useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { type Locale } from '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  useSendNotificationMutation,
  useGetTeamMembersQuery,
} from '@/features/api/apiSlice'

interface CreateNotificationFormProps {
  locale?: Locale
  onBack: () => void
}

export function CreateNotificationForm({ onBack }: CreateNotificationFormProps) {
  const { data: members } = useGetTeamMembersQuery()
  const [sendNotification] = useSendNotificationMutation()

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])

  const toggleRecipient = (id: string) => {
    setRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!title.trim() || !message.trim() || recipients.length === 0) return
    sendNotification({ title: title.trim(), message: message.trim(), recipients })
      .unwrap()
      .then(() => onBack())
      .catch((err) => {
        console.error('send notification failed', err)
      })
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='bg-[#0F1A24] px-4 py-4 md:px-8 md:py-1'>
        <div className='flex items-center justify-between max-w-4xl mx-auto'>
          <button onClick={onBack} className='text-[#D4B896] hover:text-white transition-colors p-1'>
            <ArrowLeft className='w-6 h-6' />
          </button>
          <h1 className='text-[#D4B896] text-xl md:text-2xl font-semibold text-center flex-1'>
            New Alert
          </h1>
          <div className='w-8 md:w-0'></div>
        </div>
      </div>

      <div className='px-4 py-6 md:px-8 md:py-8 pb-24'>
        <div className='max-w-2xl mx-auto space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className='w-full h-12' />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Message</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className='w-full h-32' />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Recipients</label>
            <div className='space-y-2 bg-white rounded-xl border border-gray-200 p-4 max-h-40 overflow-y-auto'>
              {members?.map((m) => (
                <label key={m.id} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    className='rounded'
                    checked={recipients.includes(m.id)}
                    onChange={() => toggleRecipient(m.id)}
                  />
                  <span>{m.name}</span>
                </label>
              ))}
              {(!members || members.length === 0) && (
                <p className='text-sm text-gray-500'>No team members</p>
              )}
            </div>
          </div>

          <button
            type='button'
            onClick={handleSubmit}
            className='w-full h-12 bg-[#D4B896] hover:bg-[#C4A886] text-white rounded-lg font-medium flex items-center justify-center gap-2'
          >
            <Send className='w-5 h-5' />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}
