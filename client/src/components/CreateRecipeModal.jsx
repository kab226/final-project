//this is going to hold all the logic to add a transaction
import { useState} from 'react'
import {Button, Modal, Box, TextField, Stack, IconButton} from  '@mui/material'
import {Add, Remove} from '@mui/icons-material'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}
export default function CreateRecipeModal({createRecipeModalOpen, setCreateRecipeModalOpen, refreshSavedRecipes
}) {
    const [recipe, setRecipe] = useState('')
    const [ingredients, setIngredients] = useState([{ingredient: '', measurement: ''}])
    const [notes, setNotes] = useState('')

    // Add a new empty ingredient
    const addIngredientField = () => {
        setIngredients([...ingredients, { ingredient: '', measurement: '' }])
    }

    // Remove an ingredient
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

    const handleModalClose= () =>{
    setCreateRecipeModalOpen(false)
    setIngredients([{ingredient: '', measurement: ''}])
  }

  
    return(
        <Modal open= {createRecipeModalOpen} onClose={handleModalClose}>
          <Box sx={style}>
            <h3>Enter Recipe Details</h3>
            <Stack spacing = {2}>
              <TextField required label ="Recipe Name" onChange = {event => 
                setRecipe(event.target.value)}/>
           {ingredients.map((ing, index) => (
                <Stack key={index} direction="row" spacing={1}>
                <TextField required label="Ingredient" value={ing.ingredient} onChange={(e) => 
                    handleIngredientChange(index, 'ingredient', e.target.value)}
                    fullWidth
                />
                <TextField required label="Amount" value={ing.measurement} onChange={(e) => 
                    handleIngredientChange(index, 'measurement', e.target.value)}
                />
                <IconButton onClick={() => removeIngredientField(index)} disabled={ingredients.length === 1}>
                    <Remove />
                </IconButton>
                </Stack>
            ))}

            <Button sx= {{color: '#f77f00'}} startIcon={<Add />} onClick={addIngredientField}>
                Add Ingredient
            </Button>

                <TextField label = "Notes" onChange = {event =>
                  setNotes(event.target.value)}/>

            </Stack>
            <Button onClick = {addRecipe} sx= {{color: '#f77f00'}}>Add Recipe</Button>
            <Button onClick = {handleModalClose} sx= {{color: '#d62828'}}>Close</Button>
          </Box>
        </Modal>
    )
  

}
