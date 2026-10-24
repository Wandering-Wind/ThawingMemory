import { Link } from 'react-router-dom'

const sections = [
  { id: 'kitchen', label: 'Visit the Kitchen', to: '/kitchen' },
  { id: 'garden', label: 'Visit the Garden', to: '/garden' },
  { id: 'ritual', label: 'Visit the Ritual space', to: '/ritual' },
  { id: 'archive', label: 'View the Living Archive', to: '/archive' },
]

function SectionNavigation({ current }) {
  return (
    <nav className="section-navigation" aria-label="Explore other spaces">
      <h2>Continue exploring</h2>
      <ul>
        {sections
          .filter((section) => section.id !== current)
          .map((section) => (
            <li key={section.id}>
              <Link to={section.to}>{section.label}</Link>
            </li>
          ))}
      </ul>
    </nav>
  )
}

export default SectionNavigation
