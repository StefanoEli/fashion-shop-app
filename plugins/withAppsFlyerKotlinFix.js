// Local Expo config plugin.
//
// Why this exists:
// react-native-appsflyer's android/build.gradle pins its Kotlin stdlib via
//   implementation "org.jetbrains.kotlin:kotlin-stdlib:${safeExtGet('kotlin_stdlib_version', '2.4.10')}"
// The default (2.4.10) is NEWER than the Kotlin compiler bundled with the
// current Expo SDK / React Native (2.1.20). That mismatch makes the AppsFlyer
// module fail to compile in the cloud EAS build ("Module was compiled with an
// incompatible version of Kotlin ... Unresolved reference 'mapOf'", etc.).
//
// safeExtGet reads rootProject.ext, so we simply publish a compatible
// kotlin_stdlib_version on the Android root project.

const { withProjectBuildGradle } = require('@expo/config-plugins');

// Keep this aligned with the Kotlin version used by the installed RN/Expo SDK.
const KOTLIN_STDLIB_VERSION = '2.1.20';

const MARKER = 'kotlin_stdlib_version';

function withAppsFlyerKotlinFix(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error(
        'withAppsFlyerKotlinFix is only supported for the groovy build.gradle.'
      );
    }

    if (cfg.modResults.contents.includes(MARKER)) {
      return cfg; // already applied
    }

    const snippet = `\next {\n    ${MARKER} = "${KOTLIN_STDLIB_VERSION}"\n}\n`;
    // Prepend so rootProject.ext is set before any subproject build.gradle
    // (react-native-appsflyer) is evaluated.
    cfg.modResults.contents = snippet + cfg.modResults.contents;
    return cfg;
  });
}

module.exports = withAppsFlyerKotlinFix;
