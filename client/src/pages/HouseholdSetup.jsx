import {FormControl, InputLabel, Select, MenuItem, TextField,  Button, Paper, Typography, Box, Divider, Container, Alert} from "@mui/material"
import {useState, useEffect} from "react"
import { useNavigate } from "react-router-dom"
import HomeIcon from '@mui/icons-material/Home'

function HouseholdSetup(){
    const [households, setHouseholds] = useState([])
    const [selected, setSelected] = useState("")
    const[name, setName] = useState("")
    const[status, setStatus] = useState(null)
    const navigate = useNavigate()

    //load in households that already exist
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


    //join a household
    const join = async() => {
        const nameUsed = name.trim() || selected

        if(!nameUsed){
            setStatus("Please select or enter a household name.")
            return
        }

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

            localStorage.setItem("household_id", data.household_id)

            localStorage.setItem('role', data.role)

            setStatus("Joined household successfully!")
            setTimeout(()=> {
                // if (data.is_admin || data.role === 'admin'){
                    navigate("/household-admin")
                // }else{
                //     navigate("/dashboard")
                // }
            }, 1200)
        } catch(err){
            console.error(err)
            setStatus("Server error joining household.")
        }
    }

    return(
        <Container maxWidth="sm">
            <Paper elevation = {3} sx = {{p: 5, mt:8, borderRadius: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3}}>
                <Box sx = {{display: 'flex', justifyContent: 'center', mb: 1}}>
                    <Box sx = {{p:2, bgcolor: '#fff4e6', borderRadius: '50%'}}>
                        <HomeIcon sx={{fontSize: 40, color: 'var(--color-secondary)'}}/>
                    </Box>
                </Box>

                <Typography variant = "h4" fontWeight="bold" gutterBottom>Join a Household </Typography>
                <Typography variant = "body1" color= "text.secondary" sx = {{mb:2}}>
                    Connect with your family or roommates to share meals and grocery lists.
                </Typography>

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
                    <Typography variant = "caption" color = "text.secondary">OR CREATE NEW</Typography>
                </Divider>

                <TextField fullWdith label = "Create New Household Name" variant = "outlined" value = {name}
                    onChange={(e) => {
                        setName(e.target.value)
                        setSelected("")
                    }}/>
                <Button onClick={join} variant = "contained" size = "large" fullWidth sx= {{py: 1.5, fontSize: '1.1rem', fontWeight: 600}}>
                    Continue
                </Button>

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
