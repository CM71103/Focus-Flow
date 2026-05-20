export const APP_PACKAGE_MAP: Record<string, string> = {
    'Instagram': 'com.instagram.android',
    'TikTok': 'com.zhiliaoapp.musically',
    'Twitter / X': 'com.twitter.android',
    'Reddit': 'com.reddit.frontpage',
    'WhatsApp': 'com.whatsapp',
    'YouTube': 'com.google.android.youtube',
    'Facebook': 'com.facebook.katana',
    'Snapchat': 'com.snapchat.android',
    'Telegram': 'org.telegram.messenger',
    'Messenger': 'com.facebook.orca',
    'Discord': 'com.discord',
    'Pinterest': 'com.pinterest',
    'Twitch': 'tv.twitch.android.app',
    'Netflix': 'com.netflix.mediaclient',
    'Spotify': 'com.spotify.music',
    'Amazon Shopping': 'com.amazon.mShop.android.shopping',
    'Flipkart': 'com.flipkart.android',
    'Candy Crush': 'com.king.candycrushsaga',
    'Clash of Clans': 'com.supercell.clashofclans',
    'PUBG Mobile': 'com.tencent.ig',
    'Gmail': 'com.google.android.gm',
    'Chrome': 'com.android.chrome',
    'Google Maps': 'com.google.android.apps.maps',
    'LinkedIn': 'com.linkedin.android',
}

export function getAppPackageName(appName: string): string {
    return APP_PACKAGE_MAP[appName] || appName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')
}

export function getAppNameByPackage(packageName: string): string {
    for (const [name, pkg] of Object.entries(APP_PACKAGE_MAP)) {
        if (pkg === packageName) return name
    }
    return packageName
}

export const POPULAR_APPS = Object.keys(APP_PACKAGE_MAP).sort()
