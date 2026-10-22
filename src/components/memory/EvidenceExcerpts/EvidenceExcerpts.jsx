function EvidenceExcerpts({ items = [] }) {
  if (!items.length) {
    return null
  }

  return (
    <section className="evidence-excerpts" aria-label="AI-selected evidence">
      <h4>Evidence selected by AI</h4>
      <p>
        These exact excerpts were checked against your memory fragments. Check
        whether they support the AI observation.
      </p>
      <ol>
        {items.map((item, index) => (
          <li key={`${item.fragmentNumber}-${index}-${item.quote}`}>
            <p className="evidence-excerpts__source">
              Your memory fragment {item.fragmentNumber}
            </p>
            <blockquote>{item.quote}</blockquote>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default EvidenceExcerpts
