// dependancies

const express = require("express")
const app = express()
const path = require("path")
var methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "./views"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


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
    }).then(result=> console.log(result))
    .catch(err=> console.log(err))
    res.redirect("/read")
})

// read route (read)

app.get("/read", async (req, res)=>{
   User.find().then(result=>{
    let mainRes = result;
    res.render("read", {mainRes})
   })
})


// port to listen
const port = 8080
app.listen(port)


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

