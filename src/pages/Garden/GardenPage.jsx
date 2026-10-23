import { useState } from 'react'
import { Link } from 'react-router-dom'
import gardenDecoration from '../../assets/decorations/garden-page.webp'
import FocusGuide from '../../components/layout/FocusGuide/FocusGuide.jsx'
import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'
import AIResponse from '../../components/memory/AIResponse/AIResponse.jsx'
import MemoryCard from '../../components/memory/MemoryCard/MemoryCard.jsx'
import ResponseEvaluation from '../../components/memory/ResponseEvaluation/ResponseEvaluation.jsx'
import GardenBranchComposer from '../../components/garden/GardenBranchComposer/GardenBranchComposer.jsx'
import GardenMemoryMap from '../../components/garden/GardenMemoryMap/GardenMemoryMap.jsx'
import gardenCards from '../../data/gardenCards.js'
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
  canAnswerFollowUp,
  createConversation,
  createConversationRequest,
  skipQuestion,
} from '../../utils/conversation.js'

const emptyEvaluation = {
  decision: '',
  editedReflection: '',
  correction: '',
}

function GardenPage() {
  const gardenCard = gardenCards[0]
  const [isCardOpen, setIsCardOpen] = useState(false)
  const [conversation, setConversation] = useState(null)
  const [aiResponse, setAIResponse] = useState(null)
  const [isReflecting, setIsReflecting] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [focusArea, setFocusArea] = useState('memory')
  const [pendingTurn, setPendingTurn] = useState(false)
  const [selectedParentNumber, setSelectedParentNumber] = useState(null)
  const [reflectionError, setReflectionError] = useState('')
  const [evaluation, setEvaluation] = useState(emptyEvaluation)
  const [savedEntryId, setSavedEntryId] = useState('')
  const [saveError, setSaveError] = useState('')
  const currentStage = isEvaluating ? 3 : conversation ? 2 : 1
  const hasMap = Boolean(conversation && !isEvaluating)

  function focusOnNextStep() {
    setFocusArea('map')
    requestAnimationFrame(() => {
      if (!window.matchMedia('(max-width: 35rem)').matches) {
        return
      }

      document.getElementById('garden-memory-map')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    })
  }

  function handleSelectParent(parentNumber) {
    setSelectedParentNumber(parentNumber)
    setFocusArea('continue')

    requestAnimationFrame(() => {
      if (!window.matchMedia('(max-width: 35rem)').matches) {
        return
      }

      document.getElementById('garden-branch-composer')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    })
  }

  function resetSaveState() {
    setSavedEntryId('')
    setSaveError('')
  }

  function resetGarden() {
    setConversation(null)
    setAIResponse(null)
    setIsEvaluating(false)
    setFocusArea('memory')
    setPendingTurn(false)
    setSelectedParentNumber(null)
    setReflectionError('')
    setEvaluation(emptyEvaluation)
    resetSaveState()
  }

  async function handleMemorySubmit(memory) {
    resetGarden()

    try {
      setFocusArea('ai')
      setIsReflecting(true)
      const response = await requestReflection({
        cardId: gardenCard.id,
        memory,
      })
      const nextConversation = addAIResponse(
        createConversation(memory),
        response,
      )
      setConversation(nextConversation)
      setAIResponse(response)
      focusOnNextStep()
    } catch (error) {
      setReflectionError(error.message)
      setFocusArea('memory')
    } finally {
      setIsReflecting(false)
    }
  }

  async function submitContinuedReflection(nextConversation) {
    setReflectionError('')

    try {
      setFocusArea('ai')
      setIsReflecting(true)
      const response = await requestContinuedReflection(
        createConversationRequest({
          action: 'continue',
          cardId: gardenCard.id,
          conversation: nextConversation,
        }),
      )
      const completedConversation = addAIResponse(nextConversation, response)
      setConversation(completedConversation)
      setAIResponse(response)
      setPendingTurn(false)
      focusOnNextStep()
    } catch (error) {
      setReflectionError(error.message)
      setPendingTurn(true)
      setFocusArea('continue')
    } finally {
      setIsReflecting(false)
    }
  }

  function continueIfFollowUpRemains(nextConversation) {
    if (canAnswerFollowUp(nextConversation)) {
      submitContinuedReflection(nextConversation)
      return
    }

    setPendingTurn(false)
  }

  function handleBranchAnswer(answer, branchFromFragment) {
    if (!conversation || isReflecting || !Number.isInteger(branchFromFragment)) {
      return
    }

    const currentQuestion = conversation.aiResponses.at(-1)?.question
    const nextConversation = addMemoryFragment(conversation, {
      text: answer,
      questionAnswered: currentQuestion,
      branchFromFragment,
    })

    setConversation(nextConversation)
    setSelectedParentNumber(null)
    continueIfFollowUpRemains(nextConversation)
  }

  function handleSkipQuestion() {
    if (!conversation || isReflecting) {
      return
    }

    const currentQuestion = conversation.aiResponses.at(-1)?.question
    const nextConversation = skipQuestion(conversation, currentQuestion)

    setConversation(nextConversation)
    setSelectedParentNumber(null)
    continueIfFollowUpRemains(nextConversation)
  }

  function handleRetryContinuation() {
    if (conversation && !isReflecting) {
      submitContinuedReflection(conversation)
    }
  }

  function handleFinishMap() {
    setIsEvaluating(true)
    setFocusArea('evaluation')
    requestAnimationFrame(() => {
      document.getElementById('response-evaluation')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
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

    try {
      const entry = createArchiveEntry({
        card: gardenCard,
        conversation,
        evaluation,
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

  const focusTarget =
    focusArea === 'ai'
      ? 'ai-response'
      : focusArea === 'map'
        ? 'garden-memory-map'
      : focusArea === 'continue'
        ? 'garden-branch-composer'
        : focusArea === 'evaluation'
          ? 'response-evaluation'
          : `memory-card-${gardenCard.id}`

  return (
    <div className="site-shell">
      <FocusGuide targetId={focusTarget} />
      <SiteHeader />

      <main className="scene-main">
        <section
          className="scene-hero scene-hero--coming-soon scene-hero--garden"
          aria-labelledby="garden-title"
        >
          <img
            className="scene-hero__feature scene-hero__feature--coming-soon"
            src={gardenDecoration}
            alt=""
            aria-hidden="true"
          />
          <div className="scene-hero__content">
            <p>Garden memory</p>
            <PageHeading id="garden-title">The Garden</PageHeading>
            <p>
              Use this space to connect fragments about a family plant across
              people, places, and uses. You choose each connection and can leave
              uncertain details open.
            </p>
          </div>
        </section>

        <aside className="garden-reflection-note">
          <p>
            <em>
              The aim is to help you remember from your own experience. You
              choose what enters the map, while the AI may still interpret or
              misread your words. Notice when you ask it to fill a detail you
              cannot recall. How often does that happen, and what are you
              hoping it can supply?
            </em>
          </p>
        </aside>

        <nav className="reconstruction-progress" aria-label="Garden progress">
          {['Share a fragment', 'Grow your map', 'Review and save'].map(
            (label, index) => (
              <span
                key={label}
                className={currentStage >= index + 1 ? 'is-reached' : ''}
                aria-current={currentStage === index + 1 ? 'step' : undefined}
              >
                <strong>{index + 1}</strong> {label}
              </span>
            ),
          )}
        </nav>

        <section aria-labelledby="garden-card-title">
          <p className="section-step">Step 1: Start with your words</p>
          <h2 id="garden-card-title">A plant memory</h2>
          <p>
            This is a space for remembered details, not plant identification
            or care advice. AI prompts may help you recall fragments, but the
            AI can still infer or misunderstand. You write and connect every
            branch yourself.
          </p>
          <p className="garden-privacy-note">
            Use demonstration text only. Your fragment is sent to the
            configured AI provider, and saved traces stay in this browser.
          </p>
          <div
            className={`garden-memory-workspace${
              hasMap ? '' : ' garden-memory-workspace--start'
            }`}
          >
            <div className="memory-card-list">
              <MemoryCard
                card={gardenCard}
                isOpen={isCardOpen}
                isSubmitting={isReflecting}
                onMemoryChange={resetGarden}
                onOpen={() => {
                  setIsCardOpen(true)
                  resetGarden()
                }}
                onSubmit={handleMemorySubmit}
              />
            </div>
            {conversation && !isEvaluating && (
              <GardenMemoryMap
                fragments={conversation.memoryFragments}
                onSelectParent={isEvaluating || isReflecting ? undefined : handleSelectParent}
                selectedParentNumber={selectedParentNumber}
              />
            )}
          </div>

          {isReflecting && <p role="status">Generating a reflection...</p>}
          {reflectionError && !aiResponse && (
            <p role="alert">{reflectionError}</p>
          )}

          {aiResponse && (
            <div className="garden-memory-workspace garden-memory-workspace--response">
              <AIResponse isLoading={isReflecting} response={aiResponse} />
              {conversation && !isEvaluating && (
                <GardenBranchComposer
                  conversation={conversation}
                  error={reflectionError}
                  isSubmitting={isReflecting}
                  onAnswer={handleBranchAnswer}
                  onFinish={handleFinishMap}
                  onRetry={handleRetryContinuation}
                  onSkip={handleSkipQuestion}
                  pendingTurn={pendingTurn}
                  selectedParentNumber={selectedParentNumber}
                />
              )}
            </div>
          )}

          {isEvaluating && conversation && (
            <section
              className="reconstruction-review"
              aria-labelledby="garden-review-title"
            >
              <p className="section-step">Step 3: Review and save</p>
              <h2 id="garden-review-title">Review your memory map</h2>
              <p>
                The map contains your fragments and the connections you chose.
                The AI response is reviewed separately and does not become a
                map branch.
              </p>
              <GardenMemoryMap
                fragments={conversation.memoryFragments}
                id="garden-memory-map-review"
                selectedParentNumber={selectedParentNumber}
                title="Your map before saving"
              />
              <ResponseEvaluation
                evaluation={evaluation}
                isSaved={Boolean(savedEntryId)}
                onChange={handleEvaluationChange}
                onSave={handleSaveTrace}
                saveError={saveError}
                domain="garden"
                workingRecipe={null}
              />
            </section>
          )}
        </section>

        <nav className="garden-links" aria-label="Garden links">
          <Link to="/archive">View Living Archive</Link>
          <Link to="/kitchen">Visit the Kitchen</Link>
        </nav>
      </main>
    </div>
  )
}

export default GardenPage
