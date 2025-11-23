import {useState, useEffect } from "react"
import FulLCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import {Grid, Card, CardContent, CardMedia, Typography, TextField, Button} from "@mui/material"
import FullCalendar from "@fullcalendar/react"


function Dashboard(){
    const [weekRecipes, setWeekRecipes] = useState([])
    const [savedRecipes, setSavedRecipes] = useState([])
    const [mealDbRecipes, setMealDbRecipes] = useState([])
    const [searchTerm, setSearchTerm] = useState("")

    //load in weekly calendar

    useEffect(() => {
        fetch("http://localhost:3000/week-recipes", {
            credentials:"include"
        }).then(res => res.json()).then(data => setWeekRecipes(
            data.map(r => ({
                id: r.id, 
                title: r.recipe, 
                date: r.day
            }))
        ))
    }, [])

    //load saved recipes

    useEffect(() => {
        fetch("http://localhost:3000/saved-recipes", {
            credentials:"include"
        }).then(res => res.json()).then(data => setSavedRecipes(data))
    }, [])


    //load MealDB recipes via. search
    useEffect(() => {
        const loadMeals = async() => {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`)
            const data = await res.json()
            setMealDbRecipes(data.meals || [])
        }
        loadMeals()
    }, [searchTerm])

    //add recipe to calendar
    const addToCalendar = async(recipe, day) => {
        await fetch("http://localhost:3000/week-recipes", {
            method: "POST", 
            credentials: "include", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                recipe: recipe.strMeal || recipe.recipe,
                ingredients: JSON.stringify(recipe.ingredients || []),
                day
            })
        })

        const res = await fetch("http://localhost:3000/week-recipes", {
            credentials: "include"
        })

        const data = await res.json()
        setWeekRecipes(
            data.map(r=> ({
                id: r.id,
                title: r.recipe,
                date: r.day
            }))
        )
    }


    //FullCalendar Day Click
    const handleDayeClick = (info) => {
        const day = info.dateStr
        alert("Select a recipe to add for " + day)
        //need to open dialog here?
    }

    return(
        <div style = {{padding: "20px"}}>
            <h1>Your Weekly Meal Plan</h1>

            <FullCalendar plugins={[dayGridPlugin, interactionPlugin]}
            initialView = "dayGridWeek" events = {weekRecipes} dateClick = {handleDateClick} height = "auto"/>

            <br/><br/>

            <TextField label = "Search Recipes" fullWidth value = {searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{marginBottom: 3}}/>
            
            <Typography variant = "h5" sx = {{marginBottom: 2}}>Saved Recipes</Typography>

            <Grid container spacing = {2}>
                {savedRecipes.map((r) => (
                    <Grid item xs = {12} sm = {6} md = {4} key = {r.id}>
                        <Card>
                            <CardContent>
                                <Typography variant = "h6">{r.recipe}</Typography>
                                <Button onClick = {() => addToCalendar(r, prompt("What day? (YYYY-MM-DD)"))}>
                                    Add to Week
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <br/>

            <Typography variant = "h5" sx = {{marginBottom: 2}}>
                Explore Recipes
            </Typography>

            <Grid container spacing = {2}>
                {mealDbRecipes.map((meal) => (
                    <Grid item xs = {12} sm = {6} md = {4} key = {meal.idMeal}>
                        <Card>
                            <CardMedia component = "img" height = "180" image = {meal.strMealThumb}/>
                            <CardContent>
                                <Typography cariant = "h6">{meal.strMeal}</Typography>

                                <Button onClick = {() => addToCalendar(r, prompt("What day? (YYYY-MM-DD)"))}>
                                    Add to Week
                                </Button>                                
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}

export default Dashboard