const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.watchFolders = [...(config.watchFolders || []), path.resolve(projectRoot, '../../packages/shared')];

config.resolver.blockList = [
  /@easyryde[/\\]shared[/\\]node_modules/,
];

module.exports = config;
