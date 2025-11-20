import {useState, useEffect} from 'react'
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
function App() {
  const [apiStatus, setAPIStatus] = useState()

  useEffect(() => {
    fetch('http://localhost:3000/up')
    .then(res => res.json())
    .then(result => {
      console.log(result.status)
      setAPIStatus(result)
  })
  }, [])

  
  
  return (
    <div>
      <GoogleLogin 
      onSuccess ={(credentialResponse) => {
        //will want to put this code on a longin page but is here for now
        //Go somewhere after loging in 
        //cedentialResponse holds user info 
        //json Object with user info 
        console.log(jwtDecode(credentialResponse.credential))
      }} 
      onError={() => console.log("Login failed")}/>

      <h1>To get started, begin editing SRC/App.js</h1>
      {apiStatus ? <h2>Testing app end point: <div style={{color: apiStatus.status === 'up' ? 'green':'red'}}>{apiStatus.status}</div></h2>:null }
    </div>
  )
   
}

export default App;
