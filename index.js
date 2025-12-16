import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GROQ_API_KEY;

const EMERGENCY_WORDS = [
  "chest pain", "breathing", "unconscious",
  "suicide", "kill myself", "self harm"
];

app.post("/chat", async (req, res) => {
  const userMsg = req.body.message.toLowerCase();

  if (EMERGENCY_WORDS.some(w => userMsg.includes(w))) {
    return res.json({
      reply: "⚠️ This may be a medical emergency. Please call 112 immediately or visit the nearest hospital. Suicide Helpline (India): 9152987821"
    });
  }

  const prompt = `
You are a calm Indian medical assistant.
Do not diagnose.
Do not prescribe medicines.
Speak in Hinglish or English.
Always add disclaimer.

User: ${req.body.message}
`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();

  res.json({
    reply: data.choices[0].message.content +
      "\n\n⚠️ This is not a medical diagnosis. Please consult a qualified doctor."
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));


