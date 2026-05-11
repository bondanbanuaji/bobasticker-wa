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
    // -vf: scale to 512x512, keeping aspect ratio (pad with transparent)
    // -loop 0: infinite loop
    // -lossless 0: not lossless (to keep size small)
    // -quality 75: quality for compression
    // -an: remove audio
    // -vsync 0: variable frame rate
    const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -c:v libwebp -loop 0 -pix_fmt yuva420p -lossless 0 -quality 75 -compression_level 6 -an -vsync 0 "${outputPath}"`;
    
    await execPromise(ffmpegCmd);

    // 3. Read the output file back into a buffer
    const outputBuffer = await fs.promises.readFile(outputPath);
    return outputBuffer;
  } catch (error) {
    console.error("[videoProcessor] FFmpeg Error:", error);
    throw new Error("Gagal memproses video menjadi stiker gerak.");
  } finally {
    // 4. Cleanup temporary files
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  }
}

module.exports = { processVideoToSticker };
