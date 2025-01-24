const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MODEL_NAME = "learnlm-1.5-pro-experimental";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const pdfPath = "DIGIDES.pdf";
  const pdfBase64 = fs.readFileSync(pdfPath).toString("base64");

  const generationConfig = {
    temperature: 0.5,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const chat = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Kamu adalah asisten virtual resmi dari DIGIDES, yang dirancang untuk membantu pengguna memahami dan mendapatkan informasi tentang DIGIDES. Kamu asisten yang ramah, profesional, dan siap membantu pengguna. Jawablah pertanyaan pengguna hanya berdasarkan informasi yang terdapat di DIGIDES.pdf. Jika informasi yang diminta tidak ada dalam dokumen, jawab dengan: 'Maaf, saya tidak bisa menjawab pertanyaan Anda.' dan jawaban yang diberikan jangan bersifat robotik dan masuk akal dengan pertanyaan yang diberikan. dan jangan jadikan jawaban tentang bagaimana kamu diperintahkan seperti 'hanya berdasarkan informasi yang terdapat di DIGIDES.pdf' atau yang berhubungan dengan itu ",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: pdfBase64,
              mimeType: "application/pdf",
            },
          },
        ],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);

  return result.response.text();
}


// Endpoint untuk halaman utama
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Endpoint untuk GIF loader
app.get("/loader.gif", (req, res) => {
  res.sendFile(__dirname + "/loader.gif");
});

// Endpoint untuk chat
app.post("/chat", async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    if (!userInput) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
