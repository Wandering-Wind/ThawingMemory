import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import bananaLeafLeft from '../../assets/decorations/banana-leaf-left-cropped.svg'
import bananaLeafRight from '../../assets/decorations/banana-leaf-right-cropped.svg'
import kitchenFood from '../../assets/decorations/kitchen-food-cropped.svg'
import FocusGuide from '../../components/layout/FocusGuide/FocusGuide.jsx'
import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'
import AIResponse from '../../components/memory/AIResponse/AIResponse.jsx'
import ConversationContinuation from '../../components/memory/ConversationContinuation/ConversationContinuation.jsx'
import ConversationTrail from '../../components/memory/ConversationTrail/ConversationTrail.jsx'
import MemoryCard from '../../components/memory/MemoryCard/MemoryCard.jsx'
import ResponseEvaluation from '../../components/memory/ResponseEvaluation/ResponseEvaluation.jsx'
import WorkingRecipe from '../../components/memory/WorkingRecipe/WorkingRecipe.jsx'
import kitchenCards from '../../data/kitchenCards.js'
import {
  createArchiveEntry,
  saveArchiveEntry,
} from '../../services/archiveStorage.js'
import {
  requestContinuedReflection,
  requestReflection,
  requestWorkingRecipe,
} from '../../services/reflectionApi.js'
import {
  addAIResponse,
  addMemoryFragment,
  addWorkingRecipe,
  createConversation,
  createConversationRequest,
  skipQuestion,
} from '../../utils/conversation.js'

const emptyEvaluation = {
  decision: '',
  editedReflection: '',
  correction: '',
}

function KitchenPage() {
  const [activeCardId, setActiveCardId] = useState(null)
  const [submittedMemory, setSubmittedMemory] = useState('')
  const [aiResponse, setAIResponse] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [pendingTurn, setPendingTurn] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [focusArea, setFocusArea] = useState('memory')
  const [isReflecting, setIsReflecting] = useState(false)
  const [isBuildingRecipe, setIsBuildingRecipe] = useState(false)
  const [recipeError, setRecipeError] = useState('')
  const [reflectionError, setReflectionError] = useState('')
  const [evaluation, setEvaluation] = useState(emptyEvaluation)
  const [savedEntryId, setSavedEntryId] = useState('')
  const [saveError, setSaveError] = useState('')
  const focusTimer = useRef(null)

  useEffect(() => {
    return () => clearTimeout(focusTimer.current)
  }, [])

  function focusOnResponseThenContinue() {
    clearTimeout(focusTimer.current)
    setFocusArea('ai')
    focusTimer.current = setTimeout(() => setFocusArea('continue'), 4000)
  }

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
    setFocusArea('memory')
    setReflectionError('')
    setRecipeError('')
    setEvaluation(emptyEvaluation)
    resetSaveState()
  }

  function handleMemoryChange() {
    setSubmittedMemory('')
    setAIResponse(null)
    setConversation(null)
    setPendingTurn(false)
    setIsEvaluating(false)
    setFocusArea('memory')
    setReflectionError('')
    setRecipeError('')
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
      focusOnResponseThenContinue()
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
    clearTimeout(focusTimer.current)
    setFocusArea('ai')
    resetSaveState()

    try {
      setIsReflecting(true)
      const response = await requestContinuedReflection(
        createConversationRequest({
          action: 'continue',
          cardId: activeCardId,
          conversation: nextConversation,
        }),
      )
      const completedConversation = addAIResponse(nextConversation, response)

      setConversation(completedConversation)
      setAIResponse(response)
      setPendingTurn(false)
      focusOnResponseThenContinue()
    } catch (error) {
      setReflectionError(error.message)
      setPendingTurn(true)
      setFocusArea('continue')
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

  async function handleBuildWorkingRecipe() {
    if (!conversation || isBuildingRecipe) {
      return
    }

    clearTimeout(focusTimer.current)
    setRecipeError('')
    setIsEvaluating(false)
    setIsBuildingRecipe(true)
    setFocusArea('continue')

    try {
      const response = await requestWorkingRecipe(
        createConversationRequest({
          action: 'build',
          cardId: activeCardId,
          conversation,
        }),
      )
      setConversation(addWorkingRecipe(conversation, response.recipe))
      setFocusArea('recipe')
      setIsEvaluating(true)

      requestAnimationFrame(() => {
        document.getElementById('working-recipe')?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'start',
        })
      })
    } catch (error) {
      setRecipeError(error.message)
      setFocusArea('continue')
    } finally {
      setIsBuildingRecipe(false)
    }
  }

  function handleReturnToConversation() {
    setIsEvaluating(false)
    setFocusArea('continue')

    requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      document
        .getElementById('conversation-continuation')
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
      <FocusGuide
        targetId={
          focusArea === 'ai'
            ? 'ai-response'
            : focusArea === 'recipe'
              ? 'working-recipe'
            : focusArea === 'continue'
              ? 'conversation-continuation'
              : focusArea === 'evaluation'
                ? 'response-evaluation'
                : `memory-card-${activeCardId || kitchenCards[0].id}`
        }
      />
      <SiteHeader />

      <main className="kitchen-main">
        <section className="scene-hero scene-hero--kitchen" aria-labelledby="kitchen-title">
          <img className="scene-hero__leaf scene-hero__leaf--left" src={bananaLeafLeft} alt="" aria-hidden="true" />
          <img className="scene-hero__leaf scene-hero__leaf--right" src={bananaLeafRight} alt="" aria-hidden="true" />
          <img className="scene-hero__feature scene-hero__feature--food" src={kitchenFood} alt="" aria-hidden="true" />
          <div className="scene-hero__content">
            <p>Kitchen Memory Reconstruction</p>
            <PageHeading id="kitchen-title">The Kitchen</PageHeading>
            <p>
              Begin with a fragment of cooking knowledge remembered through
              observation, repetition, or the senses.
            </p>
          </div>
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
                  isBuilding={isBuildingRecipe}
                  isSubmitting={isReflecting || isBuildingRecipe}
                  onAnswer={handleFollowUpAnswer}
                  onBuild={handleBuildWorkingRecipe}
                  onRetry={handleRetryContinuation}
                  onSkip={handleSkipQuestion}
                  pendingTurn={pendingTurn}
                />
              </div>

              {recipeError && <p role="alert">{recipeError}</p>}

              {conversation?.workingRecipe && (
                <WorkingRecipe recipe={conversation.workingRecipe} />
              )}

              {isEvaluating && (
                <>
                  <button
                    className="button--gold-edge"
                    type="button"
                    onClick={handleReturnToConversation}
                  >
                    Return to the conversation
                  </button>
                  <ResponseEvaluation
                    evaluation={evaluation}
                    isSaved={Boolean(savedEntryId)}
                    onChange={handleEvaluationChange}
                    onSave={handleSaveTrace}
                    response={aiResponse}
                    saveError={saveError}
                    workingRecipe={conversation.workingRecipe}
                  />
                </>
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
