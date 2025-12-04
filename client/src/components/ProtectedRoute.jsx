//ProtectedRoute component blocks access if not authenticated
import {Navigate} from "react-router-dom"

function ProtectedRoute ({children}){
    const authKey = localStorage.getItem("x-user")  //needs to be authenticated to proceed 

    //if not authenticated, then user is redirected to the root path (Login page), giving them the option to login
    //replace is there as a redirect, replacing the history 
    if (!authKey){
        return <Navigate to="/" replace />
    }
    //if authenticated, then ok to render child components (all of the protected pages)
    return children
}

export default ProtectedRoute