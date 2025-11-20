import {Navigate} from "react-router-dom"
//this blocks access if not authenticated
function ProtectedRoute ({children}){
    const token = localStorage.getItem("token")

    if (!token){
        return <Navigate to="/" replace />
    }

    return children
}
export default ProtectedRoute