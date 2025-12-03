import React, { useState } from "react"

//This comment it how we will call it in the web page later 
/*
import RecipeSearch from "./components/ExternalRecipeSelection"

const handleRecipeSelection = (selectedRecipes) => {
    console.log("Selected Recipes:", selectedRecipes)
    //Can store here in the db 
}

//in return statment
return(
    <div>
        <h1>Find Recipes</h1>
        <RecipeSearch onSelect={handleRecipeSelection} />
    </div>
)
*/

//Commpontent to use in whatever page we have selecting external recipies from 
//idk if it works yet but I'll test it soon 
export default function RecipeSearch({onSelect, placeholder = "Search for a recipe..."}){
    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSearch = async () => {
        if (!query) return
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
            const data = await response.json()
            setResults(data.meals || [])
        } catch (err) {
            setError("Failed to fetch recipes.")
        } finally{
            setLoading(false)
        }
    }

    const toggleSelect = (meal) => {
        const exists = selected.find((m) => m.idMeal === meal.idMeal)
        let updated

        if(exists){
            updated = selected.filter((m) => m.idMeal !== meal.idMeal)
        } else{
            updated = [...selected, meal]
        }

        setSelected(updated)
        if (onSelect){
            onSelect(updated)
        }
    }

    return (
        <div>
            <div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={handleSearch}>
                    Search
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            <ul>
                {results.map((meal) => (
                    <li key={meal.idMeal} onClick={() => toggleSelect(meal)}>
                        <div>{meal.strMeal}</div>
                        <div>{meal.strArea} • {meal.strCategory}</div>

                    </li>
                ))}
            </ul>
            {selected.length > 0 && (
                <div>
                    <h2>Selected Recipies:</h2>
                    <pre>
                        {JSON.stringify(selected, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )

}