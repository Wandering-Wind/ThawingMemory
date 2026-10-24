import { Link } from 'react-router-dom'

function ResponseEvaluation({
  evaluation,
  isSaved,
  onChange,
  onSave,
  saveError,
  workingRecipe,
  domain = 'kitchen',
}) {
  const isGarden = domain === 'garden'
  const isRitual = domain === 'ritual'
  const decisions = [
    {
      value: 'kept',
      label: isRitual
        ? 'Keep the AI response as a prompt'
        : isGarden
          ? 'Keep the AI response as a prompt'
          : workingRecipe
            ? 'Keep as a working reconstruction'
            : 'Keep as a prompt',
    },
    {
      value: 'edited',
      label: isGarden || isRitual ? 'Add my note' : 'Edit in my words',
    },
    {
      value: 'rejected',
      label:
        isGarden || isRitual ? 'Reject this AI response' : 'This does not fit',
    },
  ]
  function selectDecision(decision) {
    onChange({
      decision,
      editedReflection: '',
      correction: '',
    })
  }

  function updateField(field, value) {
    onChange({
      ...evaluation,
      [field]: value,
    })
  }

  return (
    <section
      className="response-evaluation"
      id="response-evaluation"
      aria-labelledby="evaluation-title"
    >
      <h2 id="evaluation-title">
        {isRitual || isGarden
          ? 'How do you want to respond to the AI reflection?'
          : 'What would you like to do with this reconstruction?'}
      </h2>
      <p>
        {isRitual
          ? 'Your sequence remains yours. Keeping the AI response does not verify it or make it an account of the practice. You can add a note or reject it.'
          : isGarden
            ? 'Your memory map remains yours. Keeping the AI response does not verify it. You can add a note or reject the response.'
            : 'Keeping it does not verify it. Editing or rejecting it keeps the provisional reconstruction visible for comparison'}
      </p>
      <p>
        As you reflect, consider: How often did you notice yourself expecting
        the AI model to author missing details, and in doing so, to co-author
        your memories?
      </p>

      <div
        className="response-evaluation__choices"
        role="group"
        aria-label="Evaluate the AI response"
      >
        {decisions.map((decision) => (
          <button
            key={decision.value}
            className="button--gold-edge"
            type="button"
            aria-pressed={evaluation.decision === decision.value}
            onClick={() => selectDecision(decision.value)}
          >
            {decision.label}
          </button>
        ))}
      </div>

      {evaluation.decision === 'kept' && (
        <p role="status">
          {isRitual || isGarden
            ? 'The AI response will be saved separately from your user-authored sequence.'
            : 'Kept as a working reconstruction, not as a verified account'}
        </p>
      )}

      {evaluation.decision === 'edited' && (
        <section
          className="response-evaluation__user-panel"
          aria-labelledby="edit-response-title"
        >
          <h3 id="edit-response-title">
            {isGarden || isRitual
              ? 'Add your note'
              : 'Write your reconstruction'}
          </h3>

          <label htmlFor="edited-reflection">
            {isGarden || isRitual ? 'Your note' : 'Your version'}
          </label>
          <textarea
            id="edited-reflection"
            name="editedReflection"
            rows="6"
            value={evaluation.editedReflection}
            onChange={(event) =>
              updateField('editedReflection', event.target.value)
            }
          />

          <label htmlFor="edit-correction">
            {isRitual
              ? 'What should a reader understand about your sequence or the AI response?'
              : isGarden
              ? 'What should a reader understand about your map or the AI response?'
              : "What is different in your family's version?"}
          </label>
          <textarea
            id="edit-correction"
            name="editCorrection"
            rows="4"
            value={evaluation.correction}
            onChange={(event) => updateField('correction', event.target.value)}
          />
        </section>
      )}

      {evaluation.decision === 'rejected' && (
        <section
          className="response-evaluation__user-panel"
          aria-labelledby="reject-response-title"
        >
          <h3 id="reject-response-title">
            {isGarden || isRitual ? 'AI response rejected by you' : 'Rejected by you'}
          </h3>
          <p>
            You can leave the response rejected without explaining, or add
            what it missed.
          </p>

          <label htmlFor="reject-correction">
            {isGarden || isRitual
              ? 'What did the AI response misunderstand or miss?'
              : "What is different in your family's version?"}
          </label>
          <textarea
            id="reject-correction"
            name="rejectCorrection"
            rows="4"
            value={evaluation.correction}
            onChange={(event) => updateField('correction', event.target.value)}
          />
        </section>
      )}

      {evaluation.decision && (
        <section
          className="response-evaluation__save"
          aria-labelledby="save-trace-title"
        >
          <h3 id="save-trace-title">Save this trace</h3>
          <p>
            This saves the interaction in this browser on this device. It does
            not upload the trace to a public archive
          </p>

          {saveError && <p role="alert">{saveError}</p>}

          <button
            className="button--gold-edge"
            type="button"
            disabled={isSaved}
            onClick={onSave}
          >
            {isSaved ? 'Trace saved' : 'Save trace'}
          </button>

          {isSaved && (
            <div role="status">
              <p>
                Your trace has been added to the Living Archive on this device
              </p>
              <Link to="/archive">View Living Archive</Link>
            </div>
          )}
        </section>
      )}
    </section>
  )
}

export default ResponseEvaluation
