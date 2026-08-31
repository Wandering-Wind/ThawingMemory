const decisionLabels = {
  kept: 'Kept as a prompt',
  edited: 'Edited by user',
  rejected: 'Rejected by user',
}

function formatCreatedAt(createdAt) {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function ArchiveEntry({ entry }) {
  const titleId = `archive-entry-${entry.id}`

  return (
    <article aria-labelledby={titleId}>
      <header>
        <p>{decisionLabels[entry.decision] || 'Decision unavailable'}</p>
        <h2 id={titleId}>{entry.cardTitle || 'Kitchen memory trace'}</h2>
        <p>
          <time dateTime={entry.createdAt}>
            {formatCreatedAt(entry.createdAt)}
          </time>
        </p>
      </header>

      <section aria-labelledby={`${titleId}-memory`}>
        <h3 id={`${titleId}-memory`}>Your memory</h3>
        <p>{entry.userMemory}</p>
      </section>

      {entry.userRevision && (
        <section aria-labelledby={`${titleId}-revision`}>
          <h3 id={`${titleId}-revision`}>Your version</h3>
          <p>{entry.userRevision}</p>
        </section>
      )}

      {entry.userCorrection && (
        <section aria-labelledby={`${titleId}-correction`}>
          <h3 id={`${titleId}-correction`}>Your family correction</h3>
          <p>{entry.userCorrection}</p>
        </section>
      )}

      <details>
        <summary>View provisional AI response</summary>

        <section aria-labelledby={`${titleId}-ai-reflection`}>
          <h3 id={`${titleId}-ai-reflection`}>Provisional AI reflection</h3>
          <p>{entry.aiReflection}</p>
        </section>

        <section aria-labelledby={`${titleId}-ai-limitation`}>
          <h3 id={`${titleId}-ai-limitation`}>Why this may be incomplete</h3>
          <p>{entry.aiLimitation}</p>
        </section>

        <section aria-labelledby={`${titleId}-ai-question`}>
          <h3 id={`${titleId}-ai-question`}>AI question</h3>
          <p>{entry.aiQuestion}</p>
        </section>
      </details>
    </article>
  )
}

export default ArchiveEntry
