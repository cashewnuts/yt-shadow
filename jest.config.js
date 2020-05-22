module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.{js,ts,jsx,tsx}', '!<rootDir>/node_modules/'],
  testPathIgnorePatterns: ['/node_modules/', '.data.[jt]s$'],
}
