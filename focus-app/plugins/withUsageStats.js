const { withAppBuildGradle, withAndroidManifest, withPlugins } = require('@expo/config-plugins')

const USAGE_STATS_PERMISSION = 'android.permission.PACKAGE_USAGE_STATS'

function withUsageStatsPermission(config) {
    return withAndroidManifest(config, (modConfig) => {
        const manifest = modConfig.modResults

        if (!manifest.manifest['uses-permission']) {
            manifest.manifest['uses-permission'] = []
        }

        const hasPermission = manifest.manifest['uses-permission'].some(
            (perm) => perm.$ && perm.$['android:name'] === USAGE_STATS_PERMISSION
        )

        if (!hasPermission) {
            manifest.manifest['uses-permission'].push({
                $: {
                    'android:name': USAGE_STATS_PERMISSION,
                    'tools:ignore': 'ProtectedPermissions',
                },
            })
        }

        return modConfig
    })
}

function withUsageStatsBuildGradle(config) {
    return withAppBuildGradle(config, (modConfig) => {
        let contents = modConfig.modResults.contents

        const dependencies = `
    // Usage Stats native module — source files in app/src/main/java
`

        if (!contents.includes('Usage Stats native module')) {
            const dependenciesMarker = 'dependencies {'
            const insertIndex = contents.indexOf(dependenciesMarker)
            if (insertIndex !== -1) {
                const endOfLine = contents.indexOf('\n', insertIndex)
                contents = contents.slice(0, endOfLine + 1) + dependencies + contents.slice(endOfLine + 1)
            }
        }

        modConfig.modResults.contents = contents
        return modConfig
    })
}

module.exports = function withUsageStats(config) {
    return withPlugins(config, [
        withUsageStatsPermission,
        withUsageStatsBuildGradle,
    ])
}
