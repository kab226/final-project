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
        <Box sx={{maxWidth: 650, mx: "auto", mt:4}}>
            <Typography variant = "h4" gutterBottom>
                GroceryList
            </Typography>

            <Typography variant="h6" sx={{mt: 3}}>
                Ingredients From Weekly Meals
            </Typography>

            <Paper sx = {{ mt:1}}>
                <List>
                    {items.map((i, index) => (
                        <React.Fragment key = {index}>
                            <ListItem>
                                <ListItemText primary={`${i.ingredient} (${i.amount})`} secondary = {`From: ${i.recipe}`}/>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
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
                        <React.Fragment key = {item.id}>
                            <ListItem>
                                <ListItemText primary={`${item.ingredient} (${item.amount})`} secondary = {`From: ${item.recipe}`}/>

                                <IconButton onClick={() => edit(item)}>
                                    <EditIcon/>
                                </IconButton>

                                <IconButton onClick={() => deleteItem(item.id)}>
                                    <DeleteIcon/>
                                </IconButton>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    )
}
export default GroceryList