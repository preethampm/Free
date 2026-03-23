'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { generateSlug, generateItemSlug } from '@/src/lib/slug'
import { Button } from '@/src/components/ui/button'
import { StepIndicator } from '@/src/components/ui/step-indicator'

interface ItemForm {
  name: string
  description: string
}

interface CriterionForm {
  label: string
  min_score: number
  max_score: number
}

export default function CreatePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [eventName, setEventName] = useState('')
  const [items, setItems] = useState<ItemForm[]>([{ name: '', description: '' }])
  const [criteria, setCriteria] = useState<CriterionForm[]>([
    { label: '', min_score: 1, max_score: 5 },
  ])
  const [submitting, setSubmitting] = useState(false)

  function addItem() {
    setItems([...items, { name: '', description: '' }])
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  function addCriterion() {
    setCriteria([...criteria, { label: '', min_score: 1, max_score: 5 }])
  }

  function removeCriterion(index: number) {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index))
    }
  }

  const slugPreview = generateSlug(eventName)
  const step1Valid = eventName.trim().length > 0
  const step2Valid = items.every((i) => i.name.trim().length > 0)
  const step3Valid = criteria.every((c) => c.label.trim().length > 0)

  async function handleCreate() {
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitting(false)
      return
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        organizer_id: user.id,
        name: eventName.trim(),
        slug: slugPreview,
      })
      .select()
      .single()

    if (eventError || !event) {
      console.error('Event creation error:', eventError)
      setSubmitting(false)
      return
    }

    // Create items
    const itemRows = items
      .filter((i) => i.name.trim())
      .map((item, index) => ({
        event_id: event.id,
        name: item.name.trim(),
        slug: generateItemSlug(item.name),
        description: item.description.trim() || null,
        sort_order: index,
      }))

    await supabase.from('event_items').insert(itemRows)

    // Create criteria
    const criteriaRows = criteria
      .filter((c) => c.label.trim())
      .map((criterion, index) => ({
        event_id: event.id,
        label: criterion.label.trim(),
        min_score: criterion.min_score,
        max_score: criterion.max_score,
        sort_order: index,
      }))

    await supabase.from('event_criteria').insert(criteriaRows)

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-md mx-auto">
        <StepIndicator current={step} total={4} />

        {/* Step 1: Event Name */}
        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Create an event</h1>
            <p className="text-gray-500 text-sm mb-6">
              Give your feedback event a name
            </p>

            <label className="block text-sm font-medium mb-1.5">Event name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. College Fest 2026"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black mb-2"
            />
            {slugPreview && (
              <p className="text-xs text-gray-400 mb-6">
                Link: /e/{slugPreview}
              </p>
            )}

            <Button onClick={() => setStep(2)} disabled={!step1Valid}>
              Next
            </Button>
          </div>
        )}

        {/* Step 2: Items */}
        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Add items</h1>
            <p className="text-gray-500 text-sm mb-6">
              What will people be rating? (games, stalls, rooms, etc.)
            </p>

            <div className="space-y-3 mb-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-xs text-gray-400 hover:text-black"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...items]
                      updated[index].name = e.target.value
                      setItems(updated)
                    }}
                    placeholder="e.g. Game 1: Ring Toss"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black mb-2"
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...items]
                      updated[index].description = e.target.value
                      setItems(updated)
                    }}
                    placeholder="Description (optional)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="w-full py-2.5 text-sm font-medium border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-black transition-all mb-6"
            >
              + Add item
            </button>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!step2Valid}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Criteria */}
        {step === 3 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Rating criteria</h1>
            <p className="text-gray-500 text-sm mb-6">
              What aspects will people rate?
            </p>

            <div className="space-y-3 mb-4">
              {criteria.map((criterion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Criterion {index + 1}</span>
                    {criteria.length > 1 && (
                      <button
                        onClick={() => removeCriterion(index)}
                        className="text-xs text-gray-400 hover:text-black"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={criterion.label}
                    onChange={(e) => {
                      const updated = [...criteria]
                      updated[index].label = e.target.value
                      setCriteria(updated)
                    }}
                    placeholder="e.g. How fun was it?"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black mb-2"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Min score</label>
                      <input
                        type="number"
                        value={criterion.min_score}
                        onChange={(e) => {
                          const updated = [...criteria]
                          updated[index].min_score = parseInt(e.target.value) || 1
                          setCriteria(updated)
                        }}
                        min={1}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Max score</label>
                      <input
                        type="number"
                        value={criterion.max_score}
                        onChange={(e) => {
                          const updated = [...criteria]
                          updated[index].max_score = parseInt(e.target.value) || 5
                          setCriteria(updated)
                        }}
                        min={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addCriterion}
              className="w-full py-2.5 text-sm font-medium border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-black transition-all mb-6"
            >
              + Add criterion
            </button>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!step3Valid}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Review</h1>
            <p className="text-gray-500 text-sm mb-6">
              Confirm your event details
            </p>

            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Event</p>
                <p className="font-medium">{eventName}</p>
                <p className="text-xs text-gray-400 mt-1">/e/{slugPreview}</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Items ({items.length})</p>
                {items.map((item, i) => (
                  <p key={i} className="text-sm">
                    {item.name}
                    {item.description && (
                      <span className="text-gray-400"> — {item.description}</span>
                    )}
                  </p>
                ))}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Criteria ({criteria.length})</p>
                {criteria.map((c, i) => (
                  <p key={i} className="text-sm">
                    {c.label} <span className="text-gray-400">({c.min_score}–{c.max_score})</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
