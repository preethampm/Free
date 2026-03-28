'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { generateSlug, generateItemSlug } from '@/src/lib/slug'
import { Button } from '@/src/components/ui/button'
import { StepIndicator } from '@/src/components/ui/step-indicator'
import { AuthNavbar } from '@/src/components/auth-navbar'

interface ItemForm {
  name: string
  description: string
}

interface CriterionForm {
  label: string
  min_score: number
  max_score: number
}

type CriteriaMode = 'same' | 'different'

export default function CreatePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [eventName, setEventName] = useState('')
  const [items, setItems] = useState<ItemForm[]>([{ name: '', description: '' }])
  const [criteriaMode, setCriteriaMode] = useState<CriteriaMode>('same')
  const [criteria, setCriteria] = useState<CriterionForm[]>([
    { label: '', min_score: 1, max_score: 5 },
  ])
  const [itemCriteria, setItemCriteria] = useState<Record<string, CriterionForm[]>>({})
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

  function initItemCriteria() {
    const newItemCriteria: Record<string, CriterionForm[]> = {}
    items.forEach((item) => {
      const slug = generateItemSlug(item.name || `item-${Math.random()}`)
      if (!itemCriteria[slug]) {
        newItemCriteria[slug] = [{ label: '', min_score: 1, max_score: 5 }]
      } else {
        newItemCriteria[slug] = itemCriteria[slug]
      }
    })
    setItemCriteria(newItemCriteria)
  }

  function addItemCriterion(itemSlug: string) {
    setItemCriteria({
      ...itemCriteria,
      [itemSlug]: [...(itemCriteria[itemSlug] || []), { label: '', min_score: 1, max_score: 5 }],
    })
  }

  function removeItemCriterion(itemSlug: string, index: number) {
    const current = itemCriteria[itemSlug] || []
    if (current.length > 1) {
      setItemCriteria({
        ...itemCriteria,
        [itemSlug]: current.filter((_, i) => i !== index),
      })
    }
  }

  function updateItemCriterion(itemSlug: string, index: number, field: keyof CriterionForm, value: string | number) {
    const current = itemCriteria[itemSlug] || []
    const updated = [...current]
    if (field === 'label') {
      updated[index] = { ...updated[index], label: value as string }
    } else {
      updated[index] = { ...updated[index], [field]: parseInt(value as string) || 1 }
    }
    setItemCriteria({ ...itemCriteria, [itemSlug]: updated })
  }

  function handleCriteriaModeChange(mode: CriteriaMode) {
    setCriteriaMode(mode)
    if (mode === 'different') {
      initItemCriteria()
    }
  }

  const slugPreview = generateSlug(eventName)
  const step1Valid = eventName.trim().length > 0
  const step2Valid = items.every((i) => i.name.trim().length > 0)
  const step3ValidSame = criteria.every((c) => c.label.trim().length > 0)
  const step3ValidDifferent = items.every((item) => {
    const slug = generateItemSlug(item.name)
    const itemC = itemCriteria[slug]
    return itemC && itemC.every((c) => c.label.trim().length > 0)
  })
  const step3Valid = criteriaMode === 'same' ? step3ValidSame : step3ValidDifferent

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]/20 transition-all'
  const inputClassSm = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]/20 transition-all'

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
        criteria_mode: criteriaMode,
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

    const { data: insertedItems } = await supabase
      .from('event_items')
      .insert(itemRows)
      .select('id, slug')

    // Create criteria
    if (criteriaMode === 'same') {
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
    } else if (criteriaMode === 'different' && insertedItems) {
      // Create per-item criteria
      const itemCriteriaRows: Array<{
        item_id: string
        label: string
        min_score: number
        max_score: number
        sort_order: number
      }> = []

      insertedItems.forEach((item) => {
        const itemSlug = item.slug
        const itemC = itemCriteria[itemSlug] || []
        itemC.forEach((criterion, index) => {
          if (criterion.label.trim()) {
            itemCriteriaRows.push({
              item_id: item.id,
              label: criterion.label.trim(),
              min_score: criterion.min_score,
              max_score: criterion.max_score,
              sort_order: index,
            })
          }
        })
      })

      await supabase.from('item_criteria').insert(itemCriteriaRows)
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E1F5EE]/30 to-white">
      <AuthNavbar />
      <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
        <StepIndicator current={step} total={4} />

        {/* Step 1: Event Name */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-[#04342C] mb-1">Create an event</h1>
            <p className="text-gray-500 text-sm mb-8">
              Give your feedback event a name
            </p>

            <label className="block text-sm font-medium text-[#04342C] mb-2">Event name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. College Fest 2026"
              className={inputClass}
            />
            {slugPreview && (
              <p className="text-xs text-gray-400 mt-2 mb-6">
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
            <h1 className="text-2xl font-bold text-[#04342C] mb-1">Add items</h1>
            <p className="text-gray-500 text-sm mb-8">
              What will people be rating? (games, stalls, rooms, etc.)
            </p>

            <div className="space-y-3 mb-4">
              {items.map((item, index) => (
                <div key={index} className="border border-[#1D9E75]/15 rounded-2xl p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#1D9E75] bg-[#E1F5EE] rounded-full px-2.5 py-0.5">
                      Item {index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-all"
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
                    className={inputClassSm + ' mb-2'}
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
                    className={inputClassSm}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="w-full py-2.5 text-sm font-medium border border-dashed border-[#1D9E75]/30 rounded-xl text-[#1D9E75] hover:bg-[#E1F5EE]/50 hover:border-[#1D9E75] transition-all mb-6"
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
            <h1 className="text-2xl font-bold text-[#04342C] mb-1">Rating criteria</h1>
            <p className="text-gray-500 text-sm mb-6">
              What aspects will people rate?
            </p>

            {/* Criteria Mode Toggle */}
            <div className="mb-6">
              <label className="text-sm font-medium text-[#04342C] mb-3 block">
                Choose criteria approach
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCriteriaModeChange('same')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    criteriaMode === 'same'
                      ? 'border-[#1D9E75] bg-[#E1F5EE]/50'
                      : 'border-gray-200 hover:border-[#1D9E75]/30'
                  }`}
                >
                  <p className="font-medium text-[#04342C] text-sm">Same for all</p>
                  <p className="text-xs text-gray-500 mt-1">
                    One set of criteria for every item
                  </p>
                </button>
                <button
                  onClick={() => handleCriteriaModeChange('different')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    criteriaMode === 'different'
                      ? 'border-[#1D9E75] bg-[#E1F5EE]/50'
                      : 'border-gray-200 hover:border-[#1D9E75]/30'
                  }`}
                >
                  <p className="font-medium text-[#04342C] text-sm">Different per item</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Each item has its own criteria
                  </p>
                </button>
              </div>
            </div>

            {/* Same Criteria Mode */}
            {criteriaMode === 'same' && (
              <>
                <div className="space-y-3 mb-4">
                  {criteria.map((criterion, index) => (
                    <div key={index} className="border border-[#1D9E75]/15 rounded-2xl p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#1D9E75] bg-[#E1F5EE] rounded-full px-2.5 py-0.5">
                          Criterion {index + 1}
                        </span>
                        {criteria.length > 1 && (
                          <button
                            onClick={() => removeCriterion(index)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-all"
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
                        className={inputClassSm + ' mb-2'}
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
                            className={inputClassSm}
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
                            className={inputClassSm}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addCriterion}
                  className="w-full py-2.5 text-sm font-medium border border-dashed border-[#1D9E75]/30 rounded-xl text-[#1D9E75] hover:bg-[#E1F5EE]/50 hover:border-[#1D9E56] transition-all mb-6"
                >
                  + Add criterion
                </button>
              </>
            )}

            {/* Different Criteria Mode */}
            {criteriaMode === 'different' && (
              <div className="space-y-4 mb-4">
                {items.filter(i => i.name.trim()).map((item, itemIndex) => {
                  const itemSlug = generateItemSlug(item.name)
                  const itemC = itemCriteria[itemSlug] || []
                  
                  return (
                    <div key={itemIndex} className="border border-[#1D9E75]/15 rounded-2xl p-4 bg-white">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-medium text-[#1D9E75] bg-[#E1F5EE] rounded-full px-2.5 py-0.5">
                          {item.name}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {itemC.map((criterion, cIndex) => (
                          <div key={cIndex} className="border border-gray-100 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-400">Criterion {cIndex + 1}</span>
                              {itemC.length > 1 && (
                                <button
                                  onClick={() => removeItemCriterion(itemSlug, cIndex)}
                                  className="text-xs text-gray-400 hover:text-red-500 transition-all"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={criterion.label}
                              onChange={(e) => updateItemCriterion(itemSlug, cIndex, 'label', e.target.value)}
                              placeholder="e.g. How fun was it?"
                              className={inputClassSm + ' mb-2'}
                            />
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <label className="text-xs text-gray-400 mb-1 block">Min</label>
                                <input
                                  type="number"
                                  value={criterion.min_score}
                                  onChange={(e) => updateItemCriterion(itemSlug, cIndex, 'min_score', e.target.value)}
                                  min={1}
                                  className={inputClassSm}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs text-gray-400 mb-1 block">Max</label>
                                <input
                                  type="number"
                                  value={criterion.max_score}
                                  onChange={(e) => updateItemCriterion(itemSlug, cIndex, 'max_score', e.target.value)}
                                  min={2}
                                  className={inputClassSm}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => addItemCriterion(itemSlug)}
                        className="w-full mt-3 py-2 text-xs font-medium border border-dashed border-[#1D9E75]/30 rounded-lg text-[#1D9E75] hover:bg-[#E1F5EE]/50 transition-all"
                      >
                        + Add criterion for {item.name}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

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
            <h1 className="text-2xl font-bold text-[#04342C] mb-1">Review</h1>
            <p className="text-gray-500 text-sm mb-8">
              Confirm your event details
            </p>

            <div className="space-y-4 mb-8">
              <div className="border border-[#1D9E75]/15 rounded-2xl p-5 bg-white">
                <p className="text-xs font-medium text-[#1D9E75] mb-1.5">Event</p>
                <p className="font-semibold text-[#04342C]">{eventName}</p>
                <p className="text-xs text-gray-400 mt-1">/e/{slugPreview}</p>
              </div>

              <div className="border border-[#1D9E75]/15 rounded-2xl p-5 bg-white">
                <p className="text-xs font-medium text-[#1D9E75] mb-2">Items ({items.length})</p>
                {items.map((item, i) => (
                  <p key={i} className="text-sm text-[#04342C]">
                    {item.name}
                    {item.description && (
                      <span className="text-gray-400"> — {item.description}</span>
                    )}
                  </p>
                ))}
              </div>

              {/* Criteria Mode */}
              <div className="border border-[#1D9E75]/15 rounded-2xl p-5 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-[#1D9E75]">
                    Criteria Mode
                  </p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    criteriaMode === 'same' 
                      ? 'bg-[#E1F5EE] text-[#0F6E56]' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {criteriaMode === 'same' ? 'Same for all' : 'Different per item'}
                  </span>
                </div>

                {criteriaMode === 'same' ? (
                  <div className="space-y-1">
                    {criteria.map((c, i) => (
                      <p key={i} className="text-sm text-[#04342C]">
                        {c.label} <span className="text-gray-400">({c.min_score}–{c.max_score})</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.filter(i => i.name.trim()).map((item, i) => {
                      const itemSlug = generateItemSlug(item.name)
                      const itemC = itemCriteria[itemSlug] || []
                      return (
                        <div key={i}>
                          <p className="text-xs font-medium text-gray-500 mb-1">{item.name}</p>
                          {itemC.map((c, j) => (
                            <p key={j} className="text-sm text-[#04342C] pl-2">
                              {c.label} <span className="text-gray-400">({c.min_score}–{c.max_score})</span>
                            </p>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}
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
