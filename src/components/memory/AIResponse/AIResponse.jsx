function AIResponse({ response }) {
  return (
    <section aria-labelledby="ai-response-title">
      <p role="status">Temporary sample response for interface development</p>
      <h2 id="ai-response-title">AI response</h2>
      <p>
        This content is static. It does not come from a live model or respond
        to the memory you entered.
      </p>

      <section aria-labelledby="ai-reflection-title">
        <h3 id="ai-reflection-title">Provisional AI reflection</h3>
        <p>{response.reflection}</p>
      </section>

      <section aria-labelledby="ai-limitation-title">
        <h3 id="ai-limitation-title">Why this may be incomplete</h3>
        <p>{response.limitation}</p>
      </section>

      <section aria-labelledby="ai-question-title">
        <h3 id="ai-question-title">AI question</h3>
        <p>{response.question}</p>
      </section>

      <p>
        This response may generalise, flatten, or misunderstand your memory.
      </p>
    </section>
  )
}

export default AIResponse
