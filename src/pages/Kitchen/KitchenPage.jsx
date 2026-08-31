import { Link } from 'react-router-dom'

function KitchenPage() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/">Thawing Memory</Link>
      </header>

      <main>
        <h1>Kitchen</h1>
        <p>The Kitchen interaction will be added in a later step.</p>
        <Link to="/archive">View Living Archive</Link>
      </main>
    </div>
  )
}

export default KitchenPage
