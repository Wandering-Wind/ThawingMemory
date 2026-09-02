import aiResponseDecoration from '../../../assets/decorations/AIResponse.svg'
import yourMemoryDecoration from '../../../assets/decorations/YourMemory.svg'

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
  const hasConversation = Array.isArray(entry.memoryFragments)

  return (
    <article className="archive-entry" aria-labelledby={titleId}>
      <header>
        <p>{decisionLabels[entry.decision] || 'Decision unavailable'}</p>
        <h2 id={titleId}>{entry.cardTitle || 'Kitchen memory trace'}</h2>
        {entry.isExample ? (
          <p>Demonstration conversation</p>
        ) : (
          <p>
            <time dateTime={entry.createdAt}>
              {formatCreatedAt(entry.createdAt)}
            </time>
          </p>
        )}
      </header>

      {hasConversation ? (
        <div className="archive-conversation">
          {entry.memoryFragments.map((fragment, index) => {
            const response = entry.aiResponses?.[index]
            const fragmentId = `${titleId}-fragment-${index + 1}`

            return (
              <div className="archive-conversation__turn" key={fragmentId}>
                <section
                  className="archive-entry__user-content"
                  aria-labelledby={fragmentId}
                >
                  <img
                    className="archive-entry__decoration"
                    src={yourMemoryDecoration}
                    alt=""
                    aria-hidden="true"
                  />
                  <h3 id={fragmentId}>User memory fragment {index + 1}</h3>
                  <p>{fragment.text}</p>
                  {fragment.questionAnswered && (
                    <p className="archive-conversation__context">
                      Answered AI question: {fragment.questionAnswered}
                    </p>
                  )}
                </section>

                {response && (
                  <details className="archive-conversation__ai-response">
                    <summary>
                      <img
                        className="archive-entry__ai-decoration"
                        src={aiResponseDecoration}
                        alt=""
                        aria-hidden="true"
                      />
                      <span>View provisional AI response {index + 1}</span>
                    </summary>
                    <section>
                      <h3>Provisional AI reflection</h3>
                      <p>{response.reflection}</p>
                    </section>
                    <section>
                      <h3>Why this may be incomplete</h3>
                      <p>{response.limitation}</p>
                    </section>
                    <section>
                      <h3>AI question</h3>
                      <p>{response.question}</p>
                    </section>
                  </details>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <section
          className="archive-entry__user-content"
          aria-labelledby={`${titleId}-memory`}
        >
          <img
            className="archive-entry__decoration"
            src={yourMemoryDecoration}
            alt=""
            aria-hidden="true"
          />
          <h3 id={`${titleId}-memory`}>Your memory</h3>
          <p>{entry.userMemory}</p>
        </section>
      )}

      {entry.userRevision && (
        <section
          className="archive-entry__user-content"
          aria-labelledby={`${titleId}-revision`}
        >
          <img
            className="archive-entry__decoration"
            src={yourMemoryDecoration}
            alt=""
            aria-hidden="true"
          />
          <h3 id={`${titleId}-revision`}>Your version</h3>
          <p>{entry.userRevision}</p>
        </section>
      )}

      {entry.userCorrection && (
        <section
          className="archive-entry__user-content"
          aria-labelledby={`${titleId}-correction`}
        >
          <img
            className="archive-entry__decoration"
            src={yourMemoryDecoration}
            alt=""
            aria-hidden="true"
          />
          <h3 id={`${titleId}-correction`}>Your family correction</h3>
          <p>{entry.userCorrection}</p>
        </section>
      )}

      {!hasConversation && <details>
        <summary>
          <img
            className="archive-entry__ai-decoration"
            src={aiResponseDecoration}
            alt=""
            aria-hidden="true"
          />
          <span>View provisional AI response</span>
        </summary>

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
      </details>}
    </article>
  )
}

export default ArchiveEntry
