const express = require('express')
const connection = require('../connection')
const router = express.Router();
let ejs = require('ejs')
let pdf = require('html-pdf')
let path = require('path')
var fs = require('fs')
var uuid = require('uuid')
var auth = require('../services/authentication');


router.post('/generateReport', auth.authenticationToken, (req,res)=>{
    const generateUuid = uuid.v1()
    console.log(generateUuid)
    const orderDetails = req.body
    var productDetailsReport = JSON.parse(orderDetails.productDetails)
    //  
    var query = 'insert into bill (name,uuid,email,contactNumber,paymentmethod,total,productdetails,createdBy) values(?,?,?,?,?,?,?,?)'

    connection.query(query,[orderDetails.name,generateUuid,orderDetails.email,orderDetails.contactNumber,orderDetails.paymentmethod,orderDetails.total,orderDetails.productdetails,res.locals.email], (err,result)=>{
        if(!err){
            ejs.renderFile(path.join(__dirname,'',"report.ejs"), {productDetails:productDetailsReport,name:orderDetails.name,email:orderDetails.email,contactNumber:orderDetails.contactNumber, paymentmethod:orderDetails.paymentmethod,totalAmount:orderDetails.total }, (err,result)=>{
                if(err){
                    console.log(err)
                    return res.status(500).json(err)
                }
                else{
                    pdf.create(result).toFile('./generated_pdf/'+generateUuid+".pdf", function(err,result){
                        if(err){
                            console.log(err)
                            return res.status(500).json(err) 
                        }
                        else{
                            return res.status(200).json({uuid: generateUuid}) 
                        }
                    })

                }
            })

        }
        else{
            return res.status(500).json(err)
        }
    })
})


router.post('/getpdf',auth.authenticationToken,(req,res)=>{
    const orderDetails = req.body;
    const pdfPath = "./generated_pdf" + orderDetails.uuid + '.pdf';
    if(fs.existsSync(pdfPath)){
        res.contentType("application/pdf")
        fs.createReadStream(pdfPath).pipe(res)
    }
    else{

        var productDetailsReport = JSON.parse(orderDetails.productDetails)
        ejs.renderFile(path.join(__dirname,'',"report.ejs"), {productDetails:productDetailsReport,name:orderDetails.name,email:orderDetails.email,contactNumber:orderDetails.contactNumber, paymentmethod:orderDetails.paymentmethod,totalAmount:orderDetails.total }, (err,result)=>{
            if(err){
                console.log(err)
                return res.status(500).json(err)
            }
            else{
                pdf.create(result).toFile('./generated_pdf/'+orderDetails.uuid+".pdf", function(err,result){
                    if(err){
                        console.log(err)
                        return res.status(500).json(err) 
                    }
                    else{
                        res.contentType("application/pdf")
                        fs.createReadStream(pdfPath).pipe(res)
                       
                    }
                })

            }
        })

    }
})

router.get("/getBills",auth.authenticationToken,(req,res)=>{
    query="select * from bill order by id DESC"
    connection.query(query,(err,result)=>{
        if(!err){
            return res.status(200).json(result)
        }
        else{
            return res.status(500).json(err)
        }
    })
})


router.delete('/delete/:id',auth.authenticationToken, (req,res) =>{
    let id = req.params.id;
    var query ="delete from product where id=?"
    connection.query(query, [id],(err,result)=>{
        if(!err){
            if(result.affectedRows == 0){
                return res.status(404).json({message:"Bill id does not found"})
            }
            return res.status(200).json({message:"Bill Deleted succesfully"})
        }
        else{
            return res.status(500).json(err)
        }
    })
})

module.exports = router