const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MODEL_NAME = "learnlm-1.5-pro-experimental";
const API_KEY = process.env.API_KEY;

const parts = [
  { text: "Nama Desa" },
  { text: "Desa Sumber Rejo" },
  { text: "Daerah Lengkap" },
  { text: "Kabupaten Magetan, Provinsi Jawa Timur" },
  { text: "Kepala Desa" },
  { text: "Bapak Supriyadi" },
  { text: "Alamat Kantor Desa" },
  { text: "Jalan Raya Sumber Rejo No. 15, Sumber Rejo, Magetan" },
  { text: "Jumlah Penduduk" },
  { text: "5.000 orang" },
  { text: "Jumlah KK (Kartu Keluarga)" },
  { text: "1.200 KK" },
  { text: "Fasilitas Umum" },
  { text: "Puskesmas, 2 Sekolah Dasar, Balai Desa, Taman Bermain" },
  { text: "Kontak Desa - Telepon" },
  { text: "(0351) 1234567" },
  { text: "Kontak Desa - Email" },
  { text: "desa.sumberrejo@magetan.go.id" },
  { text: "Website Desa" },
  { text: "www.desasumberrejo.magetan.id" },
  { text: "Sejarah Singkat" },
  { text: "Desa Sumber Rejo didirikan pada tahun 1950 dan dikenal dengan sektor pertaniannya yang maju." },
  { text: "Tanggal Didirikan" },
  { text: "15 Agustus 1950" },
  { text: "Kode Pos" },
  { text: "63352" },
  { text: "Luas Wilayah" },
  { text: "15 km²" },
  { text: "Jumlah RT" },
  { text: "15 RT" },
  { text: "Jumlah RW" },
  { text: "5 RW" },
  // Tambahkan data lain sesuai kebutuhan
];

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.5,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  // Mulai sesi chat dengan data yang ada
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: 'Anda adalah chatbot desa yang hanya menjawab pertanyaan berdasarkan data yang tersedia.',
          },
        ],
        role: "user",
        parts: [
          {
            text: 'Anda adalah chatbot desa yang hanya menjawab pertanyaan seputar informasi desa. Jika pengguna bertanya di luar topik desa, berikan jawaban "Maaf, saya hanya bisa menjawab pertanyaan seputar desa."',
          },
        ],
      },
      {
        role: "user",
        parts: parts,
      },
    ],
  });

  const result = await chatSession.sendMessage(userInput);
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
