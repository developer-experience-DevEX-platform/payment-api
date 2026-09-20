module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/integration/**/*.test.ts'],
  testTimeout: 60_000,
  transform: {
    '^.+\\.ts$': 'babel-jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
