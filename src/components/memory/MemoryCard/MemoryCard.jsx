import MemoryEntryForm from '../MemoryEntryForm/MemoryEntryForm.jsx'

function MemoryCard({
  card,
  isOpen,
  isSubmitting,
  onMemoryChange,
  onOpen,
  onSubmit,
}) {
  return (
    <article className="memory-card">
      <p className="memory-card__status">{card.status}</p>
      <h2>{card.title}</h2>
      <p>{card.introduction}</p>

      {isOpen ? (
        <MemoryEntryForm
          card={card}
          isSubmitting={isSubmitting}
          onMemoryChange={onMemoryChange}
          onSubmit={onSubmit}
        />
      ) : (
        <button
          className="primary-action--ornate primary-action--inviting"
          type="button"
          onClick={() => onOpen(card.id)}
        >
          Open memory
        </button>
      )}
    </article>
  )
}

export default MemoryCard
