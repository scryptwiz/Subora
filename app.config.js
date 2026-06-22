const versionConstants = require("./constants/version.constant");

module.exports = ({ config }) => {
  return {
    ...config,
    version: versionConstants.APP_VERSION,
    runtimeVersion: versionConstants.RUNTIME_VERSION,
    ios: {
      ...config.ios,
      buildNumber: versionConstants.IOS_BUILD_NUMBER,
    },
    android: {
      ...config.android,
      versionCode: versionConstants.ANDROID_VERSION_CODE,
    },
  };
};
