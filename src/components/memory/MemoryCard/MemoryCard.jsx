function MemoryCard({ card }) {
  return (
    <article className="memory-card">
      <p className="memory-card__status">{card.status}</p>
      <h2>{card.title}</h2>
      <p>{card.introduction}</p>
      <button type="button" disabled>
        Open memory
      </button>
    </article>
  )
}

export default MemoryCard
