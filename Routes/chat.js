import express from "express";
import Thread from "../Models/Threads.js";
import gorqAPIResponse from "../utils/gorq.js"
import User from "../Models/user.js"
import bcrypt from "bcrypt";//add hashing in password

const router = express.Router();


//---if user does or doesNot exist - middleware-------
const isAuth =(req,res,next)=>{
    if(!req.session.user){
        return res.status(401).json({message:"Login Required"});
    }
    next();
}

//------------/test-------------------------
router.post("/test",async (req,res)=>{
   try{

    const thread = new Thread({
        threadId:"abcc2",
        title:"New Thread 2",
    });

    const res2 = await thread.save();
    res.send(res2)

   }catch(err){
    console.log(err)
    res.status(500).send(err)
   } 
});

//----------GET ALL THREADS---------
router.get("/thread",isAuth,async (req,res)=>{
   try{
    const threads = await Thread.find({userId:req.session.user.id}).sort({updatedAt:-1})
    //We want thread in descening order that why sort updateat -1
    res.status(200).json(threads); 
   }catch(err){
    console.log(err);
    res.status(500).send("failed to load data",err)
   } 
});

//----------ONE SPECIFIC THREAD MESG-----
router.get("/thread/:threadId",isAuth,async(req,res)=>{
    const {threadId} =req.params;
    try{
        const thread = await Thread.findOne({threadId,userId:req.session.user.id});

        if(!thread){
            return res.status(500).json({error:"thread not found"})
        }

        res.json(thread.messages)
    }catch(err){
    console.log(err);
    res.status(500).send("failed to load data",err)
   } 
});

//------DELETE ROUTE--------
router.delete("/thread/:threadId",isAuth,async(req,res)=>{
    const {threadId} =req.params;
    try{
       
        const delete2 = await Thread.findOneAndDelete({threadId,userId: req.session.user.id});

        if(!delete2){
            return res.status(400).json({error:"thread could not be deleted"})
        }


       res.status(200).json({
       success: "Thread deleted successfully"
    });

    }catch(err){
    console.log(err);
    res.status(500).send("failed to load data",err)
   } 
});

//--------POST ROUTE - RESPONSE FROM AI
router.post("/chat",isAuth,async(req,res)=>{
    const {threadId,messages}=req.body;

    if(!threadId || !messages){
        return res.status(400).json({message:"Missing required fields"});
       }
    try{
       let thread = await Thread.findOne({threadId,userId: req.session.user.id});
       
       if(!thread){
          thread = new Thread({
            //If does not exist then new thread
            threadId,
            userId:req.session.user.id,
            title:messages,
            messages:[{role:"user",content:messages}]
         })

       }else{
        thread.messages.push({role:"user",content:messages})
       }

       const reply = await gorqAPIResponse(messages);
       
       thread.messages.push({role:"assistant",content:reply});

       thread.updatedAt =new Date();

       await thread.save();
       res.json({AiReplay:reply});//Replay from Backend AI to frontend 

    }catch(err){
    console.log(err);
    res.status(500).json({
    message:"failed to load data",
    error: err.message
    });
}
})
//-------------------authentication--------------------------------

//---------------SIGN UP ROUTE-------------------------------
router.post("/signup",async (req,res)=>{

    try{
    const {name,email,password} =req.body;
    

    //1. All field are required
    if(!name || !email || !password){
        return res.status(400).json({message:"All fields required"})
    } 

    //2. Check if it is a old user
    const alreadyUser = await User.findOne({email});
    if(alreadyUser){
        return res.status(400).json({message:"User Already exist"});
    }


    //3. if not then make a new user
    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = new User({
        name,
        email,
        password:hashedPassword
    });

    //4. New user savee
    await newUser.save();


    // ✅ AUTO LOGIN SESSION
    req.session.user = {
    id: newUser._id,
    name: newUser.name
    };

    
    res.status(201).json({success:true,name:newUser.name})



    
    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"});
    }
});

//--------LOGIN ROUTE--------------------
router.post("/login",async(req,res)=>{
    const {email,password} =req.body;

    // 1. Validate fields
    if(!email || !password){
        return res.status(400).json({ message:"All fields required" });
    }

    //2. check if user is sign of not
    const user = await User.findOne({email});
    if(!user){
        return res.status(401).json({message:"User is not registered"});
    }
    //3. Password match
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
       return res.status(401).json({message:"Invalid password"})
    }
    //3. if user is registered
    req.session.user ={
        id:user._id,
        name:user.name
    }
    res.status(200).json({
    success:true,
    name:user.name
    });
});


//To knoww frontend the whcih curr User is login 
router.get("/current-user",(req,res)=>{
    if(!req.session.user){
        return res.json({loggedIn:false})
    }
        //loggedIn - field to check if user login should falase or true
    res.json({
        loggedIn:true,
        name:req.session.user.name
    })
})

//--------Logoutt-------
router.post("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            return res.status(500).json({message:"Logout failed"});
        }
        res.clearCookie("connect.sid"); // remove session cookie
        res.json({message:"Logged out"});
    });
});

//1 req.session.destroy() → removes session from server
//2️ res.clearCookie("connect.sid") → removes cookie from browser
//3️ User is no longer authenticated



export default router;