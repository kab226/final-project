/*HouseholdSetup allows users to select or create a household. This is only shown if a user is new to MealMate
Used MaterialUI components and icons for styling
React useState and useEffect was used to load in the available households and handle the selections or creation */
import {FormControl, InputLabel, Select, MenuItem, TextField,  Button, Paper, Typography, Box, Divider, Container, Alert} from "@mui/material"
import {useState, useEffect} from "react"
import { useNavigate } from "react-router-dom"
import HomeIcon from '@mui/icons-material/Home'


function HouseholdSetup(){
    //holds list of existing households
    const [households, setHouseholds] = useState([])
    //holds selected household
    const [selected, setSelected] = useState("")
    //holds name of new household
    const[name, setName] = useState("")
    //holds any feedback to user 
    const[status, setStatus] = useState(null)
    const navigate = useNavigate()

    //load in households that already exist (once on component mount)
    useEffect(() => {
        const loadHouseholds = async() => {
            try{
                const res = await fetch("http://localhost:3000/households", {
                    headers:{
                        "x-user": localStorage.getItem("x-user")|| "",
                    },
                })
                const data = await res.json()
                setHouseholds(data)
            } catch(err){
                console.error("Failed to load households: ", err)
            }      
        }

        loadHouseholds()
    }, [])


    //join a household - executes when continue button is clicked
    const join = async() => {
        //gets household name to use - trims anything extra. could be selected name or a custom name
        const nameUsed = name.trim() || selected

        //validation check
        if(!nameUsed){
            setStatus("Please select or enter a household name.")
            return
        }
        //API call to join a household
        try{
            const res = await fetch("http://localhost:3000/households/join", {
                method:"POST",
                headers:{"Content-Type": "application/json", 
                        "x-user": localStorage.getItem("x-user")
                    },
                body: JSON.stringify({household_name: nameUsed})

            })
            const data = await res.json()
            if(!res.ok){
                setStatus("Error: " + data.error)
                return
            }
            //stores the new household details and the user's role (will be admin if they made a household or joined admin-less one)
            localStorage.setItem("household_id", data.household_id)
            localStorage.setItem('role', data.role)
            localStorage.setItem('household_name', nameUsed)

            //refresh window to update chip w/ household name (this doesn't work properly...need to look into fixing)
            window.dispatchEvent(new Event("storage"))


            setStatus("Joined household successfully!")
            navigate("/dashboard")  //navigate to main dashboard 

        } catch(err){
            console.error(err)
            setStatus("Server error joining household.")
        }
    }

    //Styling components
    return(
        <Container maxWidth="sm">
            {/*Paper just provides a cleaner, modern look and seperates from background - used this a lot throughout application */}
            <Paper elevation = {3} sx = {{p: 5, mt:8, borderRadius: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3}}>
                <Box sx = {{display: 'flex', justifyContent: 'center', mb: 1}}>
                    <Box sx = {{p:2, bgcolor: '#fff4e6', borderRadius: '50%'}}>
                        <HomeIcon sx={{fontSize: 40, color: 'var(--color-secondary)'}}/>
                    </Box>
                </Box>

                <Typography variant = "h4" fontWeight="bold" gutterBottom>Join a Household </Typography>
                <Typography variant = "h6" color= "text.secondary" sx = {{mb:2}}>
                    Connect with your family or roommates to share meals and grocery lists.
                </Typography>

                {/*Dropdown for selecting an existing household */}
                <FormControl fullWidth>
                    <InputLabel id = "household-select">
                        Select Existing Household
                    </InputLabel>
                    <Select labelId = "household-select" value = {selected} label = "Select Existing Household" 
                        onChange={(e) => {
                            setSelected(e.target.value)
                            setName("")
                        }}>
                            <MenuItem value = ""><em>None</em></MenuItem>
                            {households.map((h) => (
                        <MenuItem key = {h.household_id} value = {h.household_name}>{h.household_name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Divider>
                    <Typography variant = "body1" color = "text.secondary">OR CREATE NEW</Typography>
                </Divider>

                {/*Create a new household */}
                <TextField fullWidth label = "Create New Household" variant = "outlined" value = {name}
                    onChange={(e) => {
                        setName(e.target.value)
                        setSelected("")
                    }}/>
                <Button onClick={join} variant = "contained" size = "large" fullWidth sx= {{py: 1.5, fontSize: '1.1rem', fontWeight: 600, backgroundColor:  '#f77f00', color: 'white'}}>
                    Continue
                </Button>
                {/**Used Alert to notify of any errors (as resembled by status) - will be red if status includes the word "Error"*/}
                {status && (
                    <Alert severity = {status.includes("Error") ? "error" : "success"} sx = {{mt: 2}}>
                        {status}
                    </Alert>
                )}
            </Paper>
        </Container>
    )
}
export default HouseholdSetup
