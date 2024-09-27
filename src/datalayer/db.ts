import { Pool } from "pg";

const pool = new Pool({
    host : 'localhost',
    port : 5432,
    database : 'NodeTask',
    password : 'MKV'

})

export default pool