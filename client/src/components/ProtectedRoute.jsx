import {Navigate} from "react-router-dom"
//this blocks access if not authenticated
function ProtectedRoute ({children}){
    const authKey = localStorage.getItem("x-user")

    if (!authKey){
        return <Navigate to="/" replace />
    }

    return children
}
export default ProtectedRoute