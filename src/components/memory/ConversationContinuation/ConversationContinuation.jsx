import { useState } from 'react'
import {
  canAnswerFollowUp,
  getFollowUpAnswerCount,
} from '../../../utils/conversation.js'

const ANSWER_LIMIT = 2000

function ConversationContinuation({
  conversation,
  error,
  isSubmitting,
  onAnswer,
  onFinish,
  onRetry,
  onSkip,
  pendingTurn,
}) {
  const [isAnswering, setIsAnswering] = useState(false)
  const [answer, setAnswer] = useState('')
  const answerCount = getFollowUpAnswerCount(conversation)
  const canContinue = canAnswerFollowUp(conversation)
  const canSkip = conversation.skippedQuestions.length < 3

  function handleSubmit(event) {
    event.preventDefault()

    if (answer.trim()) {
      onAnswer(answer)
      setIsAnswering(false)
      setAnswer('')
    }
  }

  function handleSkip() {
    setIsAnswering(false)
    setAnswer('')
    onSkip()
  }

  return (
    <section
      className="conversation-continuation"
      id="conversation-continuation"
      aria-labelledby="continue-reflection-title"
    >
      <p className="conversation-continuation__step">
        {answerCount} of 3 follow-up answers added
      </p>
      <h2 id="continue-reflection-title">Continue the reconstruction</h2>
      <p>
        Add what you remember next. Your answer remains separate from the AI's
        wording, and “I do not remember” is a valid response.
      </p>
      <p className="conversation-continuation__next">
        Choose one next step.
      </p>

      {error && <p role="alert">{error}</p>}

      {pendingTurn ? (
        <button
          className="button--gold-edge"
          type="button"
          disabled={isSubmitting}
          onClick={onRetry}
        >
          {isSubmitting ? 'Retrying...' : 'Retry continued reflection'}
        </button>
      ) : canContinue ? (
        <>
          <div className="conversation-continuation__actions">
            <button
              className="button--gold-edge"
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsAnswering(true)}
            >
              Answer this question
            </button>
            {canSkip && (
              <button
                className="button--gold-edge"
                type="button"
                disabled={isSubmitting}
                onClick={handleSkip}
              >
                Skip this question
              </button>
            )}
            <button
              className="button--gold-edge"
              type="button"
              disabled={isSubmitting}
              onClick={onFinish}
            >
              Finish and evaluate
            </button>
          </div>

          {isAnswering && (
            <form
              className="conversation-continuation__form"
              onSubmit={handleSubmit}
            >
              <label htmlFor="follow-up-memory">
                Add another memory fragment
              </label>
              <textarea
                id="follow-up-memory"
                name="followUpMemory"
                maxLength={ANSWER_LIMIT}
                rows="5"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
              />
              <p>
                {answer.length} of {ANSWER_LIMIT} characters
              </p>
              <button
                className={`primary-action--ornate${isSubmitting ? ' primary-action--reflecting' : ''}`}
                type="submit"
                disabled={isSubmitting || !answer.trim()}
              >
                {isSubmitting ? (
                  <>
                    Reflecting
                    <span className="thinking-dots" aria-hidden="true">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </>
                ) : (
                  'Add this fragment'
                )}
              </button>
            </form>
          )}
        </>
      ) : (
        <div>
          <p role="status">
            You have reached the three-answer limit for this reconstruction.
          </p>
          <button
            className="primary-action--ornate primary-action--inviting"
            type="button"
            onClick={onFinish}
          >
            Finish and evaluate
          </button>
        </div>
      )}
    </section>
  )
}

export default ConversationContinuation
