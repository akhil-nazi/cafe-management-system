const express = require('express')
const connection = require('../connection')
const router = express.Router();
var auth = require('../services/authentication')
var checkRole = require('../services/checkRole')
require('dotenv').config()

router.post('/post',auth.authenticationToken,  checkRole.checkRole, (req,res)=>{
    let category = req.body
    let query = 'insert into category (name) values(?)'
    connection.query(query, [category.name], (err,result)=>{
        if(!err){
            return res.status(200).json({message: "Added Successfully"})
        }
        else{
            return res.status(500).json(err)
        }
    })

})

router.get('/categories', auth.authenticationToken,(req,res)=>{
    var query = "select * from category order by name"
    connection.query(query, (err,result)=>{
        if(!err){
            return res.status(200).json(result)
        }
        else{
            return res.status(500).json(err)
        }
    })
    
   
})

router.patch('/update',auth.authenticationToken,  checkRole.checkRole,(req,res) =>{
    let product = req.body;
    var query ="update category set name=? where id=?"
    connection.query(query, [product.name, product.id],(err,result)=>{
        if(!err){
            if(result.affectedRows == 0){
                return res.status(404).json({message:"category id does not exists"})
            }
            return res.status(200).json({message:"category updated"})
        }
        else{
            return res.status(500).json(err)
        }
    })
})

module.exports = router