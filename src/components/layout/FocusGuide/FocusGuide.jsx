import { useEffect, useState } from 'react'
import logo from '../../../assets/decorations/logo.svg'

function FocusGuide({ targetId }) {
  const [targetBounds, setTargetBounds] = useState(null)

  useEffect(() => {
    let animationFrame
    const target = document.getElementById(targetId)

    if (!target) {
      return undefined
    }

    function updateBounds() {
      const bounds = target.getBoundingClientRect()

      setTargetBounds({
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      })
    }

    function scheduleUpdate() {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(updateBounds)
    }

    const observer = new ResizeObserver(scheduleUpdate)
    observer.observe(target)
    observer.observe(document.body)
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    scheduleUpdate()

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate)
    }
  }, [targetId])

  if (!targetBounds) {
    return null
  }

  return (
    <div
      className="focus-guide"
      style={{
        top: targetBounds.top,
        left: targetBounds.left,
        width: targetBounds.width,
        height: targetBounds.height,
      }}
      aria-hidden="true"
    >
      <img className="focus-guide__flower focus-guide__flower--start" src={logo} alt="" />
      <img className="focus-guide__flower focus-guide__flower--end" src={logo} alt="" />
    </div>
  )
}

export default FocusGuide
