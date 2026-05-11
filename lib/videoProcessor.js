const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { promisify } = require("util");

const execPromise = promisify(exec);

/**
 * Converts a video buffer to an animated WebP sticker buffer.
 * @param {Buffer} videoBuffer - The input video/gif buffer.
 * @returns {Promise<Buffer>} - The processed animated WebP buffer.
 */
async function processVideoToSticker(videoBuffer) {
  const tempId = Date.now();
  const inputPath = path.join(os.tmpdir(), `input_${tempId}`);
  const outputPath = path.join(os.tmpdir(), `output_${tempId}.webp`);

  try {
    // 1. Write buffer to temporary file
    await fs.promises.writeFile(inputPath, videoBuffer);

    // 2. Run FFmpeg command
    // Optimized for WhatsApp stickers: 512x512, 15fps, webp
    const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -c:v libwebp -loop 0 -pix_fmt yuva420p -lossless 0 -quality 70 -compression_level 4 -an -vsync 0 "${outputPath}"`;
    
    try {
      await execPromise(ffmpegCmd);
    } catch (execError) {
      if (execError.message.includes("not found") || execError.code === 127) {
        throw new Error("FFmpeg tidak ditemukan di sistem. Harap instal FFmpeg terlebih dahulu.");
      }
      throw execError;
    }

    // 3. Read the output file back into a buffer
    const outputBuffer = await fs.promises.readFile(outputPath);
    return outputBuffer;
  } catch (error) {
    console.error("[videoProcessor] FFmpeg Error:", error);
    if (error.message.includes("FFmpeg tidak ditemukan")) {
      throw error;
    }
    throw new Error("Gagal memproses video menjadi stiker gerak.");
  } finally {
    // 4. Cleanup temporary files
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (cleanupError) {
      console.warn("[videoProcessor] Cleanup warning:", cleanupError.message);
    }
  }
}

module.exports = { processVideoToSticker };
