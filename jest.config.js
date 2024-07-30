module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup/setupTestEnvironment.js"],
  moduleNameMapper: {
    "^src/(.*)": "<rootDir>/src/$1",
  },
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 75,
      lines: 70,
      statements: 70,
    },
  },

  moduleDirectories: ["node_modules", "src"],
};
