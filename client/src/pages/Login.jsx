/*Login page - accessible to all
Used GoogleLogin for the authentication portion of the project instead of hashing/salting a user's password
Used MateiralUI components and icons for styling
*/

import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import {Grid, Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText} from '@mui/material'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
//Created text logo in Canva for use on the login page
import TextLogo from "./TextLogo.png"



function Login(){
    const navigate = useNavigate()
    //Function to handle a successful login 
    const handleSuccess = async (credentialResponse) => {
        try{
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
            //sets localStorage with the user's email (for use in accessing routes), role (for accessing admin-only sections)
            localStorage.setItem("x-user", data.email)
            localStorage.setItem("role", data.role)

            //If the user is a returning user and has a household already, localStorage gets set with their household name and id 
            if(data.household_name){
                localStorage.setItem("household_name", data.household_name)
                localStorage.setItem("household_id", data.household)
            }else{
                //Otherwise, clears out localStorage
                localStorage.removeItem("household_name")
                localStorage.removeItem("household_id")
            }

            //navigates to dashboard if returning user and household already selected
            if(data.household !== null){
                navigate("/dashboard")
            }else{
                //otherwise, get redirected to the household selection page
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
                    {/*Left column of Login page has icons and features of MealMate*/}
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
                                {/*Made a helper function to handle the formatting of the features  */}
                                <FeatureItem icon = {<CheckCircleOutlineIcon fontSize= "large"/> } text = "Plan your weekly meals with ease"/>
                                <FeatureItem icon = {<ShoppingCartIcon fontSize= "large"/>} text = "Automated grocery lists from recipes"/>
                                <FeatureItem icon = {<PeopleIcon fontSize= "large"/>} text ="Collaborate with your household"/>
                            </List>
                        </Box>
                    </Grid>

                    {/*Right column has the logo and Google login action */}
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

//helper function for the feature list on the left column - formats as a list item
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
