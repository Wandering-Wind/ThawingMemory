const sections = [
  ['rememberedIngredients', 'Remembered ingredients'],
  ['rememberedMethod', 'Remembered method'],
  ['sensoryCues', 'Sensory and readiness cues'],
  ['familyNotes', 'Family notes'],
  ['stillUnknown', 'Still unknown'],
]

function WorkingRecipe({ id = 'working-recipe', recipe }) {
  const titleId = `${id}-title`

  return (
    <section
      className="working-recipe"
      id={id}
      aria-labelledby={titleId}
    >
      <p className="working-recipe__eyebrow">Built from your fragments</p>
      <h2 id={titleId}>Working Family Recipe</h2>
      <p className="working-recipe__notice">
        This organises what you supplied. It is not a complete, verified, or
        culturally authoritative recipe.
      </p>
      <h3>{recipe.dishName}</h3>

      <div className="working-recipe__grid">
        {sections.map(([field, label]) => (
          <section key={field} className={`working-recipe__section working-recipe__section--${field}`}>
            <h3>{label}</h3>
            {recipe[field].length > 0 ? (
              <ul>
                {recipe[field].map((item, index) => (
                  <li key={`${field}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Nothing remembered for this section yet.</p>
            )}
          </section>
        ))}
      </div>
    </section>
  )
}

export default WorkingRecipe
