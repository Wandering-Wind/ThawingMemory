import { useState } from 'react'
import { Link } from 'react-router-dom'
import ritualDecoration from '../../assets/decorations/ritual-page.webp'
import PageHeading from '../../components/layout/PageHeading/PageHeading.jsx'
import SiteHeader from '../../components/layout/SiteHeader/SiteHeader.jsx'

const MAX_FRAGMENT_LENGTH = 2000

function createMoment(text) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
  }
}

function RitualPage() {
  const [moments, setMoments] = useState([])
  const [unplacedMoments, setUnplacedMoments] = useState([])
  const [firstFragment, setFirstFragment] = useState('')
  const [nextFragment, setNextFragment] = useState('')
  const [placement, setPlacement] = useState('after')
  const [error, setError] = useState('')

  function addFirstMoment(event) {
    event.preventDefault()
    const text = firstFragment.trim()

    if (!text) {
      setError('Write a memory fragment before adding it to the timeline.')
      return
    }

    setMoments([createMoment(text)])
    setFirstFragment('')
    setError('')
  }

  function addMoment(event) {
    event.preventDefault()
    const text = nextFragment.trim()

    if (!text) {
      setError('Write a memory fragment before adding it to the timeline.')
      return
    }

    const moment = createMoment(text)

    if (placement === 'before') {
      setMoments((currentMoments) => [moment, ...currentMoments])
    } else if (placement === 'unknown') {
      setUnplacedMoments((currentMoments) => [...currentMoments, moment])
    } else {
      setMoments((currentMoments) => [...currentMoments, moment])
    }

    setNextFragment('')
    setError('')
  }

  function moveMoment(momentId, direction) {
    setMoments((currentMoments) => {
      const currentIndex = currentMoments.findIndex(
        (moment) => moment.id === momentId,
      )
      const nextIndex = currentIndex + direction

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentMoments.length) {
        return currentMoments
      }

      const reorderedMoments = [...currentMoments]
      const movedMoment = reorderedMoments[currentIndex]
      reorderedMoments[currentIndex] = reorderedMoments[nextIndex]
      reorderedMoments[nextIndex] = movedMoment
      return reorderedMoments
    })
  }

  function leaveOrderOpen(momentId) {
    const moment = moments.find((item) => item.id === momentId)

    if (!moment) {
      return
    }

    setMoments((currentMoments) => {
      return currentMoments.filter((item) => item.id !== momentId)
    })

    setUnplacedMoments((currentMoments) => [...currentMoments, moment])
  }

  function placeMoment(momentId) {
    const moment = unplacedMoments.find((item) => item.id === momentId)

    if (!moment) {
      return
    }

    setUnplacedMoments((currentMoments) =>
      currentMoments.filter((item) => item.id !== momentId),
    )
    setMoments((currentMoments) => [...currentMoments, moment])
  }

  const hasMoments = moments.length > 0 || unplacedMoments.length > 0

  return (
    <div className="site-shell">
      <SiteHeader />

      <main className="scene-main">
        <section
          className="scene-hero scene-hero--coming-soon scene-hero--ritual"
          aria-labelledby="ritual-title"
        >
          <img
            className="scene-hero__feature scene-hero__feature--coming-soon"
            src={ritualDecoration}
            alt=""
            aria-hidden="true"
          />
          <div className="scene-hero__content">
            <p>Family memory</p>
            <PageHeading id="ritual-title">A Practice Remembered</PageHeading>
            <p>
              This space is for remembering family rituals and everyday
              routines, not religious rituals or teaching. You might remember
              what snacks accompanied evening tea, or when your family gathered
              flowers for Onam pookallam. Your family account does not need to
              match anyone else&apos;s.
            </p>
          </div>
        </section>

        <section className="ritual-workspace" aria-labelledby="ritual-start-title">
          <p className="section-step">Build a sequence from your words</p>
          <h2 id="ritual-start-title">Remembered moments</h2>
          <p className="ritual-workspace__introduction">
            Add moments in the order you remember them, or leave their order
            open. The sequence shows your choices, not a complete or definitive
            account of a family practice.
          </p>

          {!hasMoments ? (
            <form className="ritual-entry" onSubmit={addFirstMoment}>
              <label htmlFor="ritual-first-fragment">
                What moment comes to mind?
              </label>
              <p>
                A celebration or an everyday routine can begin with one small
                detail. Names, counts, and timing can remain uncertain.
              </p>
              <textarea
                id="ritual-first-fragment"
                name="ritualFirstFragment"
                value={firstFragment}
                onChange={(event) => {
                  setFirstFragment(event.target.value)
                  setError('')
                }}
                maxLength={MAX_FRAGMENT_LENGTH}
                placeholder="For example: I remember part of a family practice, but not every detail."
                rows={5}
              />
              <span className="ritual-entry__count">
                {firstFragment.length} of {MAX_FRAGMENT_LENGTH} characters
              </span>
              {error && <p role="alert">{error}</p>}
              <button className="primary-action" type="submit">
                Add the first moment
              </button>
            </form>
          ) : (
            <div className="ritual-sequence">
              <section aria-labelledby="ritual-ordered-title">
                <h3 id="ritual-ordered-title">Moments you placed in order</h3>
                <p>
                  Move moments to change their order, or leave a moment open if
                  you cannot place it.
                </p>
                <ol className="ritual-sequence__list">
                  {moments.map((moment, index) => (
                    <li className="ritual-moment" key={moment.id}>
                      <span className="ritual-moment__label">
                        Moment {index + 1}
                      </span>
                      <p>{moment.text}</p>
                      <div className="ritual-moment__actions">
                        <button
                          type="button"
                          className="ritual-moment__secondary"
                          onClick={() => moveMoment(moment.id, -1)}
                          disabled={index === 0}
                        >
                          Move earlier
                        </button>
                        <button
                          type="button"
                          className="ritual-moment__secondary"
                          onClick={() => moveMoment(moment.id, 1)}
                          disabled={index === moments.length - 1}
                        >
                          Move later
                        </button>
                        <button
                          type="button"
                          className="ritual-moment__secondary"
                          onClick={() => leaveOrderOpen(moment.id)}
                        >
                          Leave order open
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {unplacedMoments.length > 0 && (
                <section
                  className="ritual-sequence__open"
                  aria-labelledby="ritual-open-title"
                >
                  <h3 id="ritual-open-title">Order not remembered</h3>
                  <ul className="ritual-sequence__list">
                    {unplacedMoments.map((moment) => (
                      <li className="ritual-moment" key={moment.id}>
                        <p>{moment.text}</p>
                        <button
                          type="button"
                          className="ritual-moment__secondary"
                          onClick={() => placeMoment(moment.id)}
                        >
                          Place at the end of the sequence
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <form className="ritual-entry ritual-entry--follow-up" onSubmit={addMoment}>
                <label htmlFor="ritual-next-fragment">
                  Add another remembered moment
                </label>
                <textarea
                  id="ritual-next-fragment"
                  name="ritualNextFragment"
                  value={nextFragment}
                  onChange={(event) => {
                    setNextFragment(event.target.value)
                    setError('')
                  }}
                  maxLength={MAX_FRAGMENT_LENGTH}
                  placeholder="Add only what you remember."
                  rows={4}
                />
                <label htmlFor="ritual-moment-placement">
                  Where should it go?
                </label>
                <select
                  id="ritual-moment-placement"
                  value={placement}
                  onChange={(event) => setPlacement(event.target.value)}
                >
                  <option value="before">Before the current sequence</option>
                  <option value="after">After the current sequence</option>
                  <option value="unknown">I do not know its order</option>
                </select>
                <span className="ritual-entry__count">
                  {nextFragment.length} of {MAX_FRAGMENT_LENGTH} characters
                </span>
                {error && <p role="alert">{error}</p>}
                <button className="primary-action" type="submit">
                  Add this moment
                </button>
              </form>
            </div>
          )}
        </section>

        <nav className="ritual-links" aria-label="Ritual links">
          <Link to="/garden">Visit the Garden</Link>
          <Link to="/archive">View Living Archive</Link>
        </nav>
      </main>
    </div>
  )
}

export default RitualPage
