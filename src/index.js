require("dotenv").config();

const readline = require("readline");
const path = require("path");
const fs = require("fs");

const ANSWERS = {
  YES: 'y',
}

const {
  downloadMp3FromYoutubeUrl,
} = require("./services/download-mp3-from-youtube-url");
const { convertAudioToText } = require("./services/whisper");

fs.mkdirSync(path.resolve("tmp", "audios"), { recursive: true });
fs.mkdirSync(path.resolve("tmp", "transcriptions"), { recursive: true });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const _25MB = 25 * 1024 * 1024;

rl.question("Ingresa la URL del video de YouTube: ", async (url) => {
  console.log("Comenzando descarga...");
  const { output, filename } = await downloadMp3FromYoutubeUrl(url);
  const file = fs.readFileSync(output);

  console.log(
    "[Descarga finalizada]",
    output.split(path.sep).slice(-3).join("/")
  );

  if (file.byteLength > _25MB) {
    console.log(
      "El archivo es demasiado grande para ser procesado por OpenAI, lo siento :("
    );
    rl.close();
    return;
  }

  rl.question("Deseas convertir el audio a texto? (y/n): ", async (answer) => {
    if (answer === ANSWERS.YES) {
      console.log("Comenzando conversión...");
      const text = await convertAudioToText(output);
      fs.writeFileSync(
        path.resolve("tmp", "transcriptions", `${filename}.txt`),
        text
      );
      console.log("[Conversión finalizada]", text);
    }
    rl.close();
  });
});
