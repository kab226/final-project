/*MealMate - App.jsx
Imports - used useState and useEffect to manage the changing of the household name in the nav bar chip
Uses Chip and HomeIcon from MaterialUI to display the current household
Imported the various pages used for the project - App.jsx handles the routing between them
Using React Router to manage the pages and navigation  between them. 
*/
import {useState, useEffect} from 'react'
import {BrowserRouter as Router, Routes, Route, Link, Outlet, useLocation} from "react-router-dom"
import{Chip} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from './components/ProtectedRoute'
import GroceryList from './pages/GroceryList'
import HouseholdSetup from './pages/HouseholdSetup'
import ViewHousehold from './pages/ViewHousehold'
//Customized a logo in Canva for use during the project
import MealMateLogo from './FullLogo.png'

//Page header that is shown on all pages except the initial Login page 
const NavHeader = () => {
  //Pulls in the current household so you can clearly see household you're in
  //Household name and ID were stored in localStorage upon logging in and joining household for easy access
  const [householdName, setHouseholdName] = useState(localStorage.getItem("household_name") || "")
  const householdId = localStorage.getItem("household_id")

  //useLocation hook was used to detect changes in url when pages were switched
  const location = useLocation()

  useEffect(() => {
    const storedName = localStorage.getItem("household_name")

    if(storedName){
      setHouseholdName(storedName)
    }else if (householdId){  //fetched the household name from the Households table by finding a match based on the household id
      //in theory could've just made this a route but decided to roll with this method instead 
      fetch(`http://localhost:3000/households`,{
        headers:{ 'x-user': localStorage.getItem('x-user')}
      }).then(res => res.json())
      .then(data => {
        const match = data.find(h => h.household_id.toString() === householdId.toString())
        if(match){
          setHouseholdName(match.household_name)
          localStorage.setItem("household_name", match.household_name)
        }
      }).catch(err => console.error("Failed to fetch household name", err))
    }
  }, [householdId, location])


  return(
    <header>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <img src={MealMateLogo} alt = "MealMate Logo" className = "app-logo" />
        </div>
        <div style = {{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <nav className = "header-nav">
            <Link to = "/dashboard" className = "nav-link">Dashboard</Link>
            <Link to = "/grocery-list" className = "nav-link">Grocery List</Link>
            <Link to="/household-view" className = "nav-link">View Household</Link>
          </nav> 
          {householdName && (
            <Chip icon = {<HomeIcon style = {{color: '#fcbf49'}}/>} label = {householdName}
            variant = "outlined" sx = {{borderColor: '#f77f00', color: '#fcbf49', fontWeight: 'bold', fontSize: '1.2rem', height: '45px', padding: '2px'}}/>
          )}
        </div>        
    </header>
  )
}

//Protect the routes that need authentication from being accessed - Outlet is placeholder for child routes, shows where to render them
const ProtectedLayout = () => {
  return(
    //ProtectedRoute component verifies user is authenticated
    <ProtectedRoute>
      <NavHeader/>
      <div className="content">
        <Outlet/>
      </div>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/*Anyone can access the login page */}
        <Route path = "/" element = {<Login />} />
        {/*Protecting these pages, they all get the nav bar as well*/}
        <Route element = {<ProtectedLayout/>}>
            <Route path = "/household" element = {<HouseholdSetup/>}/>
            <Route path = "/dashboard" element = {<Dashboard/>}/>
            <Route path = "/grocery-list" element = {<GroceryList/>}/>
            <Route path = "/household-view" element = {<ViewHousehold/>}/>
        </Route>
      </Routes>
    </Router>
  )
   
}

export default App;
