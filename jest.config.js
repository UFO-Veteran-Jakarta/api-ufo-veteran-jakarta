module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup/setupTestEnvironment.js"],
  moduleNameMapper: {
    "^src/(.*)": "<rootDir>/src/$1",
  },
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 75,
    },
  },

  moduleDirectories: ["node_modules", "src"],
};
