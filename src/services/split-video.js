const ffmpeg = require("fluent-ffmpeg");
const { createTmpPathGetter } = require("../utils/ytdl.utils");
const path = require("path");

function splitVideo({ inputFile, folderName, onSplit, onFinish }) {
  // Obtener información del video
  ffmpeg.ffprobe(inputFile, async (err, metadata) => {
    if (err) {
      console.error("Error al obtener metadatos del video:", err);
      return;
    }

    const duration = metadata.format.duration;
    const outputFormat = "mp4"; // Puedes cambiar esto según el formato de salida que desees.

    const getTmpPath = createTmpPathGetter(path.join(folderName, "split"));

    const result = [];
    for (let start = 0; start < duration; start += 60) {
      const outputFileName = getTmpPath(
        `output_${start}-${start + 60}`,
        outputFormat
      );

      await new Promise((resolve, reject) => {
        ffmpeg(inputFile)
          .setStartTime(start)
          .setDuration(60) // Duración de 1 minuto
          .output(outputFileName)
          .on("end", () => {
            console.log(`Segmento ${outputFileName} creado exitosamente.`);
            onSplit && onSplit(outputFileName);
            result.push(outputFileName);
            resolve();
          })
          .on("error", (err) => {
            console.error("Error:", err);
            reject(err);
          })
          .run();
      });
    }

    onFinish && onFinish(result);
  });
}

module.exports = {
  splitVideo,
};
