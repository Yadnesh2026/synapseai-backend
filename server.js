import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoute from "./Routes/chat.js"
import session from "express-session";

const app = express();
// const PORT =8111;

//---------Frontend to backend usee------
app.use(cors({
//   origin: ["http://localhost:5173", "https://synapseai-backend-production.up.railway.app"]
  origin:["http://localhost:5173",
    "https://synapseai-frontend.vercel.app",
    "https://synapseai-frontend-2i3e.vercel.app"],
  credentials: true
}));
app.use(express.json());
//-------------------------------------


//-----Authentication------------
//----to remember that user is old or specfic user is login----

// VERY IMPORTANT for Railway / HTTPS proxy
app.set("trust proxy", 1);


app.use(session({
    secret:"secret-key",
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:true,        // HTTPS only
        httpOnly:true,
        sameSite:"none"     // REQUIRED for cross domain
    }
}))

//UNIVERSAL ROUTEE
app.use("/api",chatRoute);


app.get("/test-session",(req,res)=>{

    if(!req.session.count){
        req.session.count = 1;
    }else{
        req.session.count++;
    }

    res.send(`visited ${req.session.count} times`);
});


// ---------- ROUTES ----------
app.get("/",(req,res)=>{
    res.send("hello");
    
});

// // ---------- DB CONNECTION ----------
// const connectDB =async()=>{
//     try{
//         await mongoose.connect(process.env.MONGODB_URL);
//         console.log("Connected with DB")
//     }catch(err){
//         console.log("faileed to connect",err)
//     }
// }
// // Call DB connection when server starts
// connectDB();


// // ---------- SERVER ----------
// const PORT = process.env.PORT || 8111;

// app.listen(PORT, () => {
//   console.log(`server is running on ${PORT}`);
// });

// ---------- SERVER + DB ----------
const PORT = process.env.PORT || 8111;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected with DB");

    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to connect to DB:", err);
  }
};

startServer();
























// import OpenAI from "openai";
// import 'dotenv/config';

// const client = new OpenAI({
//   apiKey: process.env.GROQ_API_KEY,
//   baseURL: "https://api.groq.com/openai/v1"
// });

// const response = await client.chat.completions.create({
//   model: "llama-3.3-70b-versatile",
//   messages: [
//     { role: "user", content: "whats you name " }
//   ]
// });

// console.log(response.choices[0].message.content);
