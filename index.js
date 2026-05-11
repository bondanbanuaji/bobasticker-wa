/**
 * BobaSticker 3.0 - All Rights Reserved
 * Copyright (c) 2026 BobaSticker
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const qrcodeWeb = require('qrcode'); // To generate base64 for web
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const qrcodeTerminal = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { getCommandAndArgs, isRelevantMessage } = require('./lib/messageHelper');
const { verifyAdmin, logActivity } = require('./lib/auth');

// Import handlers
const stickerHandler = require('./lib/commands/sticker');
const gerakHandler = require('./lib/commands/gerak');
const pingHandler = require('./lib/commands/ping');
const helpHandler = require('./lib/commands/help');

const PREFIX = process.env.PREFIX || '.';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to get allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://bobasticker-wa.vercel.app',
  FRONTEND_URL
].filter((val, index, self) => self.indexOf(val) === index);

// ─────────────────────────────────────────────
// Setup Express
// ─────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BobaSticker API is running' });
});

const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// Setup Socket.io
// ─────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io Authentication Middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  const isAdmin = await verifyAdmin(token);
  if (isAdmin) {
    next();
  } else {
    next(new Error("Authentication error: Invalid or unauthorized token"));
  }
});

// ─────────────────────────────────────────────
// Logging Helpers
// ─────────────────────────────────────────────
const TAG = {
  CMD:   '📨 [CMD]  ',
  OK:    '✅ [OK]   ',
  WARN:  '⚠️  [WARN] ',
  ERR:   '❌ [ERR]  ',
  INFO:  '💬 [INFO] ',
  CONN:  '🔌 [CONN] ',
};

function timestamp() {
  return new Date().toLocaleTimeString('id-ID', { hour12: false });
}

function log(tag, message, extra = '') {
  const t = `\x1b[90m${timestamp()}\x1b[0m`;
  const extraStr = extra ? `\x1b[90m | ${extra}\x1b[0m` : '';
  console.log(`${t} ${tag}${message}${extraStr}`);
}

// Format JID menjadi lebih mudah dibaca (ambil nomor / nama grup)
function formatJid(jid = '') {
  if (!jid) return 'unknown';
  if (jid.includes('@g.us')) return `Grup(${jid.split('@')[0]})`;
  if (jid.includes('@lid')) return `LID(${jid.split('@')[0].slice(-8)})`;
  return jid.replace('@s.whatsapp.net', '');
}

// ─────────────────────────────────────────────
// Bot State & Config
// ─────────────────────────────────────────────
let sock;
let botStatus = 'offline'; 
let currentQr = null;
let botConfig = { prefix: '.', maintenance: false };
let stats = { messagesProcessed: 0, startTime: Date.now() };

async function loadConfig() {
  try {
    const { prisma } = require('./lib/auth');
    let config = await prisma.botConfig.findUnique({ where: { id: 'default' } });
    if (!config) {
      config = await prisma.botConfig.create({ data: { id: 'default', prefix: '.', maintenance: false } });
    }
    botConfig = config;
    log(TAG.INFO, `Config loaded: Prefix="${botConfig.prefix}", Maintenance=${botConfig.maintenance}`);
  } catch (err) {
    log(TAG.ERR, 'Failed to load bot config from DB', err.message);
  }
}

function broadcastState() {
  io.emit('state', { 
    status: botStatus, 
    qr: currentQr, 
    config: botConfig,
    stats: {
      ...stats,
      uptime: Date.now() - stats.startTime
    }
  });
}

async function getAdvancedStats() {
  try {
    const { prisma } = require('./lib/auth');
    const totalStickers = await prisma.activityLog.count({
      where: { action: 'sticker_created' }
    });
    const totalMessages = await prisma.activityLog.count({
      where: { 
        OR: [
          { action: 'sticker_created' },
          { action: 'command_error' },
          { action: { startsWith: 'cmd_' } }
        ]
      }
    });
    return { totalStickers, totalMessages };
  } catch (err) {
    return { totalStickers: 0, totalMessages: 0 };
  }
}

async function broadcastStats() {
  const advancedStats = await getAdvancedStats();
  io.emit('state', { 
    status: botStatus, 
    qr: currentQr, 
    config: botConfig,
    stats: {
      ...stats,
      messagesProcessed: advancedStats.totalMessages, // Use DB count for accuracy
      totalStickers: advancedStats.totalStickers,
      uptime: Date.now() - stats.startTime
    }
  });
}

async function broadcastLogs() {
  try {
    const { prisma } = require('./lib/auth');
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    io.emit('logs', logs);
  } catch (err) {
    log(TAG.ERR, 'Failed to broadcast logs', err.message);
  }
}

io.on('connection', async (socket) => {
  log(TAG.INFO, 'Admin connected to dashboard socket.');
  await broadcastStats();
  broadcastLogs();

  // Heartbeat to update uptime and stats every 10 seconds
  const heartbeat = setInterval(() => {
    broadcastStats();
  }, 10000);

  socket.on('disconnect', () => {
    clearInterval(heartbeat);
  });

  socket.on('logout', async () => {
    log(TAG.INFO, 'Menerima request logout dari dashboard web.');
    await logActivity('bot_logout', 'admin_dashboard', { source: 'web_ui' }); 
    if (sock) {
      await sock.logout();
    } else {
      clearAuthState();
      startBot();
    }
  });

  socket.on('restart', async () => {
    log(TAG.INFO, 'Menerima request restart dari dashboard web.');
    await logActivity('bot_restart', 'admin_dashboard', { source: 'web_ui' });
    if (sock) {
      sock.end(undefined);
    }
    setTimeout(() => startBot(), 2000);
  });

  socket.on('update_config', async (newConfig) => {
    try {
      const { prisma } = require('./lib/auth');
      botConfig = await prisma.botConfig.update({
        where: { id: 'default' },
        data: {
          prefix: newConfig.prefix || botConfig.prefix,
          maintenance: newConfig.maintenance !== undefined ? newConfig.maintenance : botConfig.maintenance
        }
      });
      log(TAG.OK, 'Config updated via dashboard.');
      logActivity('update_config', 'admin_socket', { newConfig });
      broadcastStats();
    } catch (err) {
      log(TAG.ERR, 'Failed to update config', err.message);
    }
  });

  socket.on('broadcast', async ({ jid, message }) => {
    if (!sock || botStatus !== 'connected') return;
    try {
      await sock.sendMessage(jid.includes('@') ? jid : `${jid}@s.whatsapp.net`, { text: message });
      log(TAG.OK, `Broadcast sent to ${jid}`);
      await logActivity('broadcast', 'admin_dashboard', { jid, message });
      broadcastStats();
    } catch (err) {
      log(TAG.ERR, 'Failed to send broadcast', err.message);
    }
  });
});

function clearAuthState() {
  const authDir = path.join(__dirname, 'auth_info_baileys');
  if (fs.existsSync(authDir)) {
    fs.rmSync(authDir, { recursive: true, force: true });
    log(TAG.OK, 'Auth state terhapus.');
  }
}

// ─────────────────────────────────────────────
// Bot Core
// ─────────────────────────────────────────────

async function startBot() {
  await loadConfig();
  botStatus = 'connecting';
  currentQr = null;
  broadcastStats();

  log(TAG.INFO, 'Mengambil versi WA Web terbaru...');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  log(TAG.INFO, `WA Web v${version.join('.')} — isLatest: ${isLatest ? 'ya ✅' : 'tidak ⚠️'}`);

  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  sock = makeWASocket({
    auth: state,
    version,
    browser: Browsers.windows('Desktop'),
    logger: pino({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      botStatus = 'qr';
      try {
        currentQr = await qrcodeWeb.toDataURL(qr);
      } catch (err) {
        log(TAG.ERR, 'Gagal generate QR untuk web', err.message);
      }
      broadcastStats();
      
      console.log('\n📱 Scan QR Code ini dengan WhatsApp di HP kamu:\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const err = new Boom(lastDisconnect?.error);
      const statusCode = err?.output?.statusCode;
      const reason = err?.output?.payload?.message || 'Unknown';
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      log(TAG.CONN, `Koneksi terputus — code: ${statusCode}, alasan: "${reason}"`);
      botStatus = 'offline';
      currentQr = null;
      broadcastStats();

      if (statusCode === DisconnectReason.loggedOut) {
        log(TAG.WARN, 'Sesi logout. Menghapus auth state...');
        clearAuthState();
        log(TAG.INFO, 'Restart bot untuk scan QR baru.');
        setTimeout(() => startBot(), 3000); 
      } else if (shouldReconnect) {
        log(TAG.CONN, 'Reconnecting dalam 3 detik...');
        setTimeout(() => startBot(), 3000);
      }
    } else if (connection === 'open') {
      log(TAG.OK, 'WhatsApp Bot ONLINE! 🚀');
      botStatus = 'connected';
      currentQr = null;
      broadcastStats();
      broadcastLogs();
    } else if (connection === 'connecting') {
      log(TAG.CONN, 'Menghubungkan ke WhatsApp...');
      botStatus = 'connecting';
      broadcastStats();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    if (!isRelevantMessage(msg)) return;

    const { command, args } = getCommandAndArgs(msg, botConfig.prefix);
    if (!command) return;

    const from = formatJid(msg.key.remoteJid);
    const pushName = msg.pushName || 'User';
    const msgType = msg.message.imageMessage
      ? 'image'
      : msg.message.extendedTextMessage
      ? 'text+quote'
      : 'text';

    log(TAG.CMD, `\x1b[1m${botConfig.prefix}${command}\x1b[0m`, `dari: ${from} (${pushName}) | tipe: ${msgType}`);

    // Maintenance Mode Check
    if (botConfig.maintenance) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'maaf, kita lagi maintenance sebentar. coba lagi nanti ya ^_^' }, { quoted: msg });
      log(TAG.WARN, `Maintenance Mode Aktif | Mengabaikan command ${botConfig.prefix}${command} dari: ${from}`);
      return;
    }

    stats.messagesProcessed++;
    broadcastStats();

    try {
      switch (command) {
        case 's':
        case 'sticker':
          await stickerHandler(sock, msg);
          log(TAG.OK, `.sticker selesai diproses`, `untuk: ${from}`);
          await logActivity('sticker_created', 'system', { 
            sender: from, 
            pushName: pushName,
            type: msgType,
            chatId: msg.key.remoteJid 
          });
          break;
        case 'gerak':
        case 'sg':
          await gerakHandler(sock, msg);
          log(TAG.OK, `.gerak selesai diproses`, `untuk: ${from}`);
          await logActivity('sticker_created', 'system', { 
            sender: from, 
            pushName: pushName,
            type: 'video',
            chatId: msg.key.remoteJid 
          });
          break;
        case 'ping':
          await pingHandler(sock, msg);
          log(TAG.OK, `.ping dibalas`, `untuk: ${from}`);
          await logActivity('cmd_ping', 'system', { sender: from, pushName });
          break;
        case 'help':
          await helpHandler(sock, msg, botConfig.prefix);
          log(TAG.OK, `.help dikirim`, `untuk: ${from}`);
          await logActivity('cmd_help', 'system', { sender: from, pushName });
          break;
        default:
          log(TAG.WARN, `Command tidak dikenal: ${botConfig.prefix}${command}`, `dari: ${from}`);
          break;
      }
      broadcastLogs(); // Broadcast entire list to ensure consistency
    } catch (error) {
      log(TAG.ERR, `Error di command ${botConfig.prefix}${command}: ${error.message}`, `dari: ${from}`);
      await logActivity('command_error', 'system', { 
        command, 
        error: error.message, 
        sender: from 
      });
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: 'Waduh, ada error waktu proses command ini. 🥲' },
        { quoted: msg }
      );
      broadcastLogs();
    }
  });
}

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
server.listen(PORT, () => {
  log(TAG.INFO, `API Server berjalan di http://localhost:${PORT}`);
  startBot();
});
