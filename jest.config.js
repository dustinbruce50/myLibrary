module.exports = {
  preset: 'react-native',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{ts,tsx}', '!src/utils/colors.tsx', '!src/utils/types.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-screens|react-native-safe-area-context)/)',
  ],
};
