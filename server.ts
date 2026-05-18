import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint to generate questions
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { topic, subject, grade, difficulty, count, type } = req.body;

    const prompt = `Buatkan ${count} soal ${type === 'multiple_choice' ? 'pilihan ganda' : 'essay'} tentang topik "${topic}" untuk mata pelajaran "${subject}" jenjang "${grade}" dengan tingkat kesulitan "${difficulty}".
    Pastikan soal berkualitas tinggi, akurat, dan sesuai kurikulum.
    Jika pilihan ganda, berikan 4 opsi (A, B, C, D) dan kunci jawaban.
    Jika essay, berikan soal dan contoh jawaban yang benar.
    Gunakan Bahasa Indonesia yang baik dan benar.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Hanya untuk pilihan ganda, kosongkan jika essay"
                  },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "answer"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Gagal membuat soal. Silakan coba lagi." });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
