import {useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import {Grid, Card, CardContent, CardMedia, Typography, TextField, Button, Modal, Snackbar, Alert} from "@mui/material"


function Dashboard(){
    const [weekRecipes, setWeekRecipes] = useState([])
    const [savedRecipes, setSavedRecipes] = useState([])
    const [mealDbRecipes, setMealDbRecipes] = useState([])
    const [searchTerm, setSearchTerm] = useState("")

    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success"})

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState(null)
    const [selectedDate, setSelectedDate] = useState(null)
    const [customNotes, setCustomNotes] = useState("")
    



    //load in weekly calendar
    const loadWeekRecipes = async() => {
        fetch("http://localhost:3000/week-recipes", {
            credentials:"include"
        }).then(res => res.json()).then(data => setWeekRecipes(
            data.map(r => ({
                id: r.id, 
                title: r.recipe, 
                date: r.day
            }))
        ))
    }
    useEffect(() => {loadWeekRecipes()}, [])

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

    const handleEventDrop = async(info) => {
        const {id, title} = info.event
        const newDay = info.event.startStr
        try{
            await fetch(`http://localhost:3000/week-recipes/${id}`, {
                method: "PUT", 
                credentials: "include", 
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    recipe: title,
                    ingredients: "[]",
                    day: newDay
                })
            })

            await loadWeekRecipes()
            setSnackbar({open: true, message: "Meal moved successfully!", severity: "error"})
        }catch(err){
            console.error(err)
            setSnackbar({open: true, message: "Failed to move meal", severity: "error"})
        }
    }

    //add recipe to calendar
    const addToCalendar = async(recipe, day) => {
        try{
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

        await loadWeekRecipes()
        setSnackbar({open: true, message: "Meal added to calendar!", severity: "success"})
        }catch(err){
            console.error(err)
            setSnackbar({open: true, message: "Failed to add meal", severity: "error"})
        }
    }


    //FullCalendar Day Click
    const handleDateClick = (info) => {
        const day = info.dateStr
        setModalOpen(true)
    }

    const handleModalAdd = async () => {
        if(!selectedRecipe || !selectedDate) return
        await addToCalendar({...selectedRecipe, ingredients: customNotes}, selectedDate)
        setModalOpen(false)
        setSelectedRecipe(null)
        setCustomNotes("")
    }



    return(
        <div style = {{padding: "20px"}}>
            <h1>Your Weekly Meal Plan</h1>

            <FullCalendar plugins={[dayGridPlugin, interactionPlugin]}
            initialView = "dayGridWeek" events = {weekRecipes} dateClick = {handleDateClick} eventDrop = {handleEventDrop} editable = {true}
            droppable = {true} height = "auto"/>

            <br/><br/>

            <TextField label = "Search Recipes" fullWidth value = {searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{marginBottom: 3, marginTop: 3}}/>
            
            <Typography variant = "h5" sx = {{marginBottom: 2}}>Saved Recipes</Typography>

            <Grid container spacing = {2}>
                {savedRecipes.map((r) => (
                    <Grid item xs = {12} sm = {6} md = {4} key = {r.id}>
                        <Card draggable onDragStart = {(e) => e.dataTransfer.setData("recipe", JSON.stringify(r))}>
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

            <Typography variant = "h5" sx = {{marginY: 2}}>
                Explore Recipes
            </Typography>

            <Grid container spacing = {2}>
                {mealDbRecipes.map((meal) => (
                    <Grid item xs = {12} sm = {6} md = {4} key = {meal.idMeal}>
                        <Card draggable onDragStart = {(e) => e.dataTransfer.setData("recipe", JSON.stringify(meal))}>
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
            
            {/* <Modal open = {modalOpen}  onClose={() => setModalOpen(false)}>
                <Typography>Select a Recipe</Typography>
                <TextField
            </Modal> */}
            
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open:false})}>
                <Alert severity = {snacckbar.severity} sx = {{ width: "100%"}}>{snackbar.message}</Alert>
            </Snackbar>
        </div>
    )
}

export default Dashboard