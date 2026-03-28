import axios from "axios";

export const translateText = async (text, targetLang) => {
  try {
    const res = await axios.post(
      `https://translation.googleapis.com/language/translate/v2`,
      {},
      {
        params: {
          q: text,
          target: targetLang,
          key: process.env.GOOGLE_TRANSLATE_API_KEY
        }
      }
    );

    return res.data.data.translations[0].translatedText;

  } catch (error) {
    console.log("Translation error:", error.message);
    return text; // fallback
  }
};