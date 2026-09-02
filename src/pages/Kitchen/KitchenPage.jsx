import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'
import AIResponse from '../../components/memory/AIResponse/AIResponse.jsx'
import ConversationContinuation from '../../components/memory/ConversationContinuation/ConversationContinuation.jsx'
import ConversationTrail from '../../components/memory/ConversationTrail/ConversationTrail.jsx'
import MemoryCard from '../../components/memory/MemoryCard/MemoryCard.jsx'
import ReflectionGuide from '../../components/memory/ReflectionGuide/ReflectionGuide.jsx'
import ResponseEvaluation from '../../components/memory/ResponseEvaluation/ResponseEvaluation.jsx'
import kitchenCards from '../../data/kitchenCards.js'
import {
  createArchiveEntry,
  saveArchiveEntry,
} from '../../services/archiveStorage.js'
import {
  requestContinuedReflection,
  requestReflection,
} from '../../services/reflectionApi.js'
import {
  addAIResponse,
  addMemoryFragment,
  createConversation,
  createConversationRequest,
  skipQuestion,
} from '../../utils/conversation.js'

const emptyEvaluation = {
  decision: '',
  editedReflection: '',
  correction: '',
}

const MINIMUM_GUIDE_DURATION = 5500

function waitForGuide() {
  return new Promise((resolve) => setTimeout(resolve, MINIMUM_GUIDE_DURATION))
}

function KitchenPage() {
  const [activeCardId, setActiveCardId] = useState(null)
  const [submittedMemory, setSubmittedMemory] = useState('')
  const [aiResponse, setAIResponse] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [pendingTurn, setPendingTurn] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
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
    setConversation(null)
    setPendingTurn(false)
    setIsEvaluating(false)
    setReflectionError('')
    setEvaluation(emptyEvaluation)
    resetSaveState()
  }

  function handleMemoryChange() {
    setSubmittedMemory('')
    setAIResponse(null)
    setConversation(null)
    setPendingTurn(false)
    setIsEvaluating(false)
    setReflectionError('')
    setEvaluation(emptyEvaluation)
    resetSaveState()
  }

  async function handleMemorySubmit(memory) {
    setSubmittedMemory(memory)
    setAIResponse(null)
    setReflectionError('')
    setEvaluation(emptyEvaluation)
    setIsEvaluating(false)
    resetSaveState()

    try {
      setIsReflecting(true)
      const response = await requestReflection({
        cardId: activeCardId,
        memory,
      })
      setAIResponse(response)
      setConversation(addAIResponse(createConversation(memory), response))
    } catch (error) {
      setReflectionError(error.message)
    } finally {
      setIsReflecting(false)
    }
  }

  async function submitContinuedReflection(nextConversation) {
    setReflectionError('')
    setEvaluation(emptyEvaluation)
    setIsEvaluating(false)
    resetSaveState()

    try {
      setIsReflecting(true)
      const responseRequest = requestContinuedReflection(
        createConversationRequest({
          action: 'continue',
          cardId: activeCardId,
          conversation: nextConversation,
        }),
      ).then(
        (response) => ({ response }),
        (error) => ({ error }),
      )
      const [result] = await Promise.all([responseRequest, waitForGuide()])

      if (result.error) {
        throw result.error
      }

      const { response } = result
      const completedConversation = addAIResponse(nextConversation, response)

      setConversation(completedConversation)
      setAIResponse(response)
      setPendingTurn(false)
    } catch (error) {
      setReflectionError(error.message)
      setPendingTurn(true)
    } finally {
      setIsReflecting(false)
    }
  }

  function handleFollowUpAnswer(answer) {
    if (!conversation || isReflecting) {
      return
    }

    const currentQuestion = conversation.aiResponses.at(-1)?.question
    const nextConversation = addMemoryFragment(conversation, {
      text: answer,
      questionAnswered: currentQuestion,
    })

    setConversation(nextConversation)
    submitContinuedReflection(nextConversation)
  }

  function handleSkipQuestion() {
    if (!conversation || isReflecting) {
      return
    }

    const currentQuestion = conversation.aiResponses.at(-1)?.question
    const nextConversation = skipQuestion(conversation, currentQuestion)

    setConversation(nextConversation)
    submitContinuedReflection(nextConversation)
  }

  function handleRetryContinuation() {
    if (conversation && !isReflecting) {
      submitContinuedReflection(conversation)
    }
  }

  function handleFinishReconstruction() {
    setIsEvaluating(true)

    requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      document
        .getElementById('response-evaluation')
        ?.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        })
    })
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

      <main className="kitchen-main">
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
          <div className="reconstruction-workspace reconstruction-workspace--memory">
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

            {conversation && <ConversationTrail conversation={conversation} />}
          </div>

          {isReflecting && <p role="status">Generating a reflection...</p>}

          {reflectionError && !aiResponse && (
            <p role="alert">{reflectionError}</p>
          )}

          {aiResponse && (
            <>
              <div className="reconstruction-workspace reconstruction-workspace--response">
                <AIResponse isLoading={isReflecting} response={aiResponse} />
                <ConversationContinuation
                  conversation={conversation}
                  error={reflectionError}
                  isSubmitting={isReflecting}
                  onAnswer={handleFollowUpAnswer}
                  onFinish={handleFinishReconstruction}
                  onRetry={handleRetryContinuation}
                  onSkip={handleSkipQuestion}
                  pendingTurn={pendingTurn}
                />
                {isReflecting && <ReflectionGuide />}
              </div>

              {isEvaluating && (
                <ResponseEvaluation
                  evaluation={evaluation}
                  isSaved={Boolean(savedEntryId)}
                  onChange={handleEvaluationChange}
                  onSave={handleSaveTrace}
                  response={aiResponse}
                  saveError={saveError}
                />
              )}
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
