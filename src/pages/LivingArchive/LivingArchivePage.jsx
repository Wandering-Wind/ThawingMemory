import { useState } from 'react'
import { Link } from 'react-router-dom'
import archiveDecoration from '../../assets/decorations/archive-page.svg'
import bananaLeafLeft from '../../assets/decorations/banana-leaf-left-cropped.svg'
import ArchiveEntry from '../../components/archive/ArchiveEntry/ArchiveEntry.jsx'
import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'
import archiveExamples from '../../data/archiveExamples.js'
import { readArchiveData } from '../../services/archiveStorage.js'

function LivingArchivePage() {
  const [archiveData] = useState(readArchiveData)

  return (
    <div className="site-shell">
      <SiteHeader />

      <main className="scene-main">
        <section
          className="scene-hero scene-hero--archive"
          aria-labelledby="archive-title"
        >
          <img
            className="scene-hero__leaf scene-hero__leaf--left"
            src={bananaLeafLeft}
            alt=""
            aria-hidden="true"
          />
          <img
            className="scene-hero__feature scene-hero__feature--archive"
            src={archiveDecoration}
            alt=""
            aria-hidden="true"
          />
          <div className="scene-hero__content">
            <p>Traces around memory</p>
            <PageHeading id="archive-title">Living Archive</PageHeading>
            <p>
              This is not an archive of culture itself. It gathers written
              fragments, provisional AI responses, and the corrections that
              return authority to you.
            </p>
          </div>
        </section>

        {archiveData.hasUnreadableData && (
          <p role="alert">
            Previous prototype data could not be read. Your current archive is
            shown as empty, and you can return to the Kitchen to begin again.
          </p>
        )}

        <section aria-labelledby="example-conversations-title">
          <h2 id="example-conversations-title">Example conversations</h2>
          <p>
            These demonstration traces show how keeping, editing, and
            rejecting can work. They are examples, not memories saved by you.
          </p>
          <div className="archive-entry-list">
            {archiveExamples.map((entry) => (
              <ArchiveEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </section>

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
