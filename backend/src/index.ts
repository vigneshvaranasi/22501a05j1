import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
dotenv.config()

const app = express()

app.use(express.json())

import accessTokenRoute from './routes/auth'
app.use('/auth', accessTokenRoute)

import shortURLs from './routes/urlsShort'
app.use('/shorturls', shortURLs)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello')
})

app.listen(5000, () => {
  console.log('Server Running at http://localhost:5000')
})
