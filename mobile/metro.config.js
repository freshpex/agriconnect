const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// NativeWind: bypass react-native-css-interop metro transformer which is
// incompatible with Expo SDK 54's internal metro FileSystem API (getSha1).
// Actual className→style transforms are handled by babel (jsxImportSource: "nativewind").
// CSS imports are shimmed to an empty module since only the babel transform matters.
const cssShimPath = path.resolve(__dirname, "assets/css-shim.js");

config.resolver.sourceExts = ["css", ...config.resolver.sourceExts];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith(".css")) {
    return { filePath: cssShimPath, type: "sourceFile" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
