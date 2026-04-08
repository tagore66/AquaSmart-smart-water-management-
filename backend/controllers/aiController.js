require("dotenv").config();
const axios = require("axios");

console.log("GROQ API KEY LOADED:", process.env.GROQ_API_KEY ? "YES" : "NO");

const callAI = async (prompt) => {
    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are a smart water management assistant." },
                    { role: "user", content: prompt }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Groq API Error:", error.response?.data || error.message);
        throw new Error("AI is currently experiencing high demand or an error occurred. Please try again later.");
    }
};

// @desc    Analyze specific water usage category
// @route   POST /api/ai/analyze
const analyzeUsage = async (req, res) => {
    const { category, usageData } = req.body;
    if (!category || !usageData) return res.status(400).json({ message: "Data missing" });

    const prompt = `You are a smart water management assistant.
Analyze the user’s weekly water usage:

Bath: ${usageData.bathing}L
Kitchen: ${usageData.kitchen}L
Toilet: ${usageData.toilet}L
Washing: ${usageData.washing}L
Garden: ${usageData.gardening}L
Total: ${usageData.totalLiters}L

Focus on ${category}.
Explain if usage is high or inefficient.
Give clear, practical, personalized suggestions to reduce water usage and bill.
Keep response short and useful.`;

    try {
        const result = await callAI(prompt);
        res.json({ analysis: result, modelUsed: "llama-3.3-70b-versatile" });
    } catch (error) {
        console.error("Full Error:", error);
        res.status(500).json({ 
            message: "AI Analysis failed", 
            error: error.message 
        });
    }
};

// @desc    Conversational water saving advice
// @route   POST /api/ai/chat
const chatWithAI = async (req, res) => {
    const { message, usageData, history } = req.body;
    if (!message) return res.status(400).json({ message: "Question missing" });

    const context = usageData ? `Context: User consumes ${usageData.totalLiters}L/week (Bathing: ${usageData.bathing}L, Kitchen: ${usageData.kitchen}L, Toilet: ${usageData.toilet}L, Washing: ${usageData.washing}L, Gardening: ${usageData.gardening}L) for ${usageData.numPeople} people.` : "";
    
    const prompt = `
You are AquaSmart AI, a water conservation expert. 
${context}
User says: "${message}"
History: ${JSON.stringify(history || [])}
Provide a helpful, friendly, and practical answer. Keep it concise.
    `;

    try {
        const result = await callAI(prompt);
        res.json({ reply: result, modelUsed: "llama-3.3-70b-versatile" });
    } catch (error) {
        res.status(500).json({ message: "Chat failed", error: error.message });
    }
};

// @desc    Generate full water usage report
// @route   POST /api/ai/report
const generateFullReport = async (req, res) => {
    const { usageData } = req.body;
    if (!usageData) return res.status(400).json({ message: "Usage data missing" });

    const prompt = `
Generate a comprehensive Water Conservation Health Report for a household of ${usageData.numPeople}:
Current Weekly Data:
- Bathing: ${usageData.bathing}L
- Kitchen: ${usageData.kitchen}L
- Toilet: ${usageData.toilet}L
- Washing: ${usageData.washing}L
- Gardening: ${usageData.gardening}L
- Total: ${usageData.totalLiters}L

Your report should:
1. Executive Summary: Overall status (Excellent, Good, Warning, Critical).
2. Category Breakdown: Brief analysis of each area.
3. Top 3 Priorities: Immediate actions to save most water.
4. Estimated Savings: Potential liters/cost saved if suggestions followed.

Use Markdown formatting. Keep it professional yet encouraging.
    `;

    try {
        const result = await callAI(prompt);
        res.json({ report: result, modelUsed: "llama-3.3-70b-versatile" });
    } catch (error) {
        res.status(500).json({ message: "Report generation failed", error: error.message });
    }
};

module.exports = { analyzeUsage, chatWithAI, generateFullReport };
