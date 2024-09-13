module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup/setupTestEnvironment.js'],
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/src/$1',
  },
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  moduleDirectories: ['node_modules', 'src'],
};
