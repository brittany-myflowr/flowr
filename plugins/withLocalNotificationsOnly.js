const { withEntitlementsPlist, withFinalizedMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * flowr only uses on-device scheduled reminders (local notifications).
 * expo-notifications always adds aps-environment, which requires the Push
 * Notifications capability on the provisioning profile. Strip it after all
 * other entitlement mods so Ad Hoc / App Store profiles without Push still build.
 */
function withLocalNotificationsOnly(config) {
  config = withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });

  // Finalized pass: entitlements file on disk (autolinking order can re-add the key).
  config = withFinalizedMod(config, [
    'ios',
    async (cfg) => {
      const iosRoot = cfg.modRequest.platformProjectRoot;
      const stripFromFile = (filePath) => {
        const original = fs.readFileSync(filePath, 'utf8');
        if (!original.includes('aps-environment')) return;
        const next = original.replace(
          /\s*<key>aps-environment<\/key>\s*<string>[^<]*<\/string>/g,
          '',
        );
        if (next !== original) fs.writeFileSync(filePath, next);
      };
      const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.name.endsWith('.entitlements')) stripFromFile(full);
        }
      };
      walk(iosRoot);
      return cfg;
    },
  ]);

  return config;
}

module.exports = withLocalNotificationsOnly;
