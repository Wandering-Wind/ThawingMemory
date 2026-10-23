function buildTree(fragments) {
  const nodes = fragments.map((fragment, index) => ({
    fragment,
    number: index + 1,
    children: [],
  }))

  for (const node of nodes.slice(1)) {
    const parentNumber = node.fragment.branchFromFragment
    const parent = Number.isInteger(parentNumber) && parentNumber < node.number
      ? nodes[parentNumber - 1]
      : nodes[0]

    const parentNode = parent || nodes[0]
    parentNode.children.push(node)
  }

  return nodes[0] ? [nodes[0]] : []
}

function MemoryBranch({
  node,
  onSelectParent,
  selectedParentNumber,
}) {
  const isStartingMemory = node.number === 1
  const isSelected = selectedParentNumber === node.number

  return (
    <li className="garden-memory-map__branch">
      <article
        className={`garden-memory-map__node${isSelected ? ' is-selected' : ''}`}
      >
        <p className="garden-memory-map__label">
          {isStartingMemory ? 'Starting memory' : `Your branch ${node.number - 1}`}
        </p>
        <p>{node.fragment.text}</p>
        {node.fragment.questionAnswered && (
          <p className="garden-memory-map__context">
            Added after this AI question: {node.fragment.questionAnswered}
          </p>
        )}
        {onSelectParent && (
          <button
            className="garden-memory-map__select"
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectParent(node.number)}
          >
            {isSelected ? 'Selected as branch point' : 'Branch from this detail'}
          </button>
        )}
      </article>
      {node.children.length > 0 && (
        <ol className="garden-memory-map__branches">
          {node.children.map((child) => (
            <MemoryBranch
              key={child.number}
              node={child}
              onSelectParent={onSelectParent}
              selectedParentNumber={selectedParentNumber}
            />
          ))}
        </ol>
      )}
    </li>
  )
}

function GardenMemoryMap({
  fragments,
  id = 'garden-memory-map',
  onSelectParent,
  selectedParentNumber,
  title = 'Your Garden memory map',
}) {
  const tree = buildTree(fragments)

  if (tree.length === 0) {
    return null
  }

  return (
    <section
      className="garden-memory-map"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="garden-memory-map__heading">
        <p className="section-step">Built from your words</p>
        <h2 id={`${id}-title`}>{title}</h2>
        <p>
          {onSelectParent
            ? 'Each branch is a fragment you added. Select a detail to decide where your next memory connects.'
            : 'Each branch is a fragment you added and connected to an earlier detail.'}
        </p>
      </div>
      <ol className="garden-memory-map__branches garden-memory-map__branches--root">
        {tree.map((node) => (
          <MemoryBranch
            key={node.number}
            node={node}
            onSelectParent={onSelectParent}
            selectedParentNumber={selectedParentNumber}
          />
        ))}
      </ol>
    </section>
  )
}

export default GardenMemoryMap
