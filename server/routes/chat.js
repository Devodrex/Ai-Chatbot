import express from "express";
import Session from "../models/Session.js";
import OpenAI from "openai";

const router = express.Router();

// 🔥 Lazy init (fix env timing issue)
function getClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
}


// ===============================
// CREATE SESSION
// ===============================
router.post("/session", async (req, res) => {
  const session = await Session.create({});
  res.json({ sessionId: session._id });
});


// ===============================
// GET ALL SESSIONS
// ===============================
router.get("/sessions", async (req, res) => {
  const sessions = await Session.find().sort({ updatedAt: -1 });

  res.json(
    sessions.map((s) => ({
      id: s._id,
      title: s.title,
      preview: s.messages[0]?.content || "Empty chat",
    }))
  );
});


// ===============================
// GET SINGLE SESSION
// ===============================
router.get("/sessions/:id", async (req, res) => {
  const session = await Session.findById(req.params.id);
  res.json(session?.messages || []);
});


// ===============================
// CHAT (GROQ)
// ===============================
router.post("/chat-stream", async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    let session = await Session.findById(sessionId);

    if (!session) {
      session = await Session.create({});
    }

    // Save user message
    session.messages.push({
      role: "user",
      content: message,
    });

    // Set title
    if (session.messages.length === 1) {
      session.title = message.slice(0, 30);
    }

    await session.save();

    // 🔥 AI CALL
    const client = getClient();

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ current working model
      messages: session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const reply = completion.choices[0].message.content;

    // Save AI reply
    session.messages.push({
      role: "assistant",
      content: reply,
    });

    await session.save();

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});


// ===============================
// RENAME SESSION
// ===============================
router.put("/sessions/:id", async (req, res) => {
  const { title } = req.body;

  const session = await Session.findByIdAndUpdate(
    req.params.id,
    { title },
    { new: true }
  );

  res.json(session);
});


// ===============================
// DELETE SESSION
// ===============================
router.delete("/sessions/:id", async (req, res) => {
  await Session.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;