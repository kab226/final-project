import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

import { query } from './db/postgres.js';

// create the app
const app = express()
// it's nice to set the port number so it's always the same
app.set('port', process.env.PORT || 3000);
// set up some middleware to handle processing body requests
app.use(express.json())
// set up some midlleware to handle cors
app.use(cors())

//auth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)


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
        const result = await query(
            "SELECT * FROM UserInformation where google_id = $1", [googleId]
        )

        let user = result.rows[0]

        //insert user if it doesn't exist
        if(!user){
            const insert = await query(
                "INSERT into UserInformation (google_id, email, name) values ($1, $2, $3) RETURNING *", [googleId, email, name]
            )

            user = insert.rows[0]
        }

        //built the JWT token , expires in 7 days
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,{
                expiresIn: "7d"
            }
        )

        res.json({token})
    }catch(error){
        console.error("Google login error:", error)
    }

})


//GroceryList
//gets all the grocerylist in database
app.get('/grocery-list', (_req, res) =>{
    try{
        const qs = `SELECT * from GroceryList`
        query(qs).then(data => {res.json(data.rows)})

    }catch(err){
        console.log(err)
    }
})
//adds a new ingredient to database
app.post('/grocery-list', (req, res) => {
    try {
        let body = req.body
        let qs =`INSERT into GroceryList (ingredient, amount, recipe, household_id) values ('${body.ingredient}', '${body.amount}', '${body.recipe}', ${body.househouse_id})`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    } catch (error) {
        res.send('error', err)
    }
})
//updates an entry in the database based on the req body
app.put('/grocery-list/:id', (req,res) => {
    try{
        const id = req.params.id
        const body = req.body
        let qs = `UPDATE GroceryList SET ingredient = '${body.ingredient}', amount = '${body.amount}', recipe = '${body.recipe}' where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    }catch (errr){
        res.send('error', errr)
    }
})
//deletes an entry based on the id
app.delete('/grocery-list/:id', (req, res) => {
    try{
        const id = req.params.id
        const qs = `DELETE from GroceryList where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row deleted`))
    }catch(err){
        res.send('error', err)
    }
})

//SavedRecipes Table
//gets all the saved recipes in database
app.get('/saved-recipes', (_req, res) =>{
    try{
        const qs = `SELECT * from SavedRecipes`
        query(qs).then(data => {res.json(data.rows)})

    }catch(err){
        console.log(err)
    }
})
//adds a new recipe to database
app.post('/saved-recipes', (req, res) => {
    try {
        let body = req.body
        let qs =`INSERT into SavedRecipes (recipe, ingredients, notes, saved_by) values ('${body.recipe}', '${body.ingredients}', '${body.notes}', ${body.saved_by})`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    } catch (error) {
        res.send('error', err)
    }
})
//updates an entry in the database based on the req body
app.put('/saved-recipes/:id', (req,res) => {
    try{
        const id = req.params.id
        const body = req.body
        let qs = `UPDATE SavedRecipes SET recipe = '${body.recipe}', ingredients = '${body.ingredients}', notes = '${body.notes}' where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    }catch (errr){
        res.send('error', errr)
    }
})
//deletes an entry based on the id
app.delete('/saved-recipes/:id', (req, res) => {
    try{
        const id = req.params.id
        const qs = `DELETE from SavedRecipes where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row deleted`))
    }catch(err){
        res.send('error', err)
    }
})


//UserInformation
//gets all the users in database
app.get('/users', (_req, res) =>{
    try{
        const qs = `SELECT * from UserInformation`
        query(qs).then(data => {res.json(data.rows)})

    }catch(err){
        console.log(err)
    }
})
//adds a new user to database
app.post('/users', (req, res) => {
    try {
        let body = req.body
        let qs =`INSERT into UserInformation (user, password, household_id, role) values ('${body.user}', '${body.password}', ${body.household_id}, '${body.role}')`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    } catch (error) {
        res.send('error', err)
    }
})
//updates an entry in the database based on the req body
app.put('/users/:id', (req,res) => {
    try{
        const id = req.params.id
        const body = req.body
        let qs = `UPDATE UserInformation SET user = '${body.user}', password = '${body.password}', household_id = ${body.household_id}, role = '${body.role}' where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    }catch (errr){
        res.send('error', errr)
    }
})
//deletes an entry based on the id
app.delete('/users/:id', (req, res) => {
    try{
        const id = req.params.id
        const qs = `DELETE from UserInformation where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row deleted`))
    }catch(err){
        res.send('error', err)
    }
})


//weeklyRecipes
//gets all the recipes for the week in database
app.get('/week-recipes', (_req, res) =>{
    try{
        const qs = `SELECT * from WeekRecipes`
        query(qs).then(data => {res.json(data.rows)})

    }catch(err){
        console.log(err)
    }
})

//adds a new recipe to database
app.post('/week-recipes', (req, res) => {
    try {
        let body = req.body
        let qs =`INSERT into WeekRecipes (recipe, ingredients, day, household_id) values ('${body.recipe}', '${body.ingredients}', '${body.day}', ${household_id})`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    } catch (error) {
        res.send('error', err)
    }
})

//updates an entry in the database based on the req body
app.put('/week-recipes/:id', (req,res) => {
    try{
        const id = req.params.id
        const body = req.body
        let qs = `UPDATE WeekRecipes SET recipe = '${body.recipe}', ingredients = '${body.ingredients}', day = '${body.day}' where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    }catch (errr){
        res.send('error', errr)
    }
})
//deletes an entry based on the id
app.delete('/week-recipes/:id', (req, res) => {
    try{
        const id = req.params.id
        const qs = `DELETE from WeekRecipes where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row deleted`))
    }catch(err){
        res.send('error', err)
    }
})


//Households
//gets all the households in database
app.get('/households', (_req, res) =>{
    try{
        const qs = `SELECT * from Households`
        query(qs).then(data => {res.json(data.rows)})

    }catch(err){
        console.log(err)
    }
})
//adds a new household to database
app.post('/households', (req, res) => {
    try {
        let body = req.body
        let qs =`INSERT into households (household_name) values ('${household_name}')`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    } catch (error) {
        res.send('error', err)
    }
})
//updates an entry in the database based on the req body
app.put('/households/:id', (req,res) => {
    try{
        const id = req.params.id
        const body = req.body
        let qs = `UPDATE households SET household_name = '${body.household_name}' where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row updated`))
    }catch (errr){
        res.send('error', errr)
    }
})
//deletes an entry based on the id
app.delete('/households/:id', (req, res) => {
    try{
        const id = req.params.id
        const qs = `DELETE from Households where id = ${id}`
        query(qs).then(data => res.send(`${data.rowCount} row deleted`))
    }catch(err){
        res.send('error', err)
    }
})

app.listen(app.get('port'), () => {
    console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
  });
  