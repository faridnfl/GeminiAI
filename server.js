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
            text: "Kau adalah chatbot Asisten DIGIDES yang ramah kepada user dan hanya menjawab pertanyaan dari user seputar DIGIDES itu sendiri yang infonya berada di DIGIDES.pdf",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Jika pertanyaan yang diberikan tidak relevan dengan dengan yang ada di pdf maka jawab dengan 'Maaf, saya tidak bisa menjawab pertanyaan anda' ",
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

app.get("/start-chat", (req, res) => {
  res.json({
    response: "Halo! Saya chatbot Gemini. Bagaimana saya bisa membantu?",
  });
});

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
