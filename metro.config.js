const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

console.log('[metro.config] custom zustand CJS resolution active');

// zustand v5's ESM build ("import" condition) contains `import.meta`, which
// Metro in SDK 54 doesn't transform for web — the bundle then throws
// "Cannot use 'import.meta' outside a module" and the app white-screens.
// Redirect zustand imports to its CommonJS build: Node's require.resolve
// uses the "require" export condition, which maps to the CJS files.
const prevResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
    return { type: 'sourceFile', filePath: require.resolve(moduleName) };
  }
  if (prevResolveRequest) return prevResolveRequest(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
