import { app } from "./app";
import {config} from 'dotenv'

// load env variables
config()

const port = process.env.PORT
const server = app.listen(port, ()=>{
    console.log('server listening', `http://localhost:${port}`)
})