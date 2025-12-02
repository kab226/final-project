import {useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import {Grid, Box, Card, Paper, Container, CardContent, CardMedia, Typography, TextField, Button, Modal, Snackbar, Alert} from "@mui/material"
import {extractIngredients} from '../components/ExtractIngredients'
import CreateRecipeModal from '../components/CreateRecipeModal'

import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider"
import {DatePicker} from '@mui/x-date-pickers/DatePicker'
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs"

function Dashboard(){
    const [weekRecipes, setWeekRecipes] = useState([])
    const [savedRecipes, setSavedRecipes] = useState([])
    const [mealDbRecipes, setMealDbRecipes] = useState([])
    const [searchTerm, setSearchTerm] = useState("")

    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success"})

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState(null)
    const [selectedDate, setSelectedDate] = useState(dayjs())
    const [customNotes, setCustomNotes] = useState("")
    const [createRecipeModalOpen, setCreateRecipeModalOpen] = useState(false)

    const currentUserRole = localStorage.getItem("role")
    const isAdmin = currentUserRole === "admin"
    

    //load in weekly calendar
    const loadWeekRecipes = async() => {
        fetch("http://localhost:3000/week-recipes", {
            headers: {"x-user": localStorage.getItem("x-user")}
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
    const loadSavedRecipes = async () => {
        try {
            const res = await fetch("http://localhost:3000/saved-recipes", {
                headers: {"x-user": localStorage.getItem("x-user")}
            })
            const data = await res.json()
            setSavedRecipes(data)
        } catch (err) {
            console.error("Failed to load saved recipes", err)
        }
    }

    useEffect(() => {loadSavedRecipes()}, [])

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
                headers: {"Content-Type": "application/json", 
                    "x-user": localStorage.getItem("x-user")},
                body: JSON.stringify({
                    recipe: title,
                    ingredients: "[]",
                    day: newDay
                })
            })

            await loadWeekRecipes()
            setSnackbar({open: true, message: "Meal moved successfully!", severity: "success"})
        }catch(err){
            console.error(err)
            setSnackbar({open: true, message: "Failed to move meal", severity: "error"})
        }
    }
    
    //add recipe to calendar
    const addToCalendar = async(recipe, day) => {
        try{
            const ingredients = recipe.idMeal ? extractIngredients(recipe) : recipe.ingredients
            await fetch("http://localhost:3000/week-recipes", {
                method: "POST", 
                headers: {"Content-Type": "application/json",
                    "x-user": localStorage.getItem("x-user")},
                body: JSON.stringify({
                    recipe: recipe.strMeal || recipe.recipe,
                    ingredients: ingredients,
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

//make this admin only
    const removeMeal = async(meal_id) => {
        try{
            await fetch(`http://localhost:3000/week-recipes/${meal_id}`, {
                method: "DELETE", 
                headers: {
                    "x-user": localStorage.getItem("x-user")},
            })
            await loadWeekRecipes()
            setSnackbar({open: true, message: "Meal removed from calendar!", severity: "success"})
        }catch(err){
            console.error(err)
            setSnackbar({open: true, message: "Failed to remove meal", severity: "error"})
        }
    }

    //Save Recipe from mealdb
    const saveRecipe = async (meal) => {
    try {
        // Extract ingredients if it's from MealDB
        const ingredients = extractIngredients(meal)

        const newRecipe = {
            recipe: meal.strMeal,
            ingredients: JSON.stringify(ingredients),
            notes: ""
        }

        const res = await fetch("http://localhost:3000/saved-recipes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user": localStorage.getItem("x-user")
            },
            body: JSON.stringify(newRecipe)
        })

        if (!res.ok) throw new Error(`HTTP error! status ${res.status}`)

        setSnackbar({ open: true, message: "Recipe saved!", severity: "success" })

        // Refresh saved recipes to re-render
        loadSavedRecipes()
    }catch (err){
        console.error("Failed to save recipe", err)
        setSnackbar({ open: true, message: "Failed to save recipe", severity: "error" })
    }
    }


    const handleModalAdd = async () => {
        await addToCalendar({...selectedRecipe, ingredients: customNotes}, selectedDate.format("YYYY-MM-DD"))
        setModalOpen(false)
    }

    // const handleModalOpen= () =>{
    //     setCreateRecipeModalOpen(true)
    // }

    const removeFromCalendar = async(eventId) => {
        if (!window.confirm("Are you sure you want to remove this meal from the calendar?")) {
            return;
        }

        try{
            await fetch(`http://localhost:3000/week-recipes/${eventId}`, {
                method: "DELETE",
                headers: {
                    "x-user": localStorage.getItem("x-user")
                },
            })

            
            await loadWeekRecipes()
            setSnackbar({open: true, message: "Meal removed from calendar!", severity: "success"})
        }catch(err){
            console.error(err)
            setSnackbar({open: true, message: "Failed to remove meal", severity: "error"})
        }
    }

    const handleEventClick = (info) => {
        const eventId = info.event.id;
        removeFromCalendar(eventId);
    }

    return(
        <Container maxWidth= "xl" sx = {{paddingY:4}}>
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3}}>
                <Typography variant= "h4" fontWeight = "bold">Weekly Meal Plan</Typography>
            </Box>
            <Paper elevation = {2} sx = {{p: 3, mv: 4, borderRadius: 2}}>
                <FullCalendar plugins={[dayGridPlugin, interactionPlugin]}
                initialView = "dayGridWeek" events = {weekRecipes}  eventDrop = {handleEventDrop} eventClick = {handleEventClick} editable = {true}
                droppable = {true} height = "auto"   displayEventTime={false}/>
            </Paper>
            <Typography variant="h5" sx={{ marginTop: 3, mb: 2, fontWeight: 600}}>This Week's Meals</Typography>
            <Grid container spacing={2}>
                {weekRecipes
                //gets only the meals from this week
                .filter((meal) => {
                    const mealDate = new Date(meal.date)
                    const today = new Date()
                    const day = today.getDay()
                    const diffToSunday = -day
                    const sunday = new Date(today)
                    sunday.setDate(today.getDate() + diffToSunday)
                    sunday.setHours(0,0,0,0)

                    return mealDate >= sunday
                })
                .map((meal) => (
                    <Grid item xs={12} sm = {6} md = {3} key={meal.id}>
                        <Card sx = {{height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2}}>
                            <CardContent sx = {{flexGrow: 1}}>
                                <Typography variant="h6" fontWeight= "bold">{meal.title}</Typography>
                                <Typography sx = {{mt: 1}}>Date: {new Date(meal.date).toLocaleDateString()}</Typography>
                                {/* renders only if isAdmin */}
                                {isAdmin && (
                                    <Button variant="outlined" color="error" sx={{ marginTop: 2 }} onClick={() => removeMeal(meal.id)}>
                                        Remove 
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>


            <Box sx = {{my: 6}}>
                <Typography variant = "h5" sx = {{mb: 2, fontWeight: 600}}>Recipe Library</Typography>
                <Box sx = {{display: 'flex', flexDirection: 'column', gap: 2, mb:4}}>
                    <TextField label = "Search Recipes" fullWidth value = {searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{bgcolor: 'white'}}/>
                    <Button variant = "contained" size = "large" sx={{minWidth: '150px', backgroundColor: '#f77f00'}}onClick = {()=> setCreateRecipeModalOpen(true)}>
                        Create Recipe
                    </Button>
                </Box>

                {savedRecipes.length > 0 && (
                    <Box sx = {{mb : 5}}>
                        <Typography variant = 'h6' sx = {{mb: 2}}>Your Saved Recipes</Typography>
                        <Grid container spacing = {2}>
                            {savedRecipes.map((r)=> (
                                <Grid item xs = {12} sm = {6} md = {3} key = {r.id}>
                                    <Card draggable onDragStart = {(e) => e.dataTransfer.setData("recipe", JSON.stringify(r))} 
                                    sx = {{cursor: 'grab', '&:hover': {boxShadow: 6}, transition: '0.3s'}}>
                                        <CardContent>
                                            <Typography variant = "h6" noWrap>{r.recipe}</Typography>
                                            <Button size = "small" variant = "outlined" sx = {{borderColor: '#d62828', color: '#212529', mt: 1}} onClick= {() => {setSelectedRecipe(r); setModalOpen(true)}}>
                                                Add to Calendar
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
                <Box>
                    <Typography variant = "h6" sx = {{mb: 2}}>Search Results</Typography>
                    <Grid container spacing = {2}>
                        {mealDbRecipes.map((meal) => (
                            <Grid item xs = {12} sm = {6} md = {3} key = {meal.idMeal}>
                                <Card draggable onDragStart = {(e) => e.dataTransfer.setData("recipe", JSON.stringify(meal))}
                                    sx = {{height: '100%', cursor: 'grab', '&:hover':{boxShadow: 6}, transition: '0.3s'}}>
                                    <CardMedia component = "img" height = "180" image = {meal.strMealThumb}/>
                                    <CardContent>
                                        <Typography variant = "subtitle1" fontWeight = "bold" noWrap title={meal.strMeal}>{meal.strMeal}</Typography>
                                        <Box sx={{mt: 2, display: 'flex', flexDirection: 'column', gap: 1}}>
                                            <Button variant = "outlined" size = "medium" sx = {{borderColor: '#d62828', color: '#212529'}} onClick = {() => {setSelectedRecipe(meal); setModalOpen(true)}}>
                                                Add to Calendar
                                            </Button>
                                            <Button variant = "text" size = "medium" sx = {{borderColor: '#d62828', color: '#212529'}} onClick = {() => {saveRecipe(meal)}}>
                                                Save Recipe
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
            <Modal open = {modalOpen} onClose = {() => setModalOpen(false)}>
                <Box sx={{background: "white", width: 400, margin: "10vh auto", p: 4, borderRadius: 3, boxShadow: 24, outline: 'none'}}>
                    <Typography variant = "h6" sx = {{mb: 3, fontWeight: 'bold'}}>
                        {selectedRecipe ? `Add "${selectedRecipe.strMeal || selectedRecipe.recipe}"`: "Add Meal to Calendar"}
                    </Typography>

                    {/*Date picker instead of manually entering */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label = "Meal Date" value = {selectedDate} onChange={(newValue) => setSelectedDate(newValue)} sx={{width: "100%", mb:2}}/>
                    </LocalizationProvider>

                    {/*Optipnal Notes */}
                    <TextField label = "Notes (Optional)" multiline rows = {3} fullWidth value = {customNotes} onChange={(e) => setCustomNotes(e.target.value)} sx = {{mb: 3}}/>

                    <Box sx = {{display: "flex", justifyContent: "flex-end", gap: 2}}>
                        <Button sx = {{color: '#d62828'}}onClick = {() => setModalOpen(false)}>Cancel</Button>
                        <Button sx = {{backgroundColor: '#f77f00'}} variant="contained" disabled = {!selectedDate || !selectedRecipe} onClick={handleModalAdd}>Add Meal</Button>
                    </Box> 
                </Box>
            </Modal>
            
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open:false})}>
                <Alert severity = {snackbar.severity} sx = {{ width: "100%"}}>{snackbar.message}</Alert>
            </Snackbar>
            <CreateRecipeModal createRecipeModalOpen = {createRecipeModalOpen} 
                setCreateRecipeModalOpen = {setCreateRecipeModalOpen}
                refreshSavedRecipes = {loadSavedRecipes} />
        </Container>

        
    )
}

export default Dashboard