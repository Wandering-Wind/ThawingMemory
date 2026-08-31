import { useState } from 'react'
import { Link } from 'react-router-dom'
import AIResponse from '../../components/memory/AIResponse/AIResponse.jsx'
import MemoryCard from '../../components/memory/MemoryCard/MemoryCard.jsx'
import ResponseEvaluation from '../../components/memory/ResponseEvaluation/ResponseEvaluation.jsx'
import developingAIResponse from '../../data/developingAIResponse.js'
import kitchenCards from '../../data/kitchenCards.js'

const emptyEvaluation = {
  decision: '',
  editedReflection: '',
  correction: '',
}

function KitchenPage() {
  const [activeCardId, setActiveCardId] = useState(null)
  const [submittedMemory, setSubmittedMemory] = useState('')
  const [evaluation, setEvaluation] = useState(emptyEvaluation)

  function handleOpenMemory(cardId) {
    setActiveCardId(cardId)
    setSubmittedMemory('')
    setEvaluation(emptyEvaluation)
  }

  function handleMemoryChange() {
    setSubmittedMemory('')
    setEvaluation(emptyEvaluation)
  }

  function handleMemorySubmit(memory) {
    setSubmittedMemory(memory)
    setEvaluation(emptyEvaluation)
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/">Thawing Memory</Link>
      </header>

      <main>
        <section aria-labelledby="kitchen-title">
          <p>Kitchen Memory Reconstruction</p>
          <h1 id="kitchen-title">The Kitchen</h1>
          <p>
            Begin with a fragment of cooking knowledge remembered through
            observation, repetition, or the senses.
          </p>
        </section>

        <section aria-labelledby="memory-cards-title">
          <h2 id="memory-cards-title">Choose a memory</h2>
          <div className="memory-card-list">
            {kitchenCards.map((card) => (
              <MemoryCard
                key={card.id}
                card={card}
                isOpen={activeCardId === card.id}
                onMemoryChange={handleMemoryChange}
                onOpen={handleOpenMemory}
                onSubmit={handleMemorySubmit}
              />
            ))}
          </div>

          {submittedMemory && (
            <>
              <AIResponse response={developingAIResponse} />
              <ResponseEvaluation
                evaluation={evaluation}
                onChange={setEvaluation}
                response={developingAIResponse}
              />
            </>
          )}
        </section>

        <nav aria-label="Kitchen links">
          <Link to="/archive">View Living Archive</Link>
        </nav>
      </main>
    </div>
  )
}

export default KitchenPage
