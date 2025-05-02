import express from 'express';
import morgan from 'morgan';
import cors from 'cors'
import cookieParser from 'cookie-parser'

import db from './db/config/db';
import userRouter from './routes/user.route'

const app = express()

app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())

const corsCongig = {
    origin: [
      'http://localhost:3000'
    ],
    credentials: true,
  };


app.use(cors(corsCongig));

(async()=>{

await db.createDatabase('artist-manager');
await db.useDatabase('artist-manager')
await db.initializeTables();

})();



app.use("/api/user", userRouter)




export {app}