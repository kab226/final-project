//Using React Router to manage the pages and navigation
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
import MealMateLogo from './FullLogo.png'

//page header 
const NavHeader = () => {
  //Pulls in the current household so you can clearly see household you're in
  const [householdName, setHouseholdName] = useState(localStorage.getItem("household_name") || "")
  const householdId = localStorage.getItem("household_id")
  const location = useLocation()

  useEffect(() => {
    const storedName = localStorage.getItem("household_name")

    if(storedName){
      setHouseholdName(storedName)
    }else if (householdId){
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

//protect the routes that need authentication from being accessed - outlet is child route
const ProtectedLayout = () => {
  return(
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
        <Route path = "/" element = {<Login />} />

        {/*Protecting this page*/}
        <Route element = {<ProtectedLayout/>}>
        {/*Add route on nav bar to go to view household - users can view, admin can edit the page*/}
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
