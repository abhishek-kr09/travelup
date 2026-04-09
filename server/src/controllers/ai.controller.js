import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY?.trim();
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const modelCandidates = [
  process.env.GEMINI_MODEL,
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-flash-8b",
].filter(Boolean);

export const generateListingDescription = async (req, res) => {
  if (!genAI) {
    return res.status(500).json({
      success: false,
      message: "GEMINI_API_KEY is not configured on the server",
    });
  }

  const {
    title = "",
    location = "",
    country = "",
    category = "",
    price,
    tone = "warm, premium, and trustworthy",
  } = req.body || {};

  if (!title.trim() && !location.trim() && !category.trim()) {
    return res.status(400).json({
      success: false,
      message: "Provide at least title, location, or category to generate description",
    });
  }

  const prompt = [
    "You write Airbnb-style listing descriptions.",
    "Generate one concise paragraph (80-130 words), professional and inviting.",
    "Do not use markdown, emojis, bullet points, or fake promises.",
    `Title: ${title || "N/A"}`,
    `Location: ${location || "N/A"}`,
    `Country: ${country || "N/A"}`,
    `Category: ${category || "N/A"}`,
    `Price per night: ${price || "N/A"}`,
    `Tone: ${tone}`,
  ].join("\n");

  try {
    let description = "";
    let lastError = null;

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          "You are an expert vacation rental copywriter. Keep output factual and concise.",
          prompt,
        ]);
        description = result?.response?.text()?.trim() || "";
        if (description) break;
      } catch (modelErr) {
        lastError = modelErr;
      }
    }

    if (!description) {
      if (lastError) throw lastError;
      return res.status(502).json({
        success: false,
        message: "AI did not return description content",
      });
    }

    return res.status(200).json({
      success: true,
      data: { description },
    });
  } catch (err) {
    const errMsg = String(err?.message || "");
    if (err?.status === 401 || /api key|API key|API_KEY_INVALID/i.test(errMsg)) {
      return res.status(502).json({
        success: false,
        message: "Gemini API key is invalid. Update GEMINI_API_KEY in server .env and restart backend.",
      });
    }

    if (err?.status === 404 || /models\/.+not found|is not found|not supported for generateContent/i.test(errMsg)) {
      return res.status(502).json({
        success: false,
        message: "Configured Gemini model is unavailable. Set GEMINI_MODEL=gemini-flash-latest and restart backend.",
      });
    }

    if (err?.status === 429 || /quota|rate limit|Too Many Requests/i.test(errMsg)) {
      return res.status(429).json({
        success: false,
        message: "Gemini quota exceeded or billing not active. Enable billing/quota in Google AI Studio and try again.",
      });
    }

    return res.status(502).json({
      success: false,
      message: "AI service temporarily unavailable. Please try again.",
    });
  }
};
