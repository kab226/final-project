import {useState, useEffect} from 'react'

//Using React Router to manage the pages and navigation
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from './components/ProtectedRoute'
import HouseholdSetup from './pages/HouseholdSetup'

function App() {
  // const [apiStatus, setAPIStatus] = useState()

  // useEffect(() => {
  //   fetch('http://localhost:3000/up')
  //   .then(res => res.json())
  //   .then(result => {
  //     console.log(result.status)
  //     setAPIStatus(result)
  // })
  // }, [])

  
  return (
    <Router>
      <Routes>
        <Route path = "/" element = {<Login />} />

        {/*Protecting this page*/}
        <Route element = {<ProtectedRoute/>}>
            <Route path = "/household" element = {<HouseholdSetup/>}/>
            <Route path = "/dashboard" element = {<Dashboard/>}/>
        </Route>
        
      </Routes>
    </Router>


 

    //   <h1>To get started, begin editing SRC/App.js</h1>
    //   {apiStatus ? <h2>Testing app end point: <div style={{color: apiStatus.status === 'up' ? 'green':'red'}}>{apiStatus.status}</div></h2>:null }
    // </div>
  )
   
}

export default App;
