import { useState } from 'react'
import { Link } from 'react-router-dom'
import ArchiveEntry from '../../components/archive/ArchiveEntry/ArchiveEntry.jsx'
import { readArchiveData } from '../../services/archiveStorage.js'

function LivingArchivePage() {
  const [archiveData] = useState(readArchiveData)

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/">Thawing Memory</Link>
      </header>

      <main>
        <section aria-labelledby="archive-title">
          <p>Traces around memory</p>
          <h1 id="archive-title">Living Archive</h1>
          <p>
            This is not an archive of culture itself. It gathers written
            fragments, provisional AI responses, and the corrections that
            return authority to you.
          </p>
        </section>

        {archiveData.hasUnreadableData && (
          <p role="alert">
            Previous prototype data could not be read. Your current archive is
            shown as empty, and you can return to the Kitchen to begin again.
          </p>
        )}

        {archiveData.entries.length === 0 ? (
          <section aria-labelledby="empty-archive-title">
            <h2 id="empty-archive-title">No traces saved yet</h2>
            <p>
              Complete a Kitchen memory and choose how you want to respond to
              the provisional AI reflection.
            </p>
            <Link to="/kitchen">Begin in the Kitchen</Link>
          </section>
        ) : (
          <section aria-labelledby="saved-traces-title">
            <h2 id="saved-traces-title">Your saved traces</h2>
            <p>
              {archiveData.entries.length}{' '}
              {archiveData.entries.length === 1 ? 'trace' : 'traces'} saved on
              this device
            </p>

            <div className="archive-entry-list">
              {archiveData.entries.map((entry) => (
                <ArchiveEntry key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}

        <nav aria-label="Living Archive links">
          <Link to="/kitchen">Return to the Kitchen</Link>
        </nav>
      </main>
    </div>
  )
}

export default LivingArchivePage
