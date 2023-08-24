const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");

/**
 *
 * @param {*} path url mp3
 */
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const convertAudioToText = async (path) => {
  if (!fs.existsSync(path)) {
    throw new Error("No se encuentra el archivo");
  }

  try {
    const resp = await openai.createTranscription(
      fs.createReadStream(path),
      "whisper-1"
    );

    return resp.data.text;
  } catch (err) {
    console.error(err);
    return "ERROR";
  }
};

module.exports = { convertAudioToText };
