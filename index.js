// dependancies

const express = require("express")
const app = express()
const path = require("path")
const methodOverride = require('method-override');
const expressError = require("./expressError")



// middlewares

app.use(methodOverride('_method'))
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "./views"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


// mongodb connection

const mongoose = require("mongoose");
const { stringify } = require("nodemon/lib/utils");
const { rmSync } = require("fs");
const { nextTick } = require("process");
const { errorMonitor } = require("events");

main()
.then(res=> console.log("connection stablised"))
.catch((err)=> console.log(err))


async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/amazon');
}

const userSchema = new mongoose.Schema({
    name : String,
    age : Number,
    education : String
})

const User = mongoose.model("User", userSchema) 


// routes

// root route
app.get('/', function (req, res) {
    res.render("home")
})


function asyncWrap (fn){
    return function (req, res, next){   //this function will send the response to the middlewares if needed
        fn(req, res, next).catch((err) => next(err)) // allows the inner function (fn) to have access to the request, response, and next middleware function in the chain.
    }
}
 
// post home route (create)
app.post("/home", asyncWrap (async (req, res, next)=>{
    const {name: username, education: edu,  age: ag} = req.body
    await User.create({
        name: username,
        age: ag,
        education: edu
    })
    res.redirect("/read")
}))

// read route (read)

app.get("/read", asyncWrap(async (req, res, next)=>{
    let mainRes = await User.find()
    if(!mainRes){
        throw new expressError(404,"page not found")
    }
    res.render("read", {mainRes})
}))


// edit route

app.get("/read/:id/edit", asyncWrap(async (req, res, next)=>{
        const {id: trgId} = req.params
        const trgRes =  await User.findOne({_id: `${trgId}`})
        
        if(!trgRes){
            next( new expressError(402,"forbidden error found"))
         }
        res.render("edit", {trgRes})
}))

// edit patch route

app.patch("/read/:id", asyncWrap(async (req, res, next)=>{

        const {id: trgId} = req.params
        const {education: edu} = req.body
          const trgRes = await User.findOne({_id: `${trgId}`})
             if(trgRes.education != edu){
                await User.updateOne({_id: trgRes.id}, {education: edu})
                 res.redirect("/read")
             } else{
                 res.redirect("/read")
             }
    }
))


// delete route

app.delete("/read/:id", asyncWrap(async (req, res, next)=>{
        const {id: delId} = req.params
        await User.findByIdAndDelete(`${delId}`)
        res.redirect("/read")
}))  

// error handling middlewares

app.use((err, req, res, next) => {
    let {status = 500 , message = "some error occured"} = err
    res.status(status).send(message)
})



// port to listen
const port = 8080
app.listen(port)



