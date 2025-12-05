//this is going to hold all the logic to add a custom recipe modal
//this will add the recipe to the saved-recipes table
//uses add and remove icons when adding new ingredient fields
import { useState} from 'react'
import {Button, Modal, Box, TextField, Stack, IconButton, Typography} from  '@mui/material'
import {Add, Remove} from '@mui/icons-material'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'white',
  boxShadow: 24,
  p: 4,
  borderRadius: 3, 
  outline: 'none', 
  maxHeight: '90vh',
}

export default function CreateRecipeModal({createRecipeModalOpen, setCreateRecipeModalOpen, refreshSavedRecipes}) {
  const [recipe, setRecipe] = useState('')
  const [ingredients, setIngredients] = useState([{ingredient: '', measurement: ''}])
  const [notes, setNotes] = useState('')

  // Add a new empty ingredient field to the modal
  const addIngredientField = () => {
    setIngredients([...ingredients, { ingredient: '', measurement: '' }])
  }

  // Remove an ingredient field from the modal
  const removeIngredientField = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index)
    setIngredients(newIngredients)
  }

  // Update an ingredient's name or measurement
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients]
    newIngredients[index][field] = value
    setIngredients(newIngredients)
  }
  //adds a new recipe to the saved recipes table
  const addRecipe = () => {
    console.log('add recipe button clicked')

    const newRecipe = {
    recipe: recipe,
    ingredients: JSON.stringify(ingredients),
    notes: notes
    }

    fetch('http://localhost:3000/saved-recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user': localStorage.getItem('x-user')
      },
      body: JSON.stringify(newRecipe)
    })
    .then(response => {
      if(!response.ok) {
        throw new Error(`HTTP error! status ${response.status}`)
      }
      return response.text()
    })
    .then(responseData => {
      console.log(responseData)
      setCreateRecipeModalOpen(false)
      refreshSavedRecipes()
    })
}

//closes modal and resets ingredients
const handleModalClose= () =>{
  setCreateRecipeModalOpen(false)
  setIngredients([{ingredient: '', measurement: ''}])
}


return(
    <Modal open= {createRecipeModalOpen} onClose={handleModalClose}>
      <Box sx={style}>
        <Typography variant = "h5" fontWeight="bold" sx = {{mb: 3}}>Enter Recipe Details</Typography>
        <Stack spacing = {3}>
          <TextField required label ="Recipe Name" fullWidth variant="outlined" onChange = {event => 
            setRecipe(event.target.value)}/>
          <Box>
            <Typography variant = "subtitle2" sx= {{mb:1, color: 'text.secondary'}}>Ingredients</Typography>
            <Stack spacing = {2}>
                  {ingredients.map((ing, index) => (
                      <Stack key={index} direction="row" spacing={1} alignItems="center">
                      <TextField required label="Ingredient" value={ing.ingredient} fullWidth size="small" onChange={(e) => 
                          handleIngredientChange(index, 'ingredient', e.target.value)}
                      />
                      <TextField required label="Amount" value={ing.measurement} size= "small" sx={{width: '120px'}} onChange={(e) => 
                          handleIngredientChange(index, 'measurement', e.target.value)}
                      />
                      <IconButton onClick={() => removeIngredientField(index)} disabled={ingredients.length === 1} color = "error">
                          <Remove />
                      </IconButton>
                      </Stack>
                  ))}
            </Stack>
            <Button startIcon={<Add />} onClick={addIngredientField} sx = {{mt: 1, color: '#f77f00'}}>
                  Add Another Ingredient
            </Button>
          </Box>
          <TextField label = "Notes (Optional)" multiline rows = {3} onChange={e => setNotes(e.target.value)}/>  
          <Box sx = {{display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2}}>
              <Button variant = "contained" onClick = {addRecipe} sx= {{backgroundColor: '#f77f00', color: 'white'}}>Add Recipe</Button>
              <Button onClick = {handleModalClose} sx= {{color: '#d62828'}}>Close</Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  )
}
