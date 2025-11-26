// import pg from "pg"

// const {Client} = pg

// const client = new Client({
//     host: process.env.POSTGRES_HOST,
//     port: Number(process.env.POSTGRES_PORT),
//     database: process.env.POSTGRES_DBNAME,
//     user: process.env.POSTGRES_USER,
//     password: process.env.POSTGRES_PASSWORD,
//     ssl: {
//         rejectUnauthorized: false
//     }
// })

// client.connect()


import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

supabase.connect()

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