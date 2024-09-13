module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup/setupTestEnvironment.js'],
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/src/$1',
  },
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  moduleDirectories: ['node_modules', 'src'],
};
