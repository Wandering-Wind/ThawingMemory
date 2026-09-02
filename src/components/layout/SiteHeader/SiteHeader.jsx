import { Link, NavLink } from 'react-router-dom'
import logo from '../../../assets/decorations/logo.svg'

const navigationItems = [
  { label: 'Kitchen', to: '/kitchen' },
  { label: 'Garden', to: '/garden' },
  { label: 'Ritual', to: '/ritual' },
  { label: 'Living Archive', to: '/archive' },
]

function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-brand" to="/" aria-label="Thawing Memory home">
        <img
          className="site-brand__logo"
          src={logo}
          alt=""
          aria-hidden="true"
        />
        <span className="site-brand__name">Thawing Memory</span>
      </Link>

      <nav className="site-navigation" aria-label="Primary navigation">
        {navigationItems.map((item) => (
          <NavLink
            className="site-navigation__link"
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default SiteHeader
