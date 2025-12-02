import { useEffect, useState } from "react"
import {Box, Typography, Paper, TextField, Button, IconButton, List, ListItem, ListItemText, Divider} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
function GroceryList(){
    const [items, setItems] = useState([])
    const [custom, setCustom] = useState([])
    const [form, setForm] = useState({
        ingredient: "",
        amount: "",
        recipe: ""
    })
    const [editingID, setEditingId] = useState(null)
    const household_id = localStorage.getItem("household_id")

    useEffect(()=>{
        loadFromRecipes()
        loadCustom()
    }, [])

    //Get the gorcery list based on the week recipes and MealDB ingredients
    const loadFromRecipes = async() => {
        try{
            const res = await fetch("http://localhost:3000/week-recipes",  
                {   method:"GET",
                    headers: {"Content-type": "application/json",
                        "x-user": localStorage.getItem("x-user")},
                    // body: JSON.stringify({household_id})
            })
            const weekRecipes = await res.json()
            const mergedIngredients = {}

            weekRecipes                
                .filter((meal) => {
                    const mealDate = new Date(meal.day)

                    // get start of the current week
                    const today = new Date()
                    const day = today.getDay() // 0 (Sun) - 6 (Sat)
                    const startOfWeek = new Date(today)
                    startOfWeek.setDate(today.getDate() - day)
                    startOfWeek.setHours(0, 0, 0, 0)

                    // get end of the current week
                    const endOfWeek = new Date(startOfWeek)
                    endOfWeek.setDate(startOfWeek.getDate() + 6)
                    endOfWeek.setHours(23, 59, 59, 999)

                    return mealDate >= startOfWeek && mealDate <= endOfWeek
                })
                .forEach((recipe) => {
                    const mealName = recipe.recipe
                    // ingredients field is already an array of objects
                    recipe.ingredients.forEach((item) => {
                    const key = item.ingredient.toLowerCase()

                    if (mergedIngredients[key]) {
                            // Merge the recipe sources
                            mergedIngredients[key].recipe.push(mealName)

                            // Combine amounts as string (can later improve to sum numbers)
                            mergedIngredients[key].amount += ` + ${item.measurement}`
                        } else {
                            mergedIngredients[key] = {
                                ingredient: item.ingredient,
                                amount: item.measurement,
                                recipe: [mealName],
                                auto: true,
                            }
                        }
                    })
            
                })
                const allIngredients = Object.values(mergedIngredients).map((item) => ({ ...item, recipe: item.recipe.join(", "), }))
                .sort((a, b) => a.ingredient.localeCompare(b.ingredient))
            setItems(allIngredients)
        }catch(err){
            console.error("Loading error", err)
        }
    }
   

    //get custom grocery items
    const loadCustom = async() => {
        try{
            const res = await fetch("http://localhost:3000/grocery-list", {
                method: "GET",
                headers: {"Content-type": "application/json",
                        "x-user": localStorage.getItem("x-user")},
                // body: JSON.stringify({household_id})
            })
            const data = await res.json()
            setCustom(data)
        }  catch(err){
            console.error("Error loading in custom items", err)
        }
    }
    //handles form input changes
    const handleChange = (e)=>{
        setForm({...form, [e.target.name]: e.target.value})
    }

    //submits new or edited items
    const handleSubmit = async(e) => {
        const url = editingID ? `http://localhost:3000/grocery-list/${editingID}` : `http://localhost:3000/grocery-list`
        
        const method = editingID ? "PUT" : "POST"

        await fetch(url, {
            method,
            headers: {"Content-type": "application/json",
                        "x-user": localStorage.getItem("x-user")},
            body: JSON.stringify({...form, household_id})
        })

        setForm({ingredient:"", amount:"", recipe:""})
        setEditingId(null)
        loadCustom()    
    }

    //delete a custom item
    const deleteItem = async(id) => {
        await fetch(`http://localhost:3000/grocery-list/${id}`, {
            method: "DELETE", 
            headers: {"x-user": localStorage.getItem("x-user")}
        })
        loadCustom()
    }

    //edit start
    const edit = (item) =>{
        setEditingId(item.id)
        setForm({
            ingredient: item.ingredient,
            amount: item.amount,
            recipe: item.recipe
        })
    }

    return(
        <Box sx={{maxWidth: 650, mx: "auto", mt:4}}>
            <Typography variant = "h4" gutterBottom>
                Grocery List
            </Typography>

            <Typography variant="h6" sx={{mt: 3}}>
                Ingredients From Weekly Meals
            </Typography>

            <Paper sx = {{ mt:1}}>
                <List>
                    {items.map((i, index) => (
                        <ListItem key = {index}>
                            <ListItemText primary={`${i.ingredient} (${i.amount})`} secondary = {`From: ${i.recipe}`}/>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Typography variant="h6" sx={{mt: 3}}>
                Your Custom Items
            </Typography>

            <Paper sx = {{ p: 2, mb: 3}}>
                <form onSubmit={handleSubmit}>
                    <TextField name ="ingredient" label = "Ingredient" value = {form.ingredient} onChange={handleChange} fullWidth sx = {{mb:2}}/>
                    <TextField name ="amount" label = "Amount" value = {form.amount} onChange={handleChange} fullWidth sx = {{mb:2}}/>
                    <TextField name ="recipe" label = "Recipe (optional)" value = {form.recipe} onChange={handleChange} fullWidth sx = {{mb:2}}/>
                    <Button variant = "contained" type = "submit" fullWidth>
                        {editingID? "Update Item" : "Add Item"}
                    </Button>
                </form>
            </Paper>
            <Paper>
                <List>
                    {custom.map((item) => (
                        <ListItem key = {item.id}>
                            <ListItemText primary={`${item.ingredient} (${item.amount})`} secondary = {`From: ${item.recipe}`}/>

                            <IconButton onClick={() => edit(item)}>
                                <EditIcon/>
                            </IconButton>

                            <IconButton onClick={() => deleteItem(item.id)}>
                                <DeleteIcon/>
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    )
}
export default GroceryList