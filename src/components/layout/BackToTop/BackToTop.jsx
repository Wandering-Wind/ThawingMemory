import { useEffect, useState } from 'react'

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    function updateVisibility() {
      setIsVisible(window.scrollY > 400)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })

    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  function handleClick() {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <button
      className="back-to-top button--gold-edge"
      type="button"
      hidden={!isVisible}
      onClick={handleClick}
      aria-label="Back to top"
    >
      <span aria-hidden="true">↑</span>
      <span>Back to top</span>
    </button>
  )
}

export default BackToTop
