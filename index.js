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
app.post("/home", function(req, res){
    const {name: username, education: edu,  age: ag} = req.body
    User.create({
        name: username,
        age: ag,
        education: edu
    })
    res.redirect("/read")
})

// read route (read)

app.get("/read", async (req, res)=>{
    let mainRes = await User.find()
    res.render("read", {mainRes})
   })


// edit route

app.get("/read/:id/edit", async (req, res)=>{
    const {id: trgId} = req.params
    const trgRes =  await User.findOne({_id: `${trgId}`})
    res.render("edit", {trgRes})
    })

// edit patch route

app.patch("/read/:id",async (req, res)=>{
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
)



// delete route

app.delete("/read/:id", async (req, res)=>{
    const {id: delId} = req.params
    await User.findByIdAndDelete(`${delId}`)
    res.redirect("/read")
})  




// port to listen
const port = 8080
app.listen(port)



