const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Batas 100 permintaan per windowMs
  message: 'Terlalu banyak permintaan dari IP ini, coba lagi nanti.',
  standardHeaders: true, // Mengaktifkan header RateLimit
  legacyHeaders: false, // Menonaktifkan header X-RateLimit
});

module.exports = limiter;
