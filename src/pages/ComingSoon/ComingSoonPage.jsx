import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'

function ComingSoonPage({ sectionName }) {
  const titleId = `${sectionName.toLowerCase()}-coming-soon-title`

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section aria-labelledby={titleId}>
          <p>{sectionName}</p>
          <PageHeading id={titleId}>Coming Soon</PageHeading>
          <p>
            This part of the memory landscape is planned for a later project
            iteration. The current prototype focuses on the Kitchen.
          </p>
        </section>
      </main>
    </div>
  )
}

export default ComingSoonPage
