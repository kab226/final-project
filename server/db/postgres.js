import pg from "pg"

const {Client} = pg

const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DBNAME,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    // //added this so hopefully we can still use pg
    // connectionString: process.env.SUPABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

client.connect()

//THis was a different way to connect but I didn't want to get rid of the pg and it would require rewriting all the CRUD
// import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = process.env.SUPABASE_URL
// const supabaseKey = process.env.SUPABASE_ANON_KEY
// const supabase = createClient(supabaseUrl, supabaseKey)


export const query = async (text, values) => {
    try{
        const now = new Date()
        console.log("query to be executed: ", text)
        const res = await client.query(text, values)
        const now2 = new Date()
        console.log(`it took ${now2-now} ms to run`)
        return res

    }catch(error){
        console.error("problem with q")
        console.error(error)
        throw error
    }
}


/**How to use
 * query(qs).then(data) => res.json(data.rows) 
 * */