import { Router } from "express";
import pool from '../datalayer/db'
const router = Router()
import jwt from 'jsonwebtoken'
import xlsx from 'xlsx'
import multer from "multer";

router.post('/register',async(req:any,res:any) => {
    try{
        const {username , password , email } = req.body
        if(!username || !password || !email ){
            return res.status(400).json({
                error : 'Please provide all data'
            })
        }
        else {
            try{
              const userregistration = await pool.query(`INSERT INTO users (username,password,email)Values ($1,$2,$3)`,[username,password,email])
              res.json({
                message : 'User Created successfully'
              })
            }
            catch (err) {
                console.log('error' , err);
                res.status(500).json({
                    error : 'Server error'
                })
                
            } 
        }
    }
    catch (err) {
        console.log('error' , err);
        res.status(500).json({
            error : 'Server error'
        })
        
    } 
})

router.post('/login',async(req:any,res:any) => {
    try{
        const {username , password } = req.body
        if(!username || !password  ){
            return res.status(400).json({
                error : 'Please provide all data'
            })
        }
        else {
            try{
              const login = await pool.query(`SELECT * FROM users Where username = $1`,[username])
              const user = login.rows[0]

              if(!user || (!await user.comparePassword(password))){
                return res.status(401).json({
                    error : 'Invalid password'
                }) 
              }
              else {
                const token = jwt.sign({userId : user.id} , 'LCCCCLP',{expiresIn : '1h'})
                res.json({token})
              }
            }
            catch (err) {
                console.log('error' , err);
                res.status(500).json({
                    error : 'Server error'
                })
                
            } 
        }
    }
    catch (err) {
        console.log('error' , err);
        res.status(500).json({
            error : 'Server error'
        })
        
    } 
})

const upload = multer({dest: 'src/uploads/'})
router.post('/upload',upload.single('file'),async(req:any,res:any) => {
    try{
        const file = req.file
        if(!file ){
            return res.status(400).json({
                error : 'Please provide file'
            })
        }
        else {
            try{
               const workbook = xlsx.readFile(file.path)
               const sheet = workbook.Sheets['Sheet1']
               const sheetName = workbook.SheetNames[0]

               const chatData = xlsx.utils.sheet_to_json(sheet)
               
               for(const chat of chatData){
                const {username , message , timeStamp}:any = chat
                if(username && message && timeStamp) {
                   await pool.query(`INSERT INTO chathistory (username , message , timeStamp) VALUES ($1,$2,$3)`,[username,message,new Date(timeStamp)])
                }
               }
               res.status(200).send('Chat history uploaded')
            }
            catch (err) {
                console.log('error' , err);
                res.status(500).json({
                    error : 'Server error'
                })
                
            } 
        }
    }
    catch (err) {
        console.log('error' , err);
        res.status(500).json({
            error : 'Server error'
        })
        
    } 
})

router.post('/chatfilter',async(req:any,res:any) => {
    try{
        const {status} = req.status
        let query = 'Select * from chathistory'
        let queryParams : any[] = []
        
        if(status === 'completed'){
            query += 'Where message Like $1'
            queryParams.push('%done%')
        }
        else if(status === 'pending'){
            query += 'Where message NOT Like $1'
            queryParams.push('%done%')
        }

        const result = await pool.query(query,queryParams)
        res.json(result.rows)
    }
    catch (err) {
        console.log('error' , err);
        res.status(500).json({
            error : 'Server error'
        })
        
    } 
})

export default router