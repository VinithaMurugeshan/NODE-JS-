import express , {Request , Response} from 'express';
import  router from './src/routes/route'
const app = express()
app.use(express.json())

app.use('/api',router)

app.listen(8080 , () => {
    console.log('Server started on port 8080 ');
    
})