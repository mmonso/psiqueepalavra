import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialization for GoogleGenAI to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// API Route: Socratic Reflection & Dialogue with the Essay
app.post("/api/gemini/reflect", async (req, res) => {
  try {
    const { essayTitle, essayExcerpt, questionOrMode } = req.body;
    const client = getAIClient();

    if (!client) {
      // Graceful fallback if no API key is set
      return res.json({
        reflection: `A reflexão sobre "${essayTitle}" nos convida a escutar os tempos de silêncio do psiquismo. Como esta leitura ressoa na sua própria experiência cotidiana de escuta e afeto? (Modo offline ativado: configure a GEMINI_API_KEY nas configurações para diálogos gerados por IA).`
      });
    }

    const prompt = `Você é um colega psicólogo clínico e terapeuta com profunda escuta psicanalítica e humanista (inspirado em Jung, Winnicott, Freud e Viktor Frankl), atuando no blog de ensaios do Psicólogo Marcelo Monso.
    
O leitor está lendo o ensaio intitulado "${essayTitle}".
Trecho/Resumo do ensaio: "${essayExcerpt?.slice(0, 800) || ''}..."

Solicitação ou Pergunta do leitor/modo: "${questionOrMode}"

Objetivo: Forneça uma resposta reflexiva, acolhedora, socrática e intelectualmente estimulante (entre 2 a 3 parágrafos curtos). Não dê conselhos médicos nem prescrições clínicas diretivas; promova a autorreflexão, conecte o tema com a filosofia da mente e convide à elaboração subjetiva. Use um tom calmo, maduro e literário em português do Brasil.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({
      reflection: response.text || "Não foi possível gerar uma reflexão no momento."
    });
  } catch (error: any) {
    console.error("Error generating reflection:", error);
    res.status(500).json({ 
      error: "Erro ao consultar o assistente socrático.",
      fallback: "A verdadeira reflexão nasce da pausa após a leitura. Que emoção ou lembrança este ensaio evoca em você hoje?"
    });
  }
});

// API Route: Editor Assistant for Marcelo Monso (Suggest Title, Polish, Synthesize)
app.post("/api/gemini/assist-editor", async (req, res) => {
  try {
    const { content, action } = req.body;
    const client = getAIClient();

    if (!client) {
      return res.status(503).json({
        error: "Chave GEMINI_API_KEY não encontrada no servidor para o assistente de edição."
      });
    }

    let prompt = "";
    if (action === "suggest_title") {
      prompt = `Aja como um editor literário especializado em ensaios de psicologia e psicanálise. Leia o texto abaixo e sugira 3 opções de Títulos Poéticos e Instigantes (junto com subtítulos explicativos curtos) que tenham alta dignidade intelectual e minimalismo estético em português.
      
Texto: "${content.slice(0, 1500)}..."
Formato de saída:
1. **Título Principal 1**: Subtítulo
2. **Título Principal 2**: Subtítulo
3. **Título Principal 3**: Subtítulo`;
    } else if (action === "generate_excerpt") {
      prompt = `Crie um resumo executivo elegante ou sinopse poética (máximo 3 frases intensas e reflexivas) para o ensaio de psicologia abaixo, ideal para atrair leitores no card de preview do blog.
      
Texto: "${content.slice(0, 2000)}..."`;
    } else if (action === "polish_tone") {
      prompt = `Aja como um revisor de ensaios de psicologia clínica e psicanálise. Analise o texto abaixo e sugira melhorias sutis na fluidez, pontuação e clareza conceitual, mantendo a voz autoral do psicólogo Marcelo Monso calmo, profundo e sem academicismo excessivo ou jargões pedantes.
      
Texto: "${content.slice(0, 2000)}..."`;
    } else {
      prompt = `Faça uma análise crítica construtiva do seguinte ensaio de psicologia, apontando pontos fortes e possíveis aprofundamentos em 3 tópicos curtos: "${content.slice(0, 1500)}..."`;
    }

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Error in editor assistance:", error);
    res.status(500).json({ error: "Erro no processamento da IA de edição." });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Blog Psi Ensaio Server" });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
