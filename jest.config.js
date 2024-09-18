module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup/setupTestEnvironment.js'],
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/src/$1',
  },
  coverageThreshold: {
    global: {
      branches: 78,
      functions: 85,
      lines: 80,
      statements: 80,
    },
  },
  moduleDirectories: ['node_modules', 'src'],
};
