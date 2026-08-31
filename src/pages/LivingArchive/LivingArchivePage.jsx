import { Link } from 'react-router-dom'

function LivingArchivePage() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/">Thawing Memory</Link>
      </header>

      <main>
        <h1>Living Archive</h1>
        <p>Saved memory traces will appear here in a later step.</p>
        <Link to="/kitchen">Return to the Kitchen</Link>
      </main>
    </div>
  )
}

export default LivingArchivePage
