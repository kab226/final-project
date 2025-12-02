import { useState, useEffect } from "react"
import { Typography, Grid, Card, CardContent, Button, Snackbar, Alert } from "@mui/material"
import { useNavigate } from "react-router-dom"

//if admin make it so they can remove recipes from the week?
function HouseholdAdminPage() {
    const [users, setUsers] = useState([])
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
    const navigate = useNavigate()

    const currentUser = localStorage.getItem("x-user")
    const currentUserRole = localStorage.getItem("role")


  // Load users in household (admin only)
    const loadUsers = async () => {
        try {
            const res = await fetch("http://localhost:3000/household/users", {
                method: "GET",
                headers: { 
                    'Content-Type': 'application/json',
                    "x-user": localStorage.getItem("x-user"),
                    "x-household": localStorage.getItem("household_id")}
            })
            if (res.status === 403) {
                setSnackbar({ open: true, message: "Not authorized", severity: "error" })
                setTimeout(() => navigate("/dashboard"), 1500)
                return
            }
        const data = await res.json()
        setUsers(data)
        } catch (err) {
            console.error(err)
            setSnackbar({ open: true, message: "Failed to load users", severity: "error" })
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    // Remove a user
    const removeUser = async (id) => {
        if (!window.confirm("Are you sure you want to remove this user?")) return

        try {
            const res = await fetch(`http://localhost:3000/household/users/${id}`, {
                method: "DELETE",
                headers: { 
                    'Content-Type': 'application/json',
                    "x-user": localStorage.getItem("x-user")
                },
            })

            if (!res.ok) throw new Error("Failed to remove user")

            setSnackbar({ open: true, message: "User removed successfully", severity: "success" })
            loadUsers()
        }catch (err){
            console.error(err)
            setSnackbar({ open: true, message: "Failed to remove user", severity: "error" })
        }
    }

    //finish this
    const changeUserRole = async (id, currentRole) => {
        //switches role
        const newRole = currentRole === "admin" ? "user" : "admin"
        try {
            const res = await fetch(`http://localhost:3000/users/${id}`, {
                method: "PUT",
                headers: { 
                    'Content-Type': 'application/json',
                    "x-user": localStorage.getItem("x-user")
                },
                body: JSON.stringify({role: newRole}),
            })
            if (!res.ok) throw new Error("Failed to change user role")

            setSnackbar({ open: true, message: "User role changed successfully", severity: "success" })
            loadUsers()
        }catch(err){

        }
    }

    return (
        <div style={{ padding: "20px" }}>
        <Typography variant="h4" sx={{ marginBottom: 3 }}>
            Household Dashboard
        </Typography>

        <Grid container spacing={2}>
            {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card>
                <CardContent>
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography variant="body2">Email: {user.email}</Typography>
                    <Typography variant="body2">Role: {user.role}</Typography>
                    {currentUserRole === "admin" && user.email !== currentUser && (
                    <div>
                        <Button color="error" variant="contained" sx={{ marginTop: 1 }} onClick={() => removeUser(user.id)}>
                            Remove User
                        </Button>
                        <Button color="primary" variant="contained" sx={{ marginTop: 1 }} onClick={() => changeUserRole(user.id, user.role)}>
                            Change Role
                        </Button>
                    </div>
                    )}
                    {user.email === currentUser && (
                    <Typography sx={{ marginTop: 1, fontStyle: "italic" }}>This is you</Typography>
                    )}
                </CardContent>
                </Card>
            </Grid>
            ))}
        </Grid>

        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
            <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
            </Alert>
        </Snackbar>
        </div>
    )
}

export default HouseholdAdminPage
