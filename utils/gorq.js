import "dotenv/config";

console.log("GROQ KEY:", process.env.GROQ_API_KEY);

//---All main logic for API serach which connect with Ai to User
const gorqAPIResponse =  async(message)=>{
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "user", content: message }
            ]
        })
    };

     try{
        const response =await fetch("https://api.groq.com/openai/v1/chat/completions",options);
        const json = await response.json();

          // 🔥 VERY IMPORTANT — see real API response
        console.log("GROQ RESPONSE:", json);

        // ✅ check if response valid
        if (!json.choices || !json.choices[0]) {
            throw new Error("Invalid GROQ API response");
        }

        // console.log(json.choices[0].message.content);
        return json.choices[0].message.content;///Replay from AI

     }catch(err){
        console.log(err)
        return null
     }
};

export default gorqAPIResponse;