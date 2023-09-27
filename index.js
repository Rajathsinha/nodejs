import express from 'express';
import mongoose, { mongo } from 'mongoose';
import path from 'path'
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"

const app =express();

//connecting to MongoDB

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"Backend",

}).then(()=>
    console.log("MongoDB Connected Successfully!")
).catch((e)=>
    console.log(e)
);

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

const User = mongoose.model("user",userSchema);
//messIT



//using middleware

app.use(express.static(path.join(path.resolve(),"public")))

app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

//setting up view engine


const isAuthenticated = async(req,res,next)=>{

    const{token}= req.cookies;
    if(token){

       const decoded= jwt.verify(token,"SHhbhk2bdk199930")

       req.user = await User.findById(decoded._id)
        next()
    }
    else{
        res.redirect("login")
    }


}


app.set("view engine","ejs")



app.get("/",isAuthenticated,(req,res)=>{
res.render("logout",{name:req.user.name})

});

app.get("/register",(req,res)=>{
    res.render("register")
    
    });
app.get("/login",(req,res)=>{
    res.render('login')
})

app.post("/register", async (req, res) => {
    const {name,email,password}= req.body

    let user = await User.findOne({ email });
    if(user){
    //    return console.log("Register First!")
    return res.redirect('/login')
    }
    
    const HashedPassword = await bcrypt.hash(password,10)

     user =await User.create({
        name, 
        email,
        password:HashedPassword,
    });
    const token = jwt.sign({_id: user._id},"SHhbhk2bdk199930")

    console.log(token);

    const expirationTime = new Date(Date.now() + 30000); // 30 seconds from now
    res.cookie("token", token, {
      httpOnly: true,
      expires: expirationTime,
    });
    res.redirect("/");
})

app.post("/login",async(req,res)=>{
    const{email,password}= req.body
    let user = await User.findOne({email})
    if(!user) return res.redirect("/register");
    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.render("login",{email,message:"Incorrect Password!"})
    const token = jwt.sign({_id: user._id},"SHhbhk2bdk199930")

    console.log(token);

    const expirationTime = new Date(Date.now() + 30000); // 30 seconds from now
    res.cookie("token", token, {
      httpOnly: true,
      expires: expirationTime,
    })
        res.redirect("/");

})
 
    // const token = jwt.sign({_id: user._id},"SHhbhk2bdk199930")

    // console.log(token);

    // const expirationTime = new Date(Date.now() + 30000); // 30 seconds from now
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   expires: expirationTime,
    // });
    // res.redirect("/");
//   });
   
// app.post("/login",(req,res)=>{
//    res.cookie("token","IamIN",{
//   httpOnly:true,expires:new Date(Date.now()+20000)
//    });
//    res.redirect("/");
//    });



app.get("/logout", (req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    });
    res.redirect("/")
})


// app.get("/Success",(req,res)=>{

//     res.render("success")
// })

// app.post("/contact",async(req,res)=>{
// //   const messageData={username:req.body.name,email:req.body.email};
// const {name,email}= req.body
//    await Msg.create({name,email});
//    res.redirect("/Success")
// })

// app.get("/users",(req,res)=>{
// res.json({
//     users,
// });
// })












app.listen(4000,()=>{
    console.log("server is working!");
})
