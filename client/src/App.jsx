//Using React Router to manage the pages and navigation
import {useState, useEffect} from 'react'
import {BrowserRouter as Router, Routes, Route, Link, Outlet} from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from './components/ProtectedRoute'
import GroceryList from './pages/GroceryList'
import HouseholdSetup from './pages/HouseholdSetup'
import HouseholdAdminPage from './pages/Admin'

import MealMateLogo from './FullLogo.png'

//page header 
const NavHeader = () => {
  return(
    <header className = "site-header">
        <img src={MealMateLogo} alt = "MealMate Logo" className = "app-logo" />
        <nav className = "header-nav">
          <Link to = "/dashboard" className = "nav-link">Dashboard</Link>
          <Link to = "/grocery-list" className = "nav-link">Grocery List</Link>
          <Link to="/household" className = "nav-link">Change Household</Link>
          <Link to="/household-admin" className = "nav-link">View Household</Link>
        </nav>
    </header>
  )
}

//protect the routes that need authentication from being accessed - outlet is child route
const ProtectedLayout = () => {
  return(
    <ProtectedRoute>
      
      <div className="content">
        <Outlet/>
      </div>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <Router>
      <NavHeader />
      <Routes>
        <Route path = "/" element = {<Login />} />

        {/*Protecting this page*/}
        <Route element = {<ProtectedLayout/>}>
        {/*Add route on nav bar to go to view household - users can view, admin can edit the page*/}
            <Route path = "/household" element = {<HouseholdSetup/>}/>
            <Route path = "/dashboard" element = {<Dashboard/>}/>
            <Route path = "/grocery-list" element = {<GroceryList/>}/>
            <Route path = "/household-admin" element = {<HouseholdAdminPage/>}/>
        </Route>
      </Routes>
    </Router>
  )
   
}

export default App;
