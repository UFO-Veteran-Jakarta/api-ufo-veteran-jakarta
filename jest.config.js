module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./setup/setupTestEnvironment.js"],
  moduleDirectories: ["node_modules", "src"],
  rootDir: "tests",
  moduleNameMapper: {
    "^src/(.*)": "<rootDir>/../src/$1",
  },
  // moduleNameMapper: {
  //   "^@/(.*)$": "<rootDir>/src/$1",
  // },
};
