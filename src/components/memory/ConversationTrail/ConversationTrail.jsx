function ConversationTrail({ conversation }) {
  const earlierResponses = conversation.aiResponses.slice(0, -1)

  if (conversation.memoryFragments.length < 2) {
    return null
  }

  return (
    <section className="conversation-trail" aria-labelledby="trail-title">
      <h2 id="trail-title">Your reconstruction so far</h2>

      <div className="conversation-trail__fragments">
        {conversation.memoryFragments.map((fragment, index) => (
          <article className="conversation-trail__fragment" key={`${index}-${fragment.text}`}>
            <p className="conversation-trail__source">
              Your memory fragment {index + 1}
            </p>
            <p>{fragment.text}</p>
            {fragment.questionAnswered && (
              <p className="conversation-trail__context">
                In response to the AI question: {fragment.questionAnswered}
              </p>
            )}
          </article>
        ))}
      </div>

      {earlierResponses.length > 0 && (
        <details>
          <summary>Review earlier provisional AI responses</summary>
          {earlierResponses.map((response, index) => (
            <article className="conversation-trail__ai-turn" key={`${index}-${response.question}`}>
              <h3>AI response {index + 1}</h3>
              <p>{response.reflection}</p>
              <p>
                <strong>Question:</strong> {response.question}
              </p>
            </article>
          ))}
        </details>
      )}
    </section>
  )
}

export default ConversationTrail
