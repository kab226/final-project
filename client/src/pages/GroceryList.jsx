import { useEffect, useState } from "react"
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
            const res = await fetch("http://localhost:3000/week-recipes",  
                {   method:"GET",
                    headers: {"Content-type": "application/json",
                        "x-user": localStorage.getItem("x-user")},
                    body: JSON.stringify({household_id})
            })
            const weekRecipes = await res.json()
            const allIngredients = []

            for(const entry of weekRecipes){
                const mealName = entry.recipe

                //makes a call to MealDB
                const api = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`)
                const data = await api.json()

                if(!data.meals) continue

                const meal = data.meals[0]

                for(let i = 1; i <= 20; i++){
                    const ingredient = meal[`strIngredient${i}`]
                    const amount = meal[`strMeasure${i}`]

                    if(ingredient && ingredient.trim() !==""){
                        allIngredients.push({
                            ingredient,
                            amount,
                            recipe: mealName,
                            auto: true
                        })
                    }

                }

            }
            setItems(allIngredients)
        }catch(err){
            console.error("Loading error", err)
        }
    }
   

    //get custom grocery items
    const loadCustom = async() => {
        try{
            const res = await fetch("http://localhost:3000/grocery-list", {
                headers: {"Content-type": "application/json",
                        "x-user": localStorage.getItem("x-user")},
                body: JSON.stringify({household_id})
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
        await fetch('http://localhost:3000/grocery-list/${id}', {
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
                <Grid item xs = {12} md = {6}>
                    <Typography variant = "h6" sx = {{mb: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                        <ShoppingCartIcon color = "primary"/> From Weekly Meals
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
                                    <Button variant = "contained" type = "submit" fullWidth startIcon= {!editingID && <AddIcon />}>
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