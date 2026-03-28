/**
 * Config plugin that fixes the non-modular header error when using
 * @react-native-firebase with useFrameworks: 'static' in Expo managed workflow.
 *
 * Error fixed:
 *   include of non-modular header inside framework module 'RNFBApp.*'
 *   [-Werror,-Wnon-modular-include-in-framework-module]
 *
 * Fix: sets DEFINES_MODULE = YES for all pod targets in the post_install hook,
 * which allows the Firebase pods to include React Native headers as modular.
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

      const result = mergeContents({
        tag: 'rnfirebase-defines-module-fix',
        src: contents,
        newSrc: [
          '  installer.pods_project.targets.each do |target|',
          '    target.build_configurations.each do |config|',
          "      config.build_settings['DEFINES_MODULE'] = 'YES'",
          '    end',
          '  end',
        ].join('\n'),
        anchor: /post_install do \|installer\|/,
        offset: 1,
        comment: '#',
      });

      if (result.didMerge || result.didClear) {
        fs.writeFileSync(podfilePath, result.contents);
      }

      return config;
    },
  ]);
}

module.exports = withFirebaseStaticFrameworkFix;
