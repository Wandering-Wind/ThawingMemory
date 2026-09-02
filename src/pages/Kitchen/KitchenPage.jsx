import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'
import AIResponse from '../../components/memory/AIResponse/AIResponse.jsx'
import MemoryCard from '../../components/memory/MemoryCard/MemoryCard.jsx'
import ResponseEvaluation from '../../components/memory/ResponseEvaluation/ResponseEvaluation.jsx'
import kitchenCards from '../../data/kitchenCards.js'
import {
  createArchiveEntry,
  saveArchiveEntry,
} from '../../services/archiveStorage.js'
import { requestReflection } from '../../services/reflectionApi.js'

const emptyEvaluation = {
  decision: '',
  editedReflection: '',
  correction: '',
}

function KitchenPage() {
  const [activeCardId, setActiveCardId] = useState(null)
  const [submittedMemory, setSubmittedMemory] = useState('')
  const [aiResponse, setAIResponse] = useState(null)
  const [isReflecting, setIsReflecting] = useState(false)
  const [reflectionError, setReflectionError] = useState('')
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
    setAIResponse(null)
    setReflectionError('')
    setEvaluation(emptyEvaluation)
    resetSaveState()
  }

  function handleMemoryChange() {
    setSubmittedMemory('')
    setAIResponse(null)
    setReflectionError('')
    setEvaluation(emptyEvaluation)
    resetSaveState()
  }

  async function handleMemorySubmit(memory) {
    setSubmittedMemory(memory)
    setAIResponse(null)
    setReflectionError('')
    setEvaluation(emptyEvaluation)
    resetSaveState()

    try {
      setIsReflecting(true)
      const response = await requestReflection({
        cardId: activeCardId,
        memory,
      })
      setAIResponse(response)
    } catch (error) {
      setReflectionError(error.message)
    } finally {
      setIsReflecting(false)
    }
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

    if (
      evaluation.decision === 'edited' &&
      evaluation.editedReflection.trim() ===
        aiResponse?.reflection.trim()
    ) {
      setSaveError(
        'Change the AI reflection into your own words before saving an edited trace.',
      )
      return
    }

    const activeCard = kitchenCards.find((card) => card.id === activeCardId)

    if (!activeCard || !aiResponse) {
      setSaveError('The memory card could not be found. Please reopen it.')
      return
    }

    try {
      const entry = createArchiveEntry({
        card: activeCard,
        evaluation,
        memory: submittedMemory,
        response: aiResponse,
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
      <SiteHeader />

      <main>
        <section aria-labelledby="kitchen-title">
          <p>Kitchen Memory Reconstruction</p>
          <PageHeading id="kitchen-title">The Kitchen</PageHeading>
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
                isSubmitting={isReflecting && activeCardId === card.id}
                onMemoryChange={handleMemoryChange}
                onOpen={handleOpenMemory}
                onSubmit={handleMemorySubmit}
              />
            ))}
          </div>

          {isReflecting && <p role="status">Generating a reflection...</p>}

          {reflectionError && <p role="alert">{reflectionError}</p>}

          {aiResponse && (
            <>
              <AIResponse response={aiResponse} />
              <ResponseEvaluation
                evaluation={evaluation}
                isSaved={Boolean(savedEntryId)}
                onChange={handleEvaluationChange}
                onSave={handleSaveTrace}
                response={aiResponse}
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
