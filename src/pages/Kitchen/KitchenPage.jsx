import { useState } from 'react'
import { Link } from 'react-router-dom'
import AIResponse from '../../components/memory/AIResponse/AIResponse.jsx'
import MemoryCard from '../../components/memory/MemoryCard/MemoryCard.jsx'
import ResponseEvaluation from '../../components/memory/ResponseEvaluation/ResponseEvaluation.jsx'
import developingAIResponse from '../../data/developingAIResponse.js'
import kitchenCards from '../../data/kitchenCards.js'
import {
  createArchiveEntry,
  saveArchiveEntry,
} from '../../services/archiveStorage.js'

const emptyEvaluation = {
  decision: '',
  editedReflection: '',
  correction: '',
}

function KitchenPage() {
  const [activeCardId, setActiveCardId] = useState(null)
  const [submittedMemory, setSubmittedMemory] = useState('')
  const [evaluation, setEvaluation] = useState(emptyEvaluation)
  const [savedEntryId, setSavedEntryId] = useState('')
  const [saveError, setSaveError] = useState('')

  function resetSaveState() {
    setSavedEntryId('')
    setSaveError('')
  }

  function handleOpenMemory(cardId) {
    setActiveCardId(cardId)
    setSubmittedMemory('')
    setEvaluation(emptyEvaluation)
    resetSaveState()
  }

  function handleMemoryChange() {
    setSubmittedMemory('')
    setEvaluation(emptyEvaluation)
    resetSaveState()
  }

  function handleMemorySubmit(memory) {
    setSubmittedMemory(memory)
    setEvaluation(emptyEvaluation)
    resetSaveState()
  }

  function handleEvaluationChange(nextEvaluation) {
    setEvaluation(nextEvaluation)
    resetSaveState()
  }

  function handleSaveTrace() {
    if (savedEntryId) {
      return
    }

    if (!evaluation.decision) {
      setSaveError('Choose how you want to respond before saving this trace.')
      return
    }

    if (
      evaluation.decision === 'edited' &&
      !evaluation.editedReflection.trim()
    ) {
      setSaveError('Add your version before saving an edited trace.')
      return
    }

    const activeCard = kitchenCards.find((card) => card.id === activeCardId)

    if (!activeCard) {
      setSaveError('The memory card could not be found. Please reopen it.')
      return
    }

    try {
      const entry = createArchiveEntry({
        card: activeCard,
        evaluation,
        memory: submittedMemory,
        response: developingAIResponse,
      })

      saveArchiveEntry(entry)
      setSavedEntryId(entry.id)
      setSaveError('')
    } catch {
      setSaveError(
        'This trace could not be saved in the browser. Your current memory is still here.',
      )
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/">Thawing Memory</Link>
      </header>

      <main>
        <section aria-labelledby="kitchen-title">
          <p>Kitchen Memory Reconstruction</p>
          <h1 id="kitchen-title">The Kitchen</h1>
          <p>
            Begin with a fragment of cooking knowledge remembered through
            observation, repetition, or the senses.
          </p>
        </section>

        <section aria-labelledby="memory-cards-title">
          <h2 id="memory-cards-title">Choose a memory</h2>
          <div className="memory-card-list">
            {kitchenCards.map((card) => (
              <MemoryCard
                key={card.id}
                card={card}
                isOpen={activeCardId === card.id}
                onMemoryChange={handleMemoryChange}
                onOpen={handleOpenMemory}
                onSubmit={handleMemorySubmit}
              />
            ))}
          </div>

          {submittedMemory && (
            <>
              <AIResponse response={developingAIResponse} />
              <ResponseEvaluation
                evaluation={evaluation}
                isSaved={Boolean(savedEntryId)}
                onChange={handleEvaluationChange}
                onSave={handleSaveTrace}
                response={developingAIResponse}
                saveError={saveError}
              />
            </>
          )}
        </section>

        <nav aria-label="Kitchen links">
          <Link to="/archive">View Living Archive</Link>
        </nav>
      </main>
    </div>
  )
}

export default KitchenPage
