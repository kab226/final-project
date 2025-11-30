import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
//import { jwtDecode } from "jwt-decode";
//I still dont think the decod should work without this package but in case it does work regardless I left it commented out
function Login(){
    const navigate = useNavigate()

    const handleSuccess = async (credentialResponse) => {
        try{
            // const idToken = credentialResponse.credential

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

            localStorage.setItem("x-user", data.email)
            localStorage.setItem("role", data.role)

            navigate("/household")
        }
        catch(err){
            console.error("Login error: ", err)
        }
    }

    return(
        <div
            style={{
                display:"flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "20px"
            }}
        >
            <img src = "./src/TextLogo.png"></img>
            <h1 style={{marginBottom: 2}}>Welcome to Meal Mate!</h1>
            <h2 style = {{marginTop: 2}}>Please login with Google</h2>

            <GoogleLogin onSuccess={handleSuccess}
            //The following is Josh's code - I made a function to handle some more of the backend stuff
            // onSuccess ={(credentialResponse) => {
            //     //will want to put this code on a longin page but is here for now
            //     //Go somewhere after loging in 
            //     //cedentialResponse holds user info 
            //     //json Object with user info 
            //     const userInfo = jwtDecode(credentialResponse.credential)
            //     console.log(userInfo)
            // }} 
            onError={() => console.log("Login failed")}/>
        </div>
    )
}

export default Login
