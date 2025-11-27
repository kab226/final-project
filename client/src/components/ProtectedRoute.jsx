import {Navigate, Outlet} from "react-router-dom"
//this blocks access if not authenticated
function ProtectedRoute (){
    const authKey = localStorage.getItem("x-user")

    if (!authKey){
        return <Navigate to="/" replace />
    }

    return <Outlet />
}
export default ProtectedRoute