# CSE264 Final Project
## Project Overview
### MealMate
A meal planning site that allows you to plan meals for yourself and your household. This site allows you to find and add recipes along with adding recipes to the different days of the week. This will also create your grocery list for the household to allow for quicker planning

## Team Members & Roles
### Joshua Bower
Role: Authentication and External API
### Katrina Bui
Role: Database Development and Internal API
### Olivia Newman
Role: Frontend developer and UX/UI


## Application Features
 * Users Accounts and Roles
   * can sign in and join households
   * the admin of the household is able to view all users in their household and remove users

 * Databases
   * Stores User Information and Tracks Meals
   * Retrieves Recipes

 * Interactive UI
   * Users login/register form for users and households
   * Users are able to click and drag recipes once it's been added to the calendar
   * Users are able to save from theMealdb and add their own
   * Users can add recipes to the week
 
 * New Library/Framework
   * FullCalendar

 * Internal REST API
   * GroceryList
   * Households
   * SavedRecipes
   * UserInformation
   * WeekRecipes

 * Extrnal REST API
   * MealDB - holds recipes and ingredients


## Installation & Setup Instructions (How to install, run, and configure the application)
#### Client
The client for this project uses React + Vite template which provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

You must have node.js running on your machine. Once you have cloned this project you can run `npm install` to install all the packages for this project. Then running `npm run dev` will run the dev version of this code, which will run this project on localhost:5173 (or at the location specified in the console).
 * react-router-dom
 * react-dom
 * react
 * jwt-decode
 * he
 * @react-oauth/google
 * @mui/material
 * @mui/icons-material
 * @mui/x-date-pickers
 * dayjs
 * @fullcalendar/react
 * @fullcalendar/interaction
 * @fullcalendar/daygrid
 * @fullcalendar/core
 * @emotion/styled
 * @emotion/react

#### Server
You must have node.js running on your machine. Once you have cloned this project you can run `npm install` to install all the packages for this project. Then running `npm run dev` will run the dev version of this code, which will run this project with nodemon. Nodemon auto-restarts the node server every time you make a change to a file. This is very helpful when you are writing and testing code.
 *  @react-oath/google
 *  cors
 *  dotenv
 *  express
 *  google-auth-library
 *  jswebtoken
 *  nodemon
 *  pg

## API Keys & Database Setup (What environment variables or external configurations are needed)
* For the Google Authenticator to work, you need to provide the server side with Google Client ID
* To connect to the Supabase database, the postgres information will need to be provided. (user, password, host, port, and dbname)
