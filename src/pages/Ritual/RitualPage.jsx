import { useEffect, useRef, useState } from 'react'
import ritualDecoration from '../../assets/decorations/ritual-page.webp'
import FocusGuide from '../../components/layout/FocusGuide/FocusGuide.jsx'
import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SectionNavigation from '../../components/layout/SectionNavigation/SectionNavigation.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'
import AIResponse from '../../components/memory/AIResponse/AIResponse.jsx'
import ResponseEvaluation from '../../components/memory/ResponseEvaluation/ResponseEvaluation.jsx'
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
} from '../../utils/conversation.js'
import {
  createArchiveEntry,
  saveArchiveEntry,
} from '../../services/archiveStorage.js'

const MAX_FRAGMENT_LENGTH = 2000
const RITUAL_CARD_ID = 'ritual-family-memory'
const ritualCard = {
  id: RITUAL_CARD_ID,
  domain: 'ritual',
  title: 'A Practice Remembered',
  prompt: 'Build a sequence from remembered family moments.',
}
const emptyEvaluation = {
  decision: '',
  editedReflection: '',
  correction: '',
}

function createMoment(text) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
  }
}

function RitualPage() {
  const [moments, setMoments] = useState([])
  const [unplacedMoments, setUnplacedMoments] = useState([])
  const [conversation, setConversation] = useState(null)
  const [aiResponse, setAIResponse] = useState(null)
  const [isReflecting, setIsReflecting] = useState(false)
  const [firstFragment, setFirstFragment] = useState('')
  const [nextFragment, setNextFragment] = useState('')
  const [placement, setPlacement] = useState('after')
  const [error, setError] = useState('')
  const [reflectionError, setReflectionError] = useState('')
  const [isRestartConfirming, setIsRestartConfirming] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [focusArea, setFocusArea] = useState('memory')
  const [evaluation, setEvaluation] = useState(emptyEvaluation)
  const [savedEntryId, setSavedEntryId] = useState('')
  const [saveError, setSaveError] = useState('')
  const firstFragmentInput = useRef(null)

  function addFirstMoment(event) {
    event.preventDefault()
    const text = firstFragment.trim()

    if (!text) {
      setError('Write a memory fragment before adding it to the timeline.')
      return
    }

    const firstMoment = createMoment(text)
    setMoments([firstMoment])
    setFirstFragment('')
    setError('')
    setFocusArea('ai')
    requestInitialReflection(text)
  }

  async function requestInitialReflection(text) {
    setAIResponse(null)
    setReflectionError('')
    setIsReflecting(true)

    try {
      const response = await requestReflection({
        cardId: RITUAL_CARD_ID,
        memory: text,
      })
      const nextConversation = addAIResponse(createConversation(text), response)
      setConversation(nextConversation)
      setAIResponse(response)
      setFocusArea('continue')
    } catch (requestError) {
      setReflectionError(requestError.message)
      setFocusArea('ai')
    } finally {
      setIsReflecting(false)
    }
  }

  async function requestRitualContinuation(nextConversation) {
    setReflectionError('')
    setIsReflecting(true)

    try {
      const response = await requestContinuedReflection(
        createConversationRequest({
          action: 'continue',
          cardId: RITUAL_CARD_ID,
          conversation: nextConversation,
        }),
      )
      const completedConversation = addAIResponse(nextConversation, response)
      setConversation(completedConversation)
      setAIResponse(response)
      setFocusArea('continue')
    } catch (requestError) {
      setConversation(nextConversation)
      setReflectionError(requestError.message)
      setFocusArea('ai')
    } finally {
      setIsReflecting(false)
    }
  }

  function retryReflection() {
    if (isReflecting) {
      return
    }

    if (!conversation && moments[0]) {
      requestInitialReflection(moments[0].text)
      return
    }

    if (conversation) {
      requestRitualContinuation(conversation)
    }
  }

  function addMoment(event) {
    event.preventDefault()
    const text = nextFragment.trim()

    if (!text) {
      setError('Write a memory fragment before adding it to the timeline.')
      return
    }

    const moment = createMoment(text)

    if (placement === 'before') {
      setMoments((currentMoments) => [moment, ...currentMoments])
    } else if (placement === 'unknown') {
      setUnplacedMoments((currentMoments) => [...currentMoments, moment])
    } else {
      setMoments((currentMoments) => [...currentMoments, moment])
    }

    setNextFragment('')
    setError('')

    if (conversation && canAnswerFollowUp(conversation) && aiResponse) {
      const nextConversation = addMemoryFragment(conversation, {
        text,
        questionAnswered: aiResponse.question,
      })
      setConversation(nextConversation)

      if (canAnswerFollowUp(nextConversation)) {
        requestRitualContinuation(nextConversation)
      }
    }
  }

  function moveMoment(momentId, direction) {
    setMoments((currentMoments) => {
      const currentIndex = currentMoments.findIndex(
        (moment) => moment.id === momentId,
      )
      const nextIndex = currentIndex + direction

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentMoments.length) {
        return currentMoments
      }

      const reorderedMoments = [...currentMoments]
      const movedMoment = reorderedMoments[currentIndex]
      reorderedMoments[currentIndex] = reorderedMoments[nextIndex]
      reorderedMoments[nextIndex] = movedMoment
      return reorderedMoments
    })
  }

  function leaveOrderOpen(momentId) {
    const moment = moments.find((item) => item.id === momentId)

    if (!moment) {
      return
    }

    setMoments((currentMoments) => {
      return currentMoments.filter((item) => item.id !== momentId)
    })

    setUnplacedMoments((currentMoments) => [...currentMoments, moment])
  }

  function placeMoment(momentId) {
    const moment = unplacedMoments.find((item) => item.id === momentId)

    if (!moment) {
      return
    }

    setUnplacedMoments((currentMoments) =>
      currentMoments.filter((item) => item.id !== momentId),
    )
    setMoments((currentMoments) => [...currentMoments, moment])
  }

  function restartMemory() {
    setMoments([])
    setUnplacedMoments([])
    setConversation(null)
    setAIResponse(null)
    setFirstFragment('')
    setNextFragment('')
    setPlacement('after')
    setError('')
    setReflectionError('')
    setIsRestartConfirming(false)
    setIsEvaluating(false)
    setEvaluation(emptyEvaluation)
    setSavedEntryId('')
    setSaveError('')
    setFocusArea('memory')
    requestAnimationFrame(() => firstFragmentInput.current?.focus())
  }

  const hasMoments = moments.length > 0 || unplacedMoments.length > 0
  const focusTarget =
    focusArea === 'ai'
      ? isReflecting
        ? 'ritual-reflection-status'
        : reflectionError
          ? 'ritual-reflection-error'
          : 'ritual-ai-response'
      : focusArea === 'continue'
        ? 'ritual-follow-up'
        : focusArea === 'review'
          ? 'ritual-review'
          : hasMoments
            ? 'ritual-sequence'
            : 'ritual-first-fragment'

  useEffect(() => {
    if (focusArea === 'memory') {
      return
    }

    const frame = requestAnimationFrame(() => {
      if (!window.matchMedia('(max-width: 35rem)').matches) {
        return
      }

      document.getElementById(focusTarget)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [focusArea, focusTarget])

  function handleFinishMemory() {
    setIsEvaluating(true)
    setFocusArea('review')
    requestAnimationFrame(() => {
      document.getElementById('ritual-review')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    })
  }

  function handleEvaluationChange(nextEvaluation) {
    setEvaluation(nextEvaluation)
    setSavedEntryId('')
    setSaveError('')
  }

  function handleSaveTrace() {
    if (!conversation || !evaluation.decision || savedEntryId) {
      return
    }

    if (evaluation.decision === 'edited' && !evaluation.editedReflection.trim()) {
      setSaveError('Add your note before saving an edited trace.')
      return
    }

    try {
      const entry = createArchiveEntry({
        card: ritualCard,
        conversation,
        evaluation,
      })
      entry.ritualSequence = {
        orderedMoments: moments.map(({ text }) => text),
        unplacedMoments: unplacedMoments.map(({ text }) => text),
      }
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
      <FocusGuide targetId={focusTarget} />
      <SiteHeader />

      <main className="scene-main">
        <section
          className="scene-hero scene-hero--coming-soon scene-hero--ritual"
          aria-labelledby="ritual-title"
        >
          <img
            className="scene-hero__feature scene-hero__feature--coming-soon"
            src={ritualDecoration}
            alt=""
            aria-hidden="true"
          />
          <div className="scene-hero__content">
            <p>Family memory</p>
            <PageHeading id="ritual-title">A Practice Remembered</PageHeading>
            <p>
              This space is for remembering family rituals and everyday
              routines, not religious rituals or teaching. You might remember
              what snacks accompanied evening tea, or when your family gathered
              flowers for Onam pookallam. Your family account does not need to
              match anyone else&apos;s.
            </p>
          </div>
        </section>

        <section className="ritual-workspace" aria-labelledby="ritual-start-title">
          <p className="section-step">Build a sequence from your words</p>
          <h2 id="ritual-start-title">Remembered moments</h2>
          <p className="ritual-workspace__introduction">
            Add moments in the order you remember them, or leave their order
            open. The sequence shows your choices, not a complete or definitive
            account of a family practice.
          </p>
          <p className="ritual-privacy-note">
            Use demonstration text only. When you request a reflection, your
            relevant fragments are sent to the configured AI provider. The
            timeline stays in this browser while the page is open.
          </p>

          {!hasMoments ? (
            <form className="ritual-entry" onSubmit={addFirstMoment}>
              <label htmlFor="ritual-first-fragment">
                What moment comes to mind?
              </label>
              <p>
                A celebration or an everyday routine can begin with one small
                detail. Names, counts, and timing can remain uncertain.
              </p>
              <textarea
                id="ritual-first-fragment"
                name="ritualFirstFragment"
                ref={firstFragmentInput}
                value={firstFragment}
                onChange={(event) => {
                  setFirstFragment(event.target.value)
                  setError('')
                }}
                maxLength={MAX_FRAGMENT_LENGTH}
                placeholder="For example: I remember part of a family practice, but not every detail."
                rows={5}
              />
              <span className="ritual-entry__count">
                {firstFragment.length} of {MAX_FRAGMENT_LENGTH} characters
              </span>
              {error && <p role="alert">{error}</p>}
              <button className="primary-action" type="submit">
                Add the first moment and reflect
              </button>
            </form>
          ) : (
            <div className="ritual-sequence" id="ritual-sequence">
              <section aria-labelledby="ritual-ordered-title">
                <div className="ritual-sequence__section-heading">
                  <div>
                    <h3 id="ritual-ordered-title">
                      Moments you placed in order
                    </h3>
                    <p>
                      Move moments to change their order, or leave a moment open
                      if you cannot place it.
                    </p>
                  </div>
                  {!isRestartConfirming && (
                    <button
                      className="ritual-moment__secondary"
                      type="button"
                      onClick={() => setIsRestartConfirming(true)}
                      disabled={isReflecting || isEvaluating}
                    >
                      Start a different memory
                    </button>
                  )}
                </div>
                {isRestartConfirming && (
                  <div
                    className="ritual-restart-confirmation"
                    aria-labelledby="ritual-restart-title"
                  >
                    <h4 id="ritual-restart-title">
                      Start a different memory?
                    </h4>
                    <p>
                      This clears the current moments and any text in the add
                      moment box.
                    </p>
                    <div className="ritual-moment__actions">
                      <button
                        className="ritual-moment__secondary"
                        type="button"
                        onClick={() => setIsRestartConfirming(false)}
                      >
                        Keep this memory
                      </button>
                      <button
                        className="primary-action"
                        type="button"
                        onClick={restartMemory}
                      >
                        Start a different memory
                      </button>
                    </div>
                  </div>
                )}
                <ol className="ritual-sequence__list">
                  {moments.map((moment, index) => (
                    <li className="ritual-moment" key={moment.id}>
                      <span className="ritual-moment__label">
                        Moment {index + 1}
                      </span>
                      <p>{moment.text}</p>
                      <div className="ritual-moment__actions">
                        <button
                          type="button"
                          className="ritual-moment__secondary"
                          onClick={() => moveMoment(moment.id, -1)}
                          disabled={isEvaluating || index === 0}
                        >
                          Move earlier
                        </button>
                        <button
                          type="button"
                          className="ritual-moment__secondary"
                          onClick={() => moveMoment(moment.id, 1)}
                          disabled={isEvaluating || index === moments.length - 1}
                        >
                          Move later
                        </button>
                        <button
                          type="button"
                          className="ritual-moment__secondary"
                          onClick={() => leaveOrderOpen(moment.id)}
                          disabled={isEvaluating}
                        >
                          Leave order open
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {unplacedMoments.length > 0 && (
                <section
                  className="ritual-sequence__open"
                  aria-labelledby="ritual-open-title"
                >
                  <h3 id="ritual-open-title">Order not remembered</h3>
                  <ul className="ritual-sequence__list">
                    {unplacedMoments.map((moment) => (
                      <li className="ritual-moment" key={moment.id}>
                        <p>{moment.text}</p>
                        <button
                          type="button"
                          className="ritual-moment__secondary"
                          onClick={() => placeMoment(moment.id)}
                          disabled={isEvaluating}
                        >
                          Place at the end of the sequence
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {isReflecting && (
                <p
                  className="ritual-reflection-status"
                  id="ritual-reflection-status"
                  role="status"
                >
                  Generating a provisional reflection from your words...
                </p>
              )}
              {reflectionError && (
                <div className="ritual-reflection-error" id="ritual-reflection-error">
                  <p role="alert">{reflectionError}</p>
                  <button
                    className="ritual-moment__secondary"
                    type="button"
                    onClick={retryReflection}
                    disabled={isReflecting}
                  >
                    Retry reflection
                  </button>
                </div>
              )}
              {aiResponse && (
                <div className="ritual-reflection" id="ritual-ai-response">
                  <AIResponse response={aiResponse} />
                </div>
              )}
              {conversation && !canAnswerFollowUp(conversation) && (
                <p className="ritual-ai-limit">
                  The AI follow-up limit has been reached. New moments can
                  still be added to your timeline, but they will not receive
                  another AI reflection.
                </p>
              )}

              <form
                className="ritual-entry ritual-entry--follow-up"
                id="ritual-follow-up"
                onSubmit={addMoment}
              >
                <label htmlFor="ritual-next-fragment">
                  Add another remembered moment
                </label>
                <p>
                  The AI question is only a prompt. You can add a memory, a
                  correction, or something you do not remember. You choose
                  where the moment belongs.
                </p>
                <textarea
                  id="ritual-next-fragment"
                  name="ritualNextFragment"
                  value={nextFragment}
                  disabled={isReflecting || Boolean(reflectionError) || !aiResponse || isEvaluating}
                  onChange={(event) => {
                    setNextFragment(event.target.value)
                    setError('')
                  }}
                  maxLength={MAX_FRAGMENT_LENGTH}
                  placeholder="Add only what you remember."
                  rows={4}
                />
                <label htmlFor="ritual-moment-placement">
                  Where should it go?
                </label>
                <select
                  id="ritual-moment-placement"
                  value={placement}
                  disabled={isReflecting || Boolean(reflectionError) || !aiResponse || isEvaluating}
                  onChange={(event) => setPlacement(event.target.value)}
                >
                  <option value="before">Before the current sequence</option>
                  <option value="after">After the current sequence</option>
                  <option value="unknown">I do not know its order</option>
                </select>
                <span className="ritual-entry__count">
                  {nextFragment.length} of {MAX_FRAGMENT_LENGTH} characters
                </span>
                {error && <p role="alert">{error}</p>}
                <button
                  className="primary-action"
                  type="submit"
                  disabled={isReflecting || Boolean(reflectionError) || !aiResponse || isEvaluating}
                >
                  Add this moment
                </button>
              </form>

              {!isEvaluating && conversation && aiResponse && (
                <button
                  className="primary-action ritual-sequence__finish"
                  type="button"
                  onClick={handleFinishMemory}
                  disabled={isReflecting}
                >
                  Finish this sequence and review
                </button>
              )}

              {isEvaluating && conversation && (
                <section
                  className="ritual-review"
                  id="ritual-review"
                  aria-labelledby="ritual-review-title"
                >
                  <p className="section-step">Review and save</p>
                  <h3 id="ritual-review-title">Review your remembered sequence</h3>
                  <p>
                    Your chosen order and moments left open are saved as your
                    arrangement. The AI reflection is stored separately and is
                    not a record of the practice itself.
                  </p>
                  <ol className="ritual-sequence__list">
                    {moments.map((moment, index) => (
                      <li className="ritual-moment" key={moment.id}>
                        <span className="ritual-moment__label">Moment {index + 1}</span>
                        <p>{moment.text}</p>
                      </li>
                    ))}
                  </ol>
                  {unplacedMoments.length > 0 && (
                    <section className="ritual-sequence__open">
                      <h4>Order not remembered</h4>
                      <ul className="ritual-sequence__list">
                        {unplacedMoments.map((moment) => (
                          <li className="ritual-moment" key={moment.id}>
                            <p>{moment.text}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <ResponseEvaluation
                    evaluation={evaluation}
                    isSaved={Boolean(savedEntryId)}
                    onChange={handleEvaluationChange}
                    onSave={handleSaveTrace}
                    saveError={saveError}
                    domain="ritual"
                  />
                  <button
                    className="ritual-moment__secondary"
                    type="button"
                    onClick={() => {
                      setIsEvaluating(false)
                      setFocusArea('continue')
                    }}
                    disabled={Boolean(savedEntryId)}
                  >
                    Return to the sequence
                  </button>
                </section>
              )}
            </div>
          )}
        </section>

        <SectionNavigation current="ritual" />
      </main>
    </div>
  )
}

export default RitualPage
