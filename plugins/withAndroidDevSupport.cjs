const { withMainApplication } = require('expo/config-plugins');

// SDK 57's factory defaults to ReactBuildConfig.DEBUG from the React Native AAR.
// Use the application's BuildConfig instead so a debug APK can connect to Metro.
module.exports = function withAndroidDevSupport(config) {
  return withMainApplication(config, (result) => {
    const source = result.modResults.contents;
    if (source.includes('useDevSupport = BuildConfig.DEBUG')) return result;
    if (!source.includes('context = applicationContext,')) {
      throw new Error(
        'No se encontró el factory de React Native para configurar la build Android.',
      );
    }
    result.modResults.contents = source.replace(
      'context = applicationContext,',
      'context = applicationContext,\n      useDevSupport = BuildConfig.DEBUG,',
    );
    return result;
  });
};
