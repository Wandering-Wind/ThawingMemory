import aiResponseDecoration from '../../../assets/decorations/AIResponse.svg'

function AIResponse({ response }) {
  return (
    <section className="ai-response" aria-labelledby="ai-response-title">
      <img
        className="ai-response__decoration"
        src={aiResponseDecoration}
        alt=""
        aria-hidden="true"
      />
      <p className="ai-response__status" role="status">
        Live AI response generated from your memory
      </p>
      <h2 id="ai-response-title">AI response</h2>
      <p>
        This is a provisional reflection, not a verification or cultural
        authority.
      </p>

      <section
        className="ai-response__section ai-response__section--reflection"
        aria-labelledby="ai-reflection-title"
      >
        <h3 id="ai-reflection-title">Provisional AI reflection</h3>
        <p>{response.reflection}</p>
      </section>

      <section
        className="ai-response__section ai-response__section--limitation"
        aria-labelledby="ai-limitation-title"
      >
        <h3 id="ai-limitation-title">Why this may be incomplete</h3>
        <p>{response.limitation}</p>
      </section>

      <section
        className="ai-response__section ai-response__section--question"
        aria-labelledby="ai-question-title"
      >
        <h3 id="ai-question-title">AI question</h3>
        <p>{response.question}</p>
      </section>

      <p className="ai-response__reminder">
        This response may generalise, flatten, or misunderstand your memory.
      </p>
    </section>
  )
}

export default AIResponse
