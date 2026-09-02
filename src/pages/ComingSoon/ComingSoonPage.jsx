import gardenDecoration from '../../assets/decorations/garden-page.svg'
import ritualDecoration from '../../assets/decorations/ritual-page.svg'
import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'

function ComingSoonPage({ sectionName }) {
  const titleId = `${sectionName.toLowerCase()}-coming-soon-title`
  const pageDecoration = sectionName === 'Garden' ? gardenDecoration : ritualDecoration

  return (
    <div className="site-shell">
      <SiteHeader />

      <main className="scene-main">
        <section className={`scene-hero scene-hero--coming-soon scene-hero--${sectionName.toLowerCase()}`} aria-labelledby={titleId}>
          <img className="scene-hero__feature scene-hero__feature--coming-soon" src={pageDecoration} alt="" aria-hidden="true" />
          <div className="scene-hero__content">
            <p>{sectionName}</p>
            <PageHeading id={titleId}>Coming Soon</PageHeading>
            <p>
              This part of the memory landscape is planned for the next project
              iteration. This current prototype focuses on the Kitchen
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ComingSoonPage
