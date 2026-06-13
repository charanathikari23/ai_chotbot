import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Gemini SDK with User-Agent set to "aistudio-build"
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Check backend health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development", hasApiKey: !!apiKey });
  });

  // API Route 1: Chat Playground (direct response with persona & configuration)
  app.post("/api/prompt/chat", async (req, res) => {
    try {
      const { message, history, systemInstruction, temperature } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      // Convert plain chat history to Gemini's format if present
      // We can also create a direct chat using chat manager or a generateContent session
      const contents = [];
      if (history && history.length > 0) {
        for (const item of history) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.content }],
          });
        }
      }

      // Append active message
      contents.push({
        role: "user",
        parts: [{ text: message || "" }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: systemInstruction || "You are a helpful assistant.",
          temperature: typeof temperature === "number" ? temperature : 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: error.message || "An error occurred during generation." });
    }
  });

  // API Route 2: Dynamic Prompt Optimizer (JSON response schema)
  app.post("/api/prompt/optimize", async (req, res) => {
    try {
      const { userPrompt } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      if (!userPrompt || !userPrompt.trim()) {
        return res.status(400).json({ error: "User prompt must not be empty." });
      }

      const critiqueSystemPrompt = 
        "You are an elite, highly experienced Prompt Engineer in GenAI. Your task is to critique and optimize a user-submitted prompt. " +
        "You analyze the prompt for: clarity, role definition, structural clarity, formatting/output instructions, use of delimiters, and missing constraints. " +
        "Provide constructive critique points, and then craft exactly 3 professional-grade optimized versions of the prompt catering to distinct approaches (e.g., Role-Playing style, Structured Layout style, Few-Shot style). Also suggest 3 helpful general tip points.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Here is the user's raw prompt for optimization: "${userPrompt}"`,
        config: {
          systemInstruction: critiqueSystemPrompt,
          temperature: 0.8,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              critique: {
                type: Type.STRING,
                description: "A deep, constructive 2-3 sentence critique of why the original prompt could be improved (focusing on clarity, specificity, and constraints)."
              },
              optimizedPrompts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Short descriptive title for this prompting style (e.g., 'Structured Framework Style', 'Role-Based Expert Style', 'Dynamic Few-Shot Concept')." },
                    text: { type: Type.STRING, description: "The complete, upgraded full-text prompt that the user can immediately use. Make sure it contains placeholders like [insert context here] if needed." },
                    explanation: { type: Type.STRING, description: "A quick 1-sentence note explanation of what was improved in this iteration." }
                  },
                  required: ["title", "text", "explanation"]
                },
                description: "Exactly 3 distinct, high-quality prompt upgrades."
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 highly targetable expert prompt engineering rules or tactics that apply specifically to this topic."
              }
            },
            required: ["critique", "optimizedPrompts", "tips"]
          }
        }
      });

      const textOutput = response.text || "{}";
      const parsedData = JSON.parse(textOutput);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Optimize API error:", error);
      res.status(500).json({ error: error.message || "An error occurred during optimization." });
    }
  });

  // API Route 3: Chained Multi-Step Workflows (Ideate, Draft, Polish)
  app.post("/api/prompt/workflow", async (req, res) => {
    try {
      const { step, inputs } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      let systemInstruction = "";
      let userPrompt = "";

      if (step === "ideate") {
        systemInstruction = "You are a creative brainstorming engine designed to generate distinct, high-concept narrative paths, outlines, or structural variations for any topic. Output a brief JSON response.";
        userPrompt = `Please brainstorm exactly 3 distinct, compelling concepts or outlines on the topic: "${inputs.topic}". For each concept, provide a bold/inviting "conceptTitle", a "oneSentenceHook" and a bulleted list of "keySections" (usually 3 main components). Provide output as a structured JSON array.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.9,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  conceptTitle: { type: Type.STRING },
                  oneSentenceHook: { type: Type.STRING },
                  keySections: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["conceptTitle", "oneSentenceHook", "keySections"]
              }
            }
          }
        });

        return res.json({ result: JSON.parse(response.text || "[]") });

      } else if (step === "draft") {
        const { conceptTitle, hook, sections, style, length } = inputs;
        systemInstruction = `You are an elite, highly adaptive copywriter. Write a stunning piece of creative draft based on the selected brainstorming concept. Match the writing style format: ${style || "Narrative/Expressive"}. Make the length: ${length || "Medium (300-500 words)"}.`;
        userPrompt = `Write the full creative draft following this selected concept:\nTitle: ${conceptTitle}\nHook: ${hook}\nOutlined sections: ${JSON.stringify(sections)}\n\nEnsure fluid, compelling prose. Format with markdown headings if appropriate. Highlight emotional resonance or technical clarity depending on the style.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        return res.json({ result: response.text });

      } else if (step === "polish") {
        const { draftText, focusArea } = inputs;
        systemInstruction = "You are a meticulous professional editor, content critic, and writing coach.";
        userPrompt = `Critically analyze and polish the following draft writing. Pay careful attention to the user's requested focus area: ${focusArea || "Overall flow & prose quality"}.\n\nDraft content to evaluate:\n---\n${draftText}\n---\n\nGenerate a final polished version of the draft followed by clear constructive feedback. Design your output with distinct sections:\n1. A "critique" summarizing strengths and weaknesses regarding "${focusArea}"\n2. 3 actionable "improvementsMade" bullets\n3. The complete revised "polishedText". Output as a JSON schema response.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                critique: { type: Type.STRING, description: "Detailed 2-3 sentence editorial review." },
                improvementsMade: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of exact cosmetic/syntactic changes made."
                },
                polishedText: { type: Type.STRING, description: "The full final polished markdown text block." }
              },
              required: ["critique", "improvementsMade", "polishedText"]
            }
          }
        });

        return res.json({ result: JSON.parse(response.text || "{}") });

      } else {
        return res.status(400).json({ error: "Invalid workflow step requested." });
      }
    } catch (error: any) {
      console.error("Workflow API error:", error);
      res.status(500).json({ error: error.message || "An error occurred during workflow step execution." });
    }
  });

  // Serve Vite in development, static in production
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
    // Serve SPA index.html for all routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
