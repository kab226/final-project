import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { OAuth2Client } from 'google-auth-library'
import { query } from './db/postgres.js';

// create the app
const app = express()
// it's nice to set the port number so it's always the same
app.set('port', process.env.PORT || 3000);
// set up some middleware to handle processing body requests
app.use(express.json())
// set up some midlleware to handle cors - added some to fix jwt issues
app.use(cors())


//auth client 
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

//Put approved admin emails here 
const approvedAdmins = []


//Table names are now in quotes because I think they need to be either in quotes or lowercase

//middleware similar to class 
async function requireUser(req, res, next){
    try{
        const email = req.headers['x-user']

        if(!email){
            return res.status(401).json({error:"Not Authenticated"})
        }

        const result = await query(`SELECT * FROM 'UserInformation" WHERE email = $1`, [email])
        
        if (result.rows.length ===0){
            return res.status(401).json({error:"Not Authenticated"})
        }

        req.user = result.rows[0]
        next()
    }catch(err){
        console.error(err)
        res.status(500).json({error: "Server error"})
    }
}


function requireAdmin(req, res, next){
    if(!req.user || req.user.role !== "admin"){
        return res.status(403).json({error:"Forbidden"})
    }
    next()
}



// base route
app.get('/', (_req, res) => {
    res.send("Welcome to MealMate!!! Your personal meal planner for yourself or a household")
})


app.get('/up', (_req, res) => {
  res.json({status: 'up'})
})

//Authentication with Google routes
//Need to update UserInformation table to have id (autogenerates), google_id, email, name 
app.post("/auth/google", async(req, res) => {
    try{
        const {idToken} = req.body 

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        
        const payload = ticket.getPayload()

        const googleId = payload.sub
        const email = payload.email
        const name = payload.name


        //check if user exists
        const existingUser = await query(
            `SELECT * FROM "UserInformation" where email = $1`, [email]
        )

        let user = existingUser.rows[0]

        //insert user if it doesn't exist
        if(!user){
            const role = approvedAdmins.includes(email) ? "admin" : "user"

            const insert = await query(
                `INSERT into "UserInformation" (name, google_id, email, household_id, role) values ($1, $2, $3, NULL, $4) RETURNING *`, [name, googleId, email, role]
            )

            user = insert.rows[0]
        }

        const addAdmin = approvedAdmins.includes(email)

        if (user.role !== "admin" && addAdmin){
            const update = await query(
                `UPDATE "UserInformation" SET role = 'admin' WHERE email = $1 RETURNING *`, [email]
            )

            user = update.rows[0]
        }

        res.json({
            email: user.email,
            role: user.role
        })

    }catch(error){
        console.error("Google login error:", error)
        res.status(400).json({error: "Invalid Google token"})
    }

})


//GroceryList
//gets all the grocerylist in database
app.get('/grocery-list', requireUser, (req, res) =>{
    try{
        let householdID = req.user.household_id
        const qs = `SELECT * from "GroceryList" where household_id = ${householdID}`
        query(qs).then(data => {res.json(data.rows)})

    }catch(err){
        console.log(err)
    }
})
//adds a new ingredient to database
app.post('/grocery-list', requireUser, (req, res) => {
    try {
        let body = req.body
        let qs =`INSERT into "GroceryList" (ingredient, amount, recipe, household_id) values ('${body.ingredient}', '${body.amount}', '${body.recipe}', ${body.household_id})`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    } catch (error) {
        res.send('error', err)
    }
})
//updates an entry in the database based on the req body
app.put('/grocery-list/:id', requireUser, (req,res) => {
    try{
        const id = req.params.id
        const body = req.body
        let qs = `UPDATE "GroceryList" SET ingredient = '${body.ingredient}', amount = '${body.amount}', recipe = '${body.recipe}' where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    }catch (errr){
        res.send('error', errr)
    }
})
//deletes an entry based on the id
app.delete('/grocery-list/:id', requireUser, (req, res) => {
    try{
        const id = req.params.id
        const qs = `DELETE from "GroceryList" where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row deleted`))
    }catch(err){
        res.send('error', err)
    }
})

//SavedRecipes Table
//gets all the saved recipes in database
app.get('/saved-recipes', requireUser, (req, res) =>{
    try{
        let id = req.user.id //fixed this to link it by user id
        const qs = `SELECT * from "SavedRecipes" where saved_by = ${id}`
        query(qs).then(data => {res.json(data.rows)})

    }catch(err){
        console.log(err)
    }
})
//adds a new recipe to database
app.post('/saved-recipes',requireUser, (req, res) => {
    try {
        let body = req.body
        let qs =`INSERT into "SavedRecipes" (recipe, ingredients, notes, saved_by) values ('${body.recipe}', '${body.ingredients}', '${body.notes}', ${body.saved_by})`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    } catch (error) {
        res.send('error', err)
    }
})
//updates an entry in the database based on the req body
app.put('/saved-recipes/:id', requireUser, (req,res) => {
    try{
        const id = req.params.id
        const body = req.body
        let qs = `UPDATE "SavedRecipes" SET recipe = '${body.recipe}', ingredients = '${body.ingredients}', notes = '${body.notes}' where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    }catch (errr){
        res.send('error', errr)
    }
})
//deletes an entry based on the id
app.delete('/saved-recipes/:id', requireUser, (req, res) => {
    try{
        const id = req.params.id
        const qs = `DELETE from "SavedRecipes" where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row deleted`))
    }catch(err){
        res.send('error', err)
    }
})


//UserInformation
//gets all the users in database
app.get('/users', requireAdmin, (_req, res) =>{
    try{
        const qs = `SELECT * from "UserInformation"`
        query(qs).then(data => {res.json(data.rows)})

    }catch(err){
        console.log(err)
    }
})
//adds a new user to database
app.post('/users', requireAdmin, (req, res) => {
    try {
        let body = req.body
        let qs =`INSERT into "UserInformation" (name, google_id, email, household_id, role) values ('${body.name}', '${body.google_id}', '${body.email}', ${body.household_id}, '${body.role}')`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    } catch (error) {
        res.send('error', err)
    }
})
//updates an entry in the database based on the req body
app.put('/users/:id', requireAdmin, (req,res) => {
    try{
        const id = req.params.id
        const body = req.body
        let qs = `UPDATE "UserInformation" SET name = '${body.name}', google_id = '${body.google_id}', email= '${body.email}', household_id = ${body.household_id}, role = '${body.role}' where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    }catch (errr){
        res.send('error', errr)
    }
})
//deletes an entry based on the id
app.delete('/users/:id', requireAdmin, (req, res) => {
    try{
        const id = req.params.id
        const qs = `DELETE from "UserInformation" where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row deleted`))
    }catch(err){
        res.send('error', err)
    }
})


//weeklyRecipes
//gets all the recipes for the week in database
app.get('/week-recipes', requireUser, (req, res) =>{
    try{
        const householdID = req.user.household_id
        const qs = `SELECT * from "WeekRecipes" where household_id = ${householdID}`
        query(qs).then(data => {res.json(data.rows)})

    }catch(err){
        console.log(err)
    }
})

//adds a new recipe to database
app.post('/week-recipes', requireUser, (req, res) => {
    try {
        let body = req.body
        let qs =`INSERT into "WeekRecipes" (recipe, ingredients, day, household_id) values ('${body.recipe}', '${body.ingredients}', '${body.day}', ${body.household_id})`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    } catch (error) {
        res.send('error', err)
    }
})

//updates an entry in the database based on the req body
app.put('/week-recipes/:id', requireUser, (req,res) => {
    try{
        const id = req.params.id
        const body = req.body
        let qs = `UPDATE "WeekRecipes" SET recipe = '${body.recipe}', ingredients = '${body.ingredients}', day = '${body.day}' where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    }catch (errr){
        res.send('error', errr)
    }
})
//deletes an entry based on the id
app.delete('/week-recipes/:id', requireUser,  (req, res) => {
    try{
        const id = req.params.id
        const qs = `DELETE from "WeekRecipes" where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row deleted`))
    }catch(err){
        res.send('error', err)
    }
})


//Households
//gets all the households in database
app.get('/households', requireUser, (_req, res) =>{
    try{
        const qs = `SELECT * from "Households"`
        query(qs).then(data => {res.json(data.rows)})

    }catch(err){
        console.log(err)
    }
})
//adds a new household to database
app.post('/households', requireUser, (req, res) => {
    try {
        let body = req.body
        let qs =`INSERT into "Households" (household_name) values ('${body.household_name}')`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    } catch (error) {
        res.send('error', err)
    }
})
//updates an entry in the database based on the req body
app.put('/households/:id', requireUser, (req,res) => {
    try{
        const id = req.params.id
        const body = req.body
        let qs = `UPDATE "Households" SET household_name = '${body.household_name}' where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    }catch (errr){
        res.send('error', errr)
    }
})
//deletes an entry based on the id
app.delete('/households/:id', requireUser, (req, res) => {
    try{
        const id = req.params.id
        const qs = `DELETE from "Households" where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row deleted`))
    }catch(err){
        res.send('error', err)
    }
})

app.post('/households/join', requireUser, (req, res) => {
    const {household_name} = req.body
    try{
        //check if household exists
        const qs = `SELECT household_id FROM "Households" WHERE household_name =  $1`
        query(qs, [household_name]).then(data => {
            let householdID

            if (data.rows.length === 0){
                const createQS = `INSERT into "Households" (household_name) VALUES ($1) RETURNING household_id`
                query(createQS, [household_name]).then(data => {
                    householdID = data.rows[0].household_id

                    const updateQS = `UPDATE "UserInformation" set household_id = $1 WHERE id = $2`
                    query(updateQS, [householdID, req.user.id])

                    res.json({joined: true, household_id: householdID})
                })
            }else{
                //household already exists
                householdID = data.rows[0].household_id

                const updateQS = `UPDATE "UserInformation" set household_id = $1 WHERE id = $2`

                query(updateQS, [householdID, req.user.id])

                res.json({joined: true, household_id: householdID})
            }

        })
    } catch(err){
        console.error(err)
        res.status(500).json({error: "Server error joining household"})
    }
})


app.listen(app.get('port'), () => {
    console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
  });
  