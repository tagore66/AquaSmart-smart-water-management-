require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try gemini-1.5-flash as it is more widely available
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Hello, tell me a short joke about water.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("Success:", response.text());
    } catch (error) {
        console.error("Failure:", error.message);
    }
}

testGemini();
