import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ritualDecoration from '../../assets/decorations/ritual-page.webp'
import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'
import AIResponse from '../../components/memory/AIResponse/AIResponse.jsx'
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

const MAX_FRAGMENT_LENGTH = 2000
const RITUAL_CARD_ID = 'ritual-family-memory'

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
    } catch (requestError) {
      setReflectionError(requestError.message)
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
    } catch (requestError) {
      setConversation(nextConversation)
      setReflectionError(requestError.message)
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
    requestAnimationFrame(() => firstFragmentInput.current?.focus())
  }

  const hasMoments = moments.length > 0 || unplacedMoments.length > 0

  return (
    <div className="site-shell">
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
            <div className="ritual-sequence">
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
                      disabled={isReflecting}
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
                          disabled={index === 0}
                        >
                          Move earlier
                        </button>
                        <button
                          type="button"
                          className="ritual-moment__secondary"
                          onClick={() => moveMoment(moment.id, 1)}
                          disabled={index === moments.length - 1}
                        >
                          Move later
                        </button>
                        <button
                          type="button"
                          className="ritual-moment__secondary"
                          onClick={() => leaveOrderOpen(moment.id)}
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
                        >
                          Place at the end of the sequence
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {isReflecting && (
                <p className="ritual-reflection-status" role="status">
                  Generating a provisional reflection from your words...
                </p>
              )}
              {reflectionError && (
                <div className="ritual-reflection-error">
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
                <div className="ritual-reflection">
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

              <form className="ritual-entry ritual-entry--follow-up" onSubmit={addMoment}>
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
                  disabled={isReflecting || Boolean(reflectionError) || !aiResponse}
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
                  disabled={isReflecting || Boolean(reflectionError) || !aiResponse}
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
                  disabled={isReflecting || Boolean(reflectionError) || !aiResponse}
                >
                  Add this moment
                </button>
              </form>
            </div>
          )}
        </section>

        <nav className="ritual-links" aria-label="Ritual links">
          <Link to="/garden">Visit the Garden</Link>
          <Link to="/archive">View Living Archive</Link>
        </nav>
      </main>
    </div>
  )
}

export default RitualPage
