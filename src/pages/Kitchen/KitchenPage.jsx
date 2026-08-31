import { Link } from 'react-router-dom'
import MemoryCard from '../../components/memory/MemoryCard/MemoryCard.jsx'
import kitchenCards from '../../data/kitchenCards.js'

function KitchenPage() {
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
              <MemoryCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <nav aria-label="Kitchen links">
          <Link to="/archive">View Living Archive</Link>
        </nav>
      </main>
    </div>
  )
}

export default KitchenPage
