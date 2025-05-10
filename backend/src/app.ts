import express from 'express';
import morgan from 'morgan';
import cors from 'cors'
import cookieParser from 'cookie-parser'

import db from './db/config/db';
import userRouter from './routes/user.route'
import ArtistRouter from './routes/artist.routes'
import SongRouter from './routes/songs.routes'
import { server } from './server';
import { MailService } from './services/mail.services';
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



app.use("/api/user", userRouter)
app.use("/api/artists", ArtistRouter)
app.use("/api/song", SongRouter)



export {app}