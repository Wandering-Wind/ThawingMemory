import { Link } from 'react-router-dom'
import logo from '../../../assets/decorations/logo.svg'

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
    </header>
  )
}

export default SiteHeader
