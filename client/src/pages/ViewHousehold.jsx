//Household page 
//this will display the household, all the users information, allows admins to remove users and change roles
//utilizes a variety of icons from @mui/icons-materials
import { useState, useEffect } from "react"
import { Typography, Grid, Card, CardContent, Button, Snackbar, Alert, Container, Box, Paper, FormControl, InputLabel, Select, MenuItem, TextField, Chip } from "@mui/material"
import { useNavigate } from "react-router-dom"
import HomeIcon from '@mui/icons-material/Home'
import PersonIcon from '@mui/icons-material/Person'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

function ViewHousehold() {
    const [users, setUsers] = useState([])
    const [households, setHouseholds] = useState([])
    const [selected, setSelected] = useState("")
    const[name, setName] = useState("")

    //Role state to handle changes when changing households
    const [currentUserRole, setCurrentUserRole] = useState(localStorage.getItem("role") || "user")
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
    const navigate = useNavigate()

    const currentUser = localStorage.getItem("x-user")

    //Check if user is admin
    const isAdmin = currentUserRole === 'admin'

  // Load users in household
    const loadUsers = async () => {
        try {
            const res = await fetch("http://localhost:3000/household/users", {
                method: "GET",
                headers: { 
                    'Content-Type': 'application/json',
                    "x-user": localStorage.getItem("x-user"),
                    "x-household": localStorage.getItem("household_id")}
            })
            if (res.status === 403) {
                setSnackbar({ open: true, message: "Not authorized", severity: "error" })
                setTimeout(() => navigate("/dashboard"), 1500)
                return
            }
            const data = await res.json()
            setUsers(data)
        } catch (err) {
            console.error(err)
            setSnackbar({ open: true, message: "Failed to load users", severity: "error" })
        }
    }
    //fetches all households
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

    const loadData = async()=> {
        await loadUsers()
        await loadHouseholds()
    }

    useEffect(() => {
        loadData()
        setCurrentUserRole(localStorage.getItem("role") || "user")
    }, [])

    // Remove a user
    const removeUser = async (id) => {
        if (!window.confirm("Are you sure you want to remove this user?")) return

        try {
            const res = await fetch(`http://localhost:3000/household/users/${id}`, {
                method: "DELETE",
                headers: { 
                    'Content-Type': 'application/json',
                    "x-user": localStorage.getItem("x-user")
                },
            })

            if (!res.ok) throw new Error("Failed to remove user")

            setSnackbar({ open: true, message: "User removed successfully", severity: "success" })
            loadUsers()
        }catch (err){
            console.error(err)
            setSnackbar({ open: true, message: "Failed to remove user", severity: "error" })
        }
    }

    //switches role to the other role
    const changeUserRole = async (id, currentRole) => {
        //switches role
        const newRole = currentRole === "admin" ? "user" : "admin"
        try {
            const res = await fetch(`http://localhost:3000/users/${id}`, {
                method: "PUT",
                headers: { 
                    'Content-Type': 'application/json',
                    "x-user": localStorage.getItem("x-user")
                },
                body: JSON.stringify({role: newRole}),
            })
            if (!res.ok) throw new Error("Failed to change user role")

            setSnackbar({ open: true, message: "User role changed successfully", severity: "success" })
            loadUsers()
        }catch(err){
            console.error(err)
            setSnackbar({open: true, message: "Failed to update role", severity: "error"})
        }
    }

    //this will delete the household and make the users' household null
    const deleteHousehold = async() => {
        if(!window.confirm("Warning: This will delete the entire household and remove all members.")) return

        try{
            const householdId = localStorage.getItem('household_id')
            const res = await fetch(`http://localhost:3000/households/${householdId}`,{
                method: "DELETE",
                headers: {"x-user": localStorage.getItem("x-user")}
            })

            if(!res.ok) throw new Error("Failed to delete household")

            localStorage.removeItem('household_id')
            localStorage.removeItem('household_name')
            localStorage.setItem('role', 'user')

            setCurrentUserRole("user")
            setUsers([])
            await loadHouseholds()
            window.dispatchEvent(new Event("storage"))
            setSnackbar({open: true, message: "Household deleted", severity: "success"})
            
        }catch(err){
            console.error(err)
            setSnackbar({open: true, message: "Failed to delete household", severity: "error"})
        }
    }
    //allows users to switch their household
    const handleSwitchHousehold = async() => {
        const nameUsed = name.trim() || selected

        if(!nameUsed){
            setSnackbar({open: true, message: "Please select or enter a household name", severity: "warning"})
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
                setSnackbar({open: true, message: data.error || "Failed to join", severity: "error"})
                return
            }
            setCurrentUserRole(data.role)

            localStorage.setItem("household_id", data.household_id)
            localStorage.setItem('role', data.role)
            localStorage.setItem('household_name', nameUsed)
            //will update the navbar immediately with new household name
            window.dispatchEvent(new Event("storage"))
            //Resets            
            setName("")
            setSelected("")

            setSnackbar({open: true, message: "Joined household successfully!", severity: "success"})
            loadData()
        }catch(err){
            console.error(err)
            setSnackbar({open: true, message: "Server error joining household", severity: "error"})
        }
    }

    return (

        <Container maxWidth = "lg" sx = {{py: 4}}>
            <Box sx = {{mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant = "h4" fontWeight="bold">
                    Household Management
                </Typography>
                {isAdmin && (
                    <Chip icon = {<AdminPanelSettingsIcon sx = {{color: '#ffffff'}}/>} label = "Admin Access" sx = {{color: 'white', backgroundColor: '#f77f00'}} variant = "outlined"/>
                )}
            </Box>
            
            <Paper elevation = {2} sx = {{p:3, mb:4, borderRadius: 2}}>
                <Box sx = {{display: 'flex', alignItems: 'center', mb: 2}}>
                    <HomeIcon  sx = {{mr: 1, color: '#f77f00'}}/>
                    <Typography variant = "h5" fontWeight="600">Current Members</Typography>
                </Box>

                {users.length === 0 ? (
                    <Alert severity="info">You are not currently in a household. Use the section below to join one.</Alert>
                ) : (
                    <Grid container spacing = {3}>
                        {users.map((user) => (
                            <Grid item xs = {12} sm = {6} md = {4} key = {user.id}>
                                <Card variant = "outlined" sx = {{ height: '100%'}}>
                                    <CardContent>
                                        <Box sx = {{display: "flex", alignItems: 'center', mb: 2}}>
                                            <Box sx = {{p:1, bgcolor: '#f0f0f0', borderRadius: '50%', mr: 2}}>
                                                <PersonIcon sx = {{color: '#d62828'}}/>
                                            </Box>
                                            <Box>
                                                <Typography variant = "subtitle1" fontWeight="bold">
                                                    {user.name} {user.email === currentUser && "(You)"}
                                                </Typography>
                                                <Typography variant = "caption" color="text.secondary">{user.email}</Typography>
                                            </Box>
                                        </Box>

                                        <Chip label = {user.role} size = "small" sx ={{mb: 2, color: 'white', backgroundColor: (user.role === 'admin' ? '#d62828' : '#f77f00')}}/>


                                        {/*Admin-only controls*/}
                                        {isAdmin && user.email !== currentUser && (
                                            <Box sx = {{display: 'flex', flexDirection: 'column', gap: 1, mt:1}}>
                                                <Button size = "small" variant = "outlined" onClick = {() => changeUserRole(user.id, user.role)}>
                                                    {user.role === 'admin' ? "Change to User" : "Change to Admin"}
                                                </Button>
                                                <Button size = "small" variant = "contained" color = "error" onClick = {() => removeUser(user.id)}>
                                                    Remove User
                                                </Button>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {isAdmin && users.length > 0 && (
                    <Box sx = {{mt: 4, pt: 2, borderTop: '1px solid #eee'}}>
                        <Button startIcon={<DeleteForeverIcon/>} color = "error" onClick={deleteHousehold}>
                            Delete Entire Household
                        </Button>
                    </Box>
                )}
            </Paper>
            <Paper elevation = {2} sx = {{p:3, borderRadius: 2, bgcolor: "#fafafa"}}>
                <Box sx ={{display: 'flex', alignItems: 'center', mb: 3}}>
                    <SwapHorizIcon  sx = {{mr:1, color:'#f77f00'}}/>
                    <Typography variant="h6" fontWeight="600">Switch or Join Household</Typography>
                </Box>

                <Grid container spacing = {2} alignItems = "center">
                    <Grid item xs = {12} md = {4}>
                        <FormControl fullWidth size = "small" sx = {{minWidth: '300px'}}>
                            <InputLabel>Select Existing Household</InputLabel>
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
                    </Grid>

                    <Grid item xs = {12} md = {1} sx = {{textAlign: 'center'}}>
                        <Typography variant= 'h6'>OR</Typography>
                    </Grid>
                    <Grid item xs = {12} md = {4}>
                        <TextField fullWidth size = "small" label = "Create New Household" variant = "outlined" value = {name} sx = {{minWidth: '300px'}}
                            onChange={(e) => {
                                setName(e.target.value)
                                setSelected("")
                            }}/>
                    </Grid>
                    <Grid item xs = {12} md = {3}>
                        <Button onClick={handleSwitchHousehold} fullWidth variant = "contained"   sx= {{py: 1.5, fontSize: '1.1rem', fontWeight: 600, backgroundColor:  '#f77f00', color: 'white'}} disabled={!selected && !name}>
                            Change Household
                        </Button>
                    </Grid>     
                </Grid>
            </Paper>
            <Snackbar open = {snackbar.open} autoHideDuration={4000} onClose={()=> setSnackbar({...snackbar, openn: false})}>
                <Alert severity = {snackbar.severity} sx = {{width: "100%"}}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
        
       
    )
}

export default ViewHousehold
