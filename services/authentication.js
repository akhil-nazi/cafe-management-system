//whenever api hits it checks token exists in the header


require('dotenv').config()
const jwt = require('jsonwebtoken')


function authenticationToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    //if null it wont sign
    if(token == null)
    return res.sendStatus(401)

    //checks if it signed by acesstoken if not returns null
    jwt.verify(token, process.env.ACCESS_TOKEN, (err,result)=>{
        if(err)
        return res.sendStatus(403)
        res.locals = result
        next()
    })
}


module.exports = {authenticationToken : authenticationToken}