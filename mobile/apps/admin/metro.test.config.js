const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Minimal config - no watchFolders for testing
config.watchFolders = [];

config.resolver.blockList = [];

// Disable transformer caching
config.transformer = config.transformer || {};
config.transformer.enableBabelRCLookup = false;

module.exports = config;
