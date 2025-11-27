import {FormControl, InputLabel, Select, MenuItem, TextField,  Button} from "@mui/material"
import {useState, useEffect} from "react"
import { useNavigate } from "react-router-dom"

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

            setStatus("Joined household successfully!")
            setTimeout(()=> navigate("/dashboard"), 1200)
        } catch(err){
            console.error(err)
            setStatus("Server error joining household.")
        }
    }

    return(
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center", 
            marginTop: "70px",
            gap: "20px"
        }}>
            <h1>Join a Household</h1>
            <FormControl sx = {{ width: 260}}>
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

            <div>or</div>

            <TextField sx = {{ width: 260}} label = "Create new household" variant = "outlined" value = {name}
                onChange={(e) => {
                    setName(e.target.value)
                    setSelected("")
                }}/>
            <Button onClick={join} variant = "contained" sx= {{ fontSize: 18, padding: "10px 24px", mt: 1}}>
                Continue
            </Button>

            {status && <p>{status}</p>}
        </div>
    )

}

export default HouseholdSetup
