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

 
// post home route (create)
app.post("/home", async (req, res, next)=>{
   try {
    const {name: username, education: edu,  age: ag} = req.body
    await User.create({
        name: username,
        age: ag,
        education: edu
    })
    res.redirect("/read")
   } catch (error) {
        next(error)
   }
})

// read route (read)

app.get("/read", async (req, res,next)=>{
  try {
    let mainRes = await User.find()
    if(!mainRes){
        throw new expressError(404,"page not found")
    }
    res.render("read", {mainRes})
  } catch (error) {
    next(error)
  }
})


// edit route

app.get("/read/:id/edit", async (req, res, next)=>{
    try {
        const {id: trgId} = req.params
        const trgRes =  await User.findOne({_id: `${trgId}`})
        
        if(!trgRes){
            next( new expressError(402,"forbidden error found"))
         }
        res.render("edit", {trgRes})
    } catch (error) {
        next(error)
    }
})

// edit patch route

app.patch("/read/:id",async (req, res, next)=>{
    try {
        const {id: trgId} = req.params
        const {education: edu} = req.body
          const trgRes = await User.findOne({_id: `${trgId}`})
             if(trgRes.education != edu){
                await User.updateOne({_id: trgRes.id}, {education: edu})
                 res.redirect("/read")
             } else{
                 res.redirect("/read")
             }
    } catch (error) {
        next(error)
    }
    }
)


// delete route

app.delete("/read/:id", async (req, res, next)=>{
    try {
        const {id: delId} = req.params
        await User.findByIdAndDelete(`${delId}`)
        res.redirect("/read")
    } catch (error) {
        next(error)
    }
})  

// error handling middlewares

app.use((err, req, res, next) => {
    let {status = 500 , message = "some error occured"} = err
    res.status(status).send(message)
})



// port to listen
const port = 8080
app.listen(port)



