import { useState } from 'react'
import yourMemoryDecoration from '../../../assets/decorations/YourMemory.svg'

const MEMORY_LIMIT = 2000

function MemoryEntryForm({ card, isSubmitting, onMemoryChange, onSubmit }) {
  const [memory, setMemory] = useState('')
  const [error, setError] = useState('')

  const inputId = `${card.id}-memory`
  const helperId = `${card.id}-helper`
  const countId = `${card.id}-count`
  const errorId = `${card.id}-error`

  function handleChange(event) {
    setMemory(event.target.value)
    setError('')
    onMemoryChange()
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!memory.trim()) {
      setError('Add a memory fragment before asking for a reflection.')
      return
    }

    setError('')
    onSubmit(memory)
  }

  const describedBy = [helperId, countId, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  return (
    <form className="memory-entry-form" onSubmit={handleSubmit} noValidate>
      <img
        className="memory-entry-form__decoration"
        src={yourMemoryDecoration}
        alt=""
        aria-hidden="true"
      />
      <p>{card.prompt}</p>

      <label htmlFor={inputId}>What do you remember?</label>
      <p id={helperId}>
        A fragment is enough. You can use English, Malayalam,
        transliteration, or words specific to your family.
      </p>
      <textarea
        id={inputId}
        name="memory"
        value={memory}
        maxLength={MEMORY_LIMIT}
        rows="8"
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        onChange={handleChange}
        placeholder="For example: My grandmother listened for a change in the sound of the pan..."
      />

      <p id={countId}>
        {memory.length} of {MEMORY_LIMIT} characters
      </p>

      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}

      <button
        className="primary-action--ornate"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Reflecting...' : 'Reflect with AI'}
      </button>
    </form>
  )
}

export default MemoryEntryForm
