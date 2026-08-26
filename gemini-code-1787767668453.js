const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Reads key from environment variables for security
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/ask', async (req, res) => {
  const { history } = req.body;

  try {
    // Map history to the required format
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Request answer with active Google Search grounding
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to generate answer." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EVO server active on port ${PORT}`);
});