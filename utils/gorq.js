import "dotenv/config";

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
        // console.log(json.choices[0].message.content);
        return json.choices[0].message.content;///Replay from AI

     }catch(err){
        console.log(err)
     }
};

export default gorqAPIResponse;