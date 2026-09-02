import buttonDecoration from '../../../assets/decorations/button-cropped.svg'

function PageHeading({ children, id }) {
  return (
    <div className="page-heading">
      <img
        className="page-heading__decoration"
        src={buttonDecoration}
        alt=""
        aria-hidden="true"
      />
      <h1 id={id}>{children}</h1>
    </div>
  )
}

export default PageHeading
