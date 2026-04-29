const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);
const cssShimPath = path.resolve(__dirname, "assets/css-shim.js");

config.resolver.sourceExts = ["css", ...config.resolver.sourceExts];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith(".css")) {
    return { filePath: cssShimPath, type: "sourceFile" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
