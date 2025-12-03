import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import {Grid, Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText} from '@mui/material'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'


import TextLogo from "./TextLogo.png"

function Login(){
    const navigate = useNavigate()

    const handleSuccess = async (credentialResponse) => {
        try{
            // const idToken = credentialResponse.credential

            const res = await fetch("http://localhost:3000/auth/google", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({idToken: credentialResponse.credential,})
            })


            if(!res.ok){
                throw new Error("Backend login failed")
            }

            const data = await res.json()
            console.log(data)

            localStorage.setItem("x-user", data.email)
            localStorage.setItem("role", data.role)
            localStorage.setItem("household_id", data.household)

            //navigates to dashboard if household already selected
            if(data.household !== null){
                navigate("/dashboard")
            }else{
                navigate("/household")
            }
            
        }
        catch(err){
            console.error("Login error: ", err)
        }
    }

    return(
        <Box sx = {{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f7f7ff'}}>
            <Paper elevation={4} sx = {{width: '100%', maxWidth: '1150px', height: 600, borderRadius: 3, display: "flex", flexDirection: "column"}}>
                <Grid container sx = {{height: '100%'}}>
                    {/*Left column of Login page has features of MealMate*/}
                    <Grid item xs = {12} md = {6} sx ={{background: 'linear-gradient(135deg, #d62828 0%, #f77f00 100%)', color: "white", display:"flex",
                        flexDirection: 'column', justifyContent: 'center', padding:6
                    }}>
                        <Box>
                            <Box sx = {{display: 'flex', alignItems: 'center', gap:2, mb: 1}}>
                                <RestaurantMenuIcon sx = {{fontSize: 45}}/>
                                <Typography variant = "h3" fontWeight="700" color = "white">Welcome to Meal Mate!</Typography>
                            </Box>

                            <Typography variant = "h6" color = "white" sx = {{mb: 6, ml:15, fontWeight: 300, opacity: 0.9}}>
                                Simplify your kitchen. Organize your life.
                            </Typography>

                            <List sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <FeatureItem icon = {<CheckCircleOutlineIcon fontSize= "large"/> } text = "Plan your weekly meals with ease"/>
                                <FeatureItem icon = {<ShoppingCartIcon fontSize= "large"/>} text = "Automated grocery lists from recipes"/>
                                <FeatureItem icon = {<PeopleIcon fontSize= "large"/>} text ="Collaborate with your household"/>
                            </List>
                        </Box>
                    </Grid>
                    {/*Right column has the login action */}
                    <Grid item xs ={12} md ={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' , backgroundColor: 'white', padding: 4}}>
                        <Box sx = {{width: '100%', maxWidth: 350,  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
                            <img src={TextLogo} alt = "Meal Mate" style = {{height: 100, marginBottom: 50}}/>
                            <Typography variant = "h4" fontWeight="bold" gutterBottom sx = {{color: "#f77f00"}}>
                                Welcome Back
                            </Typography>
                            <Typography variant = "h6" color = "text.secondary" sx = {{mb:5}}>
                                Please sign in with Google to access your meal plans.
                            </Typography>
                            <Box sx = {{display: 'flex', justifyContent: 'center', width: '100%', transform: 'scale(1.5)'}}>
                                <GoogleLogin onSuccess={handleSuccess} onError = {() => console.log("Login failed")} theme = "filled_orange" shape = "pill" size = "large"/>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    )
}
//helper component for the feature list on the left column
function FeatureItem({icon, text}){
    return(
        <ListItem disablePadding>
            <ListItemIcon sx={{color: 'white', minWidth: 50}}>
                {icon}
            </ListItemIcon>
            <ListItemText primary = {<Typography variant = "h6" fontWeight="500" sx = {{fontSize: '1.4rem', color: 'white'}}> {text} </Typography>} />
        </ListItem>
    )
}
export default Login
