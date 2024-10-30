module.exports = {
  upload: {
    baseDir: './public',
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedFileTypes: ['webp', 'png', 'jpg', 'jpeg'],
    markAsLargeFile: 16 * 1024 * 1024, // >16MB
  },
};
