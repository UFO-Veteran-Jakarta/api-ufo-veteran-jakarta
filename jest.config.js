module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup/setupTestEnvironment.js"],
  moduleNameMapper: {
    "^src/(.*)": "<rootDir>/src/$1",
  },
  detectOpenHandles: true,
  moduleDirectories: ["node_modules", "src"],
};
