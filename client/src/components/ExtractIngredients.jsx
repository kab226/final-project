//function used to extract ingredients and measurements from mealdb recipes
export function extractIngredients(meal) {
  const ingredients = []

  //themealdb stores ingredients and measurements in two different strings and at most has 20 ingredients
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]

    if (ingredient && ingredient.trim() !== "") {
      ingredients.push({
        ingredient: ingredient.trim(),
        measurement: measure ? measure.trim() : ""
      })
    }
  }

  return ingredients
}
