import loadingDecoration from '../../../assets/decorations/loading-svg.svg'

function ReflectionGuide() {
  return (
    <div className="reflection-guide" role="status">
      <span className="reflection-guide__path" aria-hidden="true">
        <img src={loadingDecoration} alt="" />
      </span>
      <span className="visually-hidden">
        Your fragment is moving to the AI response. A new question is being
        prepared.
      </span>
    </div>
  )
}

export default ReflectionGuide
