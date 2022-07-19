const express = require('express')
const connection = require('../connection')
const router = express.Router();
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
require('dotenv').config()
var auth = require('../services/authentication')
var checkRole = require('../services/checkRole')


router.post('/signup', (req,res)=>{
    let user = req.body;
    query = 'select email,password,role,status from user where email=?'
    connection.query(query,[user.email], (err,results)=>{
        if(!err){
            if(results.length <= 0){
              query = "insert into user(name,contactName,email,password,status,role) values(?,?,?,?, 'false','user')"
              connection.query(query,[user.name, user.contactName, user.email,user.password], (err,result)=>{
                if(!err){
                    return res.status(200).json({message: "Registered sucessfully"})
                }else{
                    return res.status(500).json(err)
                }
              })
            }
            else{
                return res.status(400).json({message: "Email already exists"})
            }

        }else{
          return res.status(500).json(err)
        }
    })
})


router.post('/login', (req,res)=>{
    const user = req.body;
    query = 'select email,password,role,status from user where email=?';
    connection.query(query,[user.email],(err,result)=>{
        if(!err){
            //if 0 index gmail not match with user gmail or 0 index password then its incorrect
            if(result.length <= 0 || result[0].password != user.password){
                return res.status(401).json({message: "Incorrect Username or password"})

            }

            else if(result[0].status === 'false'){
                return res.status(401).json({message: "Wait for admin approval"})
            }
            //generate jwt token 
            else if(result[0].password == user.password){
                const response = {email:result[0].email, role: result[0].role}
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {expiresIn:'8h'})
                res.status(200).json({token: accessToken})
            }
            else{
                return res.status(500).json({message: "something went wrong"})
            }



        }else{
            return res.status(500).json(err)
        }
    })
})


//
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        mail: process.env.EMAIL ,
        pass: process.env.PASSWORD
    }

})

//forgot password mail sent to user mail
/
router.post('/forgot', (req,res)=>{
    const user = req.body;
    query = 'select email,password,role,status from user where email=?';
    connection.query(query,[user.email],(err,result)=>{
        if(!err){
            
            if(result.length <= 0 ){
                return res.status(200).json({message: "Password sent to mail"})

            }
            else{
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: process.env.PASSWORD,
                    subject: "password sent for cafe reset",
                    html: '<h1> Your login details <br/> +result[0].email+ <br/> password +result[0].password+ <br/> <a href="http://localhost:4200/">click </a></h1>'
                };

            transporter.sendMail(mailOptions, (err,info)=>{
                if(error){
                    console.log(error)

                }
                else{
                    console.log(info.response)
                }
            })
            return res.status(200).json({message: "Password sent to mail"})


            }



        }else{
            return res.status(500).json(err)
        }
    })
})


//get all the users
router.get('/getusers', auth.authenticationToken, checkRole.checkRole,(err,res) =>{
    var query ="select id,name,email,contactName, status from user where role='user' "
    connection.query(query, (err,result)=>{
        if(!err){
            return res.status(200).json(result)
        }else{
            return res.status(500).json(err)
        }
    })
})



//update the status of the user
router.patch('/update',auth.authenticationToken,  checkRole.checkRole,(req,res) =>{
    let user = req.body;
    var query ="update user set status=? where id=?"
    connection.query(query, [user.status,user.id],(err,result)=>{
        if(!err){
            if(result.affectedRows == 0){
                return res.status(404).json({message:"User id does not exists"})
            }
            return res.status(200).json({message:"User updated"})
        }else{
            return res.status(500).json(err)
        }
    })
})

router.get('/checktoken', auth.authenticationToken ,(req,res)=>{
    return res.status(200).json({message:"true"})
})


//change password

router.post('/changepassword', auth.authenticationToken, (req,res)=>{
    const user = req.body
    const email = res.locals.email
    var query = 'select * from user where email=? and password=?'
    connection.query(query,[email,user.oldPassword], (err,result)=>{

        if(!err){
            if(result.length <=0){
                return res.status(400).json({message:'Incorrect old Password'})
            }
        
    
        else if(result[0].password == user.oldPassword){
            query = 'update user set password = ? where email = ?'
            connection.query(query, [user.newPassword,email] , (err,result)=>{
                if(!err){
                    return res.status(500).json({message:'password updated succesfully'})
                }
                else{
                    return res.status(500).json(err)
                }

            })
          }
                 else{
                     return res.status(400).json({message:'Something went wrong please try again later?'})
                     }
        }
        else{
            return res.status(500).json(err) 
        } 
     })
})


module.exports = router