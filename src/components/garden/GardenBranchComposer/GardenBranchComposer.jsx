import { useState } from 'react'
import {
  canAnswerFollowUp,
  getFollowUpTurnCount,
} from '../../../utils/conversation.js'

const ANSWER_LIMIT = 2000

function GardenBranchComposer({
  conversation,
  error,
  isSubmitting,
  onAnswer,
  onFinish,
  onRetry,
  onSkip,
  pendingTurn,
  selectedParentNumber,
}) {
  const [answer, setAnswer] = useState('')
  const followUpTurnCount = getFollowUpTurnCount(conversation)
  const canContinue = canAnswerFollowUp(conversation)
  const selectedParent = Number.isInteger(selectedParentNumber)
    ? conversation.memoryFragments[selectedParentNumber - 1]
    : null
  const latestQuestion = conversation.aiResponses.at(-1)?.question

  function handleSubmit(event) {
    event.preventDefault()

    if (answer.trim()) {
      onAnswer(answer, selectedParentNumber)
      setAnswer('')
    }
  }

  return (
    <section
      className="garden-branch-composer"
      id="garden-branch-composer"
      aria-labelledby="garden-branch-title"
    >
      <p className="conversation-continuation__step">
        {followUpTurnCount} of 3 follow-up turns used
      </p>
      <h2 id="garden-branch-title">Add a memory branch</h2>
      <p>
        The AI question is only a prompt. Add your own detail, a correction, or
        what you do not remember. Select a branch point in your map first. The
        AI does not write branches for you.
      </p>
      {latestQuestion && (
        <section
          className="garden-branch-composer__question"
          aria-labelledby="garden-branch-question-title"
        >
          <h3 id="garden-branch-question-title">Question for this map</h3>
          <p>{latestQuestion}</p>
          <p>
            This question was generated from the conversation so far. It does
            not change when you select a branch point.
          </p>
        </section>
      )}
      <section
        className="garden-branch-composer__parent"
        aria-live="polite"
        aria-atomic="true"
      >
        <h3>Selected branch point</h3>
        {selectedParent ? (
          <>
            <p>
              <strong>
                {selectedParentNumber === 1
                  ? 'Starting memory'
                  : `Your branch ${selectedParentNumber - 1}`}
              </strong>
            </p>
            <p>{selectedParent.text}</p>
          </>
        ) : (
          <p>Select a detail in your map before adding a branch.</p>
        )}
      </section>
      {error && <p role="alert">{error}</p>}

      {pendingTurn && canContinue && (
        <button
          className="button--gold-edge"
          type="button"
          disabled={isSubmitting}
          onClick={onRetry}
        >
          {isSubmitting ? 'Retrying...' : 'Retry continued reflection'}
        </button>
      )}

      {canContinue && !pendingTurn && (
        <form className="garden-branch-composer__form" onSubmit={handleSubmit}>
          <label htmlFor="garden-branch-memory">
            What do you remember at this point in the map?
          </label>
          <textarea
            id="garden-branch-memory"
            name="gardenBranchMemory"
            maxLength={ANSWER_LIMIT}
            rows="5"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Add your own words, or say that you do not remember"
          />
          <p>{answer.length} of {ANSWER_LIMIT} characters</p>
          <button
            className="primary-action--ornate"
            type="submit"
            disabled={
              isSubmitting ||
              !answer.trim() ||
              !Number.isInteger(selectedParentNumber)
            }
          >
            {isSubmitting ? 'Adding your branch...' : 'Add this branch'}
          </button>
          <p>
            Skipping records that you passed on the question. It does not add
            a memory fragment or a branch
          </p>
          <button
            className="button--gold-edge"
            type="button"
            disabled={isSubmitting}
            onClick={onSkip}
          >
            Skip this AI question
          </button>
        </form>
      )}

      {!canContinue && (
        <p role="status">
          You have reached the three-turn limit. Your map is made from your
          fragments and is ready for review
        </p>
      )}

      <button
        className="button--gold-edge garden-branch-composer__finish"
        type="button"
        disabled={isSubmitting}
        onClick={onFinish}
      >
        Finish this map and review
      </button>
    </section>
  )
}

export default GardenBranchComposer
