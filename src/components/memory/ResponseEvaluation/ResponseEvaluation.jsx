const decisions = [
  { value: 'kept', label: 'Keep as a prompt' },
  { value: 'edited', label: 'Edit in my words' },
  { value: 'rejected', label: 'This does not fit' },
]

function ResponseEvaluation({ evaluation, onChange, response }) {
  function selectDecision(decision) {
    onChange({
      decision,
      editedReflection: decision === 'edited' ? response.reflection : '',
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
    <section aria-labelledby="evaluation-title">
      <h2 id="evaluation-title">What would you like to do with this?</h2>
      <p>
        Keeping the response does not verify it. Editing or rejecting it keeps
        the original AI response visible for comparison.
      </p>

      <div role="group" aria-label="Evaluate the AI response">
        {decisions.map((decision) => (
          <button
            key={decision.value}
            type="button"
            aria-pressed={evaluation.decision === decision.value}
            onClick={() => selectDecision(decision.value)}
          >
            {decision.label}
          </button>
        ))}
      </div>

      {evaluation.decision === 'kept' && (
        <p role="status">Kept as a prompt, not as a verified account.</p>
      )}

      {evaluation.decision === 'edited' && (
        <section aria-labelledby="edit-response-title">
          <h3 id="edit-response-title">Edit in your words</h3>

          <label htmlFor="edited-reflection">Your version</label>
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
            What is different in your family's version?
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
        <section aria-labelledby="reject-response-title">
          <h3 id="reject-response-title">Rejected by you</h3>
          <p>
            You can leave the response rejected without explaining, or add
            what it missed.
          </p>

          <label htmlFor="reject-correction">
            What is different in your family's version?
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
    </section>
  )
}

export default ResponseEvaluation
