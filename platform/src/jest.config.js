process.NODE_ENV = 'test';
module.exports = {
  verbose: true,
  coverageReporters: ['json-summary', 'lcov'],
  moduleFileExtensions: ['js', 'json', 'vue'],
  setupFiles: ['./jest.init.js'],
  testMatch: ['**/__tests__/**/*.spec.js'],
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.js$': './../node_modules/babel-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  coveragePathIgnorePatterns: [],
  coverageDirectory: './../coverage/',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    'jest.config.js',
    '.eslintrc.js',
    'main.js',
    'router/index.js',
    'router/guard.js',
  ],
  collectCoverageFrom: ['./**/*.{js,vue}', '!**/node_modules/**'],
  transformIgnorePatterns: ['/node_modules/'],
  bail: true,
};
