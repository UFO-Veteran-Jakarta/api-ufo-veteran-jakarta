module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup/setupTestEnvironment.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
