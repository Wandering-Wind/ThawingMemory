import { Link } from 'react-router-dom'
import bananaLeafLeft from '../../assets/decorations/banana-leaf-left-cropped.svg'
import bananaLeafRight from '../../assets/decorations/banana-leaf-right-cropped.svg'
import boatRace from '../../assets/decorations/boat-race.svg'
import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'

function HomePage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main className="scene-main">
        <section className="landing-hero scene-hero scene-hero--home" aria-labelledby="landing-title">
          <img className="scene-hero__leaf scene-hero__leaf--left" src={bananaLeafLeft} alt="" aria-hidden="true" />
          <img className="scene-hero__leaf scene-hero__leaf--right" src={bananaLeafRight} alt="" aria-hidden="true" />
          <img className="scene-hero__feature scene-hero__feature--boat" src={boatRace} alt="" aria-hidden="true" />
          <div className="scene-hero__content">
            <p>A reflective cultural memory prototype</p>
            <PageHeading id="landing-title">Thawing Memory</PageHeading>
            <p>
              Begin with a fragment of family cooking memory. An AI reflection
              will help you notice, question, and describe what remains, while
              you decide what fits and what does not.
            </p>
          </div>
        </section>

        <section className="landing-introduction" aria-labelledby="about-title">
          <h2 id="about-title">Your memory comes first</h2>
          <p>
            Thawing Memory is a proof-of-concept for first-generation
            Malayalis in South Africa who carry cultural knowledge in partial,
            sensory, or family-specific forms. It does not try to recover one
            authentic version of Malayali culture. It creates a space to
            reflect on the traces you already hold.
          </p>
        </section>

        <section className="landing-process" aria-labelledby="process-title">
          <h2 id="process-title">What happens in the Kitchen</h2>
          <ol>
            <li>You describe a remembered sound, smell, texture, or gesture.</li>
            <li>The AI asks up to three focused questions to help you add detail.</li>
            <li>Your fragments are organised into a working family recipe with visible gaps.</li>
            <li>You keep, edit, or reject the reconstruction in favour of your own version.</li>
          </ol>
        </section>

        <section className="landing-notice" aria-labelledby="notice-title">
          <h2 id="notice-title">Before you begin</h2>
          <p>
            The AI may generalise, flatten, or misunderstand what your memory
            means. Its response is a prompt, not a cultural authority or a
            verified account. Your correction remains the final version in
            this experience.
          </p>
          <p>
            Use demonstration memories only. When the live AI is connected,
            submitted text will be sent to Gemini or, when Gemini is
            temporarily unavailable, the configured Groq fallback. Saved traces
            remain in this browser on this device.
          </p>
        </section>

        <section className="landing-entry" aria-label="Enter the prototype">
          <Link
            className="primary-action primary-action--ornate primary-action--inviting"
            to="/kitchen"
          >
            Enter the Kitchen
          </Link>
        </section>
      </main>

      <footer className="site-footer">
        <p>Research proof of concept. No human testing or public data collection.</p>
      </footer>
    </div>
  )
}

export default HomePage
