/**
 * Config plugin that fixes build errors when using @react-native-firebase
 * with useFrameworks: 'static' in Expo managed workflow.
 *
 * Applies two fixes:
 *
 * 1. Sets $RNFirebaseAsStaticFramework = true before use_react_native! —
 *    the officially documented RNFirebase flag that configures Firebase pods
 *    correctly for static framework builds. Without this, Firebase pod headers
 *    conflict with React Native's module system causing cascading type errors.
 *
 * 2. Sets CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES in
 *    post_install — suppresses any remaining non-modular header warnings
 *    that survive the $RNFirebaseAsStaticFramework flag.
 */
const { withDangerousMod } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');
const fs = require('fs');
const path = require('path');

function withFirebaseStaticFrameworkFix(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      );
      const contents = fs.readFileSync(podfilePath, 'utf-8');

      // Fix 1: $RNFirebaseAsStaticFramework = true before use_react_native!
      const step1 = mergeContents({
        tag: 'rnfirebase-static-framework-flag',
        src: contents,
        newSrc: '$RNFirebaseAsStaticFramework = true',
        anchor: /use_react_native!/,
        offset: 0,
        comment: '#',
      });

      // Fix 2: CLANG_ALLOW_NON_MODULAR_INCLUDES in post_install
      const step2 = mergeContents({
        tag: 'rnfirebase-non-modular-fix',
        src: step1.contents,
        newSrc: [
          '  installer.pods_project.targets.each do |target|',
          '    target.build_configurations.each do |config|',
          "      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
          '    end',
          '  end',
        ].join('\n'),
        anchor: /post_install do \|installer\|/,
        offset: 1,
        comment: '#',
      });

      if (step1.didMerge || step2.didMerge || step1.didClear || step2.didClear) {
        fs.writeFileSync(podfilePath, step2.contents);
      }

      return config;
    },
  ]);
}

module.exports = withFirebaseStaticFrameworkFix;
