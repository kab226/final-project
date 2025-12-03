import React, { useEffect, useState } from "react"
import {Box, Typography, Paper, TextField, Button, IconButton, List, ListItem, ListItemText, Divider, Container, Grid} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import AddIcon from "@mui/icons-material/Add"

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
            const household_id = localStorage.getItem("household_id")
            const res = await fetch(`http://localhost:3000/week-recipes?household_id=${household_id}`,  
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

        <Container maxWidth="md" sx = {{mt: 5, mb: 10}}>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                <Typography variant = "h4" fontWeight="bold">
                    Grocery List
                </Typography>
            </Box>

            <Grid container spacing = {4}>
                {/*Weekly Ingredients */}
                <Grid sx = {{width: '1200px'}}>
                    <Typography variant = "h6" sx = {{mb: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                        <ShoppingCartIcon htmlColor="#f77f00"/> From Weekly Meals
                    </Typography>
                    <Paper elevation = {2} sx = {{borderRadius: 2}}>
                        {items.length === 0? (
                            <Box sx = {{p: 3, textAlign: 'center', color: 'text.secondary'}}>
                                No meals scheduled for this week.
                            </Box>
                        ) : (
                            <List sx = {{maxHeight: 600, overflow: 'auto'}}>
                                {items.map((i, index)=> (
                                    <React.Fragment key = {index}>
                                        <ListItem>
                                            <ListItemText primary={<Typography fontWeight = "500">{i.ingredient}</Typography>}
                                            secondary = {`${i.amount} - ${i.recipe}`}/>
                                        </ListItem>
                                        {index < items.length - 1 && <Divider component = "li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>
                {/*Custom Items */}
                <Grid item xs = {12} md = {6}>
                    <Typography variant = "h6" sx = {{mb: 2}}>
                        Custom Items
                    </Typography>
                    <Paper elevation = {2} sx = {{p: 3, mb: 3, borderRadius: 2}}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs = {8}>
                                    <TextField name ="ingredient" label = "Ingredient" size = "small" value = {form.ingredient} onChange={handleChange} fullWidth required/>
                                </Grid>
                                <Grid item xs = {4}>
                                    <TextField name ="amount" label = "Amount" size = "small" value = {form.amount} onChange={handleChange} fullWidth/>
                                </Grid>
                                <Grid item xs = {12}>
                                    <TextField name ="recipe" label = "For Recipe (Optional)" size = "small" value = {form.recipe} onChange={handleChange} fullWidth/>
                                </Grid>
                                <Grid item xs = {12}>
                                    <Button variant = "contained" type = "submit" sx = {{backgroundColor: '#f77f00'}}fullWidth startIcon= {!editingID && <AddIcon />}>
                                        {editingID? "Update Item" : "Add Item"}
                                    </Button>
                                    {editingID && (
                                        <Button size = "small" fullWidth onClick={() => {setEditingId(null), setForm({ingredient:"", amount:"", recipe: ""})}} sx = {{mt:1}}>
                                            Cancel
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                    <Paper elevation = {2} sx = {{borderRadius: 2}}>
                        {custom.length === 0? (
                            <Box sx = {{p: 3, textAlign: 'center', color: 'text.secondary'}}>
                                No custom items added
                            </Box>
                        ) : (
                            <List>
                                {custom.map((item, index)=> (
                                    <React.Fragment key = {item.id}>
                                        <ListItem secondaryAction = {<Box>
                                            <IconButton edge = "end" aria-label="edit" onClick={() => edit(item)} sx = {{mr: 1}}>
                                                <EditIcon fontSize = "small"/>
                                            </IconButton>
                                            <IconButton edge = "end" aria-label="delete" onClick={() => deleteItem(item.id)}>
                                                <DeleteIcon fontSize = "small"/>
                                            </IconButton>
                                        </Box>
                                        }>
                                            <ListItemText primary={<Typography fontWeight = "500">{item.ingredient}</Typography>}
                                            secondary = {`${item.amount} - ${item.recipe}`}/>
                                        </ListItem>
                                        {index < custom.length - 1 && <Divider variant="inset" component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>

                </Grid>

            </Grid>
        </Container>
               
    )
}
export default GroceryList