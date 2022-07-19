const express = require('express')
const connection = require('../connection')
const router = express.Router();
var auth = require('../services/authentication')
var checkRole = require('../services/checkRole')


router.post('/add',auth.authenticationToken,  checkRole.checkRole, (req,res)=>{
    let product = req.body
    let query = 'insert into product(name,categoryId, description, status, price) values(?,?,?,true,?)'
    connection.query(query, [product.name,product.categoryId,product.description,product.price], (err,result)=>{
        if(!err){
            return res.status(200).json({message: "product Added Successfully"})
        }
        else{
            return res.status(500).json(err)
        }
    })

})

router.get('/getproduct', auth.authenticationToken,(req,res)=>{

    var query = "select p.id, p.name, p.description, p.price, p.status, c.id as categoryId, c.name as categoryName from product as p INNER JOIN category as c where p.categoryId = c.id"
    connection.query(query, (err,result)=>{
        if(!err){
            return res.status(200).json(result)
        }
        else{
            return res.status(500).json(err)
        }
    })
    
   
})


router.get('/getbycategory/:id', auth.authenticationToken,(req,res)=>{
    const id = req.params.id
    var query = "select id,name from product where categoryId= ? and status = 'true'"
    connection.query(query,[id], (err,result)=>{
        if(!err){
            return res.status(200).json(result)
        }
        else{
            return res.status(500).json(err)
        }
    })
    
   
})


router.get('/getbyId/:id', auth.authenticationToken,(req,res)=>{
    const id = req.params.id
    var query = "select id,name,description,price from product where id=?"
    connection.query(query,[id], (err,result)=>{
        if(!err){
            return res.status(200).json(result[0])
        }
        else{
            return res.status(500).json(err)
        }
    })
    
   
})



router.patch('/update',auth.authenticationToken,  checkRole.checkRole,(req,res) =>{
    let product = req.body;
    var query ="update product set name=?, categoryId=?, description=?, price=? where id=?"
    connection.query(query, [product.id,product.name, product.categoryId, product.description, product.price],(err,result)=>{
        if(!err){
            if(result.affectedRows == 0){
                return res.status(404).json({message:"product id does not exists"})
            }
            return res.status(200).json({message:"product updated"})
        }
        else{
            return res.status(500).json(err)
        }
    })
})



router.delete('/delete/:id',auth.authenticationToken,  checkRole.checkRole,(req,res) =>{
    let id = req.params.id;
    var query ="delete from product where id=?"
    connection.query(query, [id],(err,result)=>{
        if(!err){
            if(result.affectedRows == 0){
                return res.status(404).json({message:"product id id does not exists"})
            }
            return res.status(200).json({message:"product deleted"})
        }
        else{
            return res.status(500).json(err)
        }
    })
})

//update status
router.patch('/updateStatus',auth.authenticationToken,  checkRole.checkRole,(req,res) =>{
    let product = req.body;
    var query ="update product set status=? where id=?"
    connection.query(query, [product.status, product.id],(err,result)=>{
        if(!err){
            if(result.affectedRows == 0){
                return res.status(404).json({message:"product id does not exists"})
            }
            return res.status(200).json({message:"product status updated"})
        }
        else{
            return res.status(500).json(err)
        }
    })
})

module.exports = router