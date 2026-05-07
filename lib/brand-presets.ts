export type BrandPreset = {
    name: string
    domain: string
    /** simpleicons.org slug — see https://simpleicons.org for the full list. */
    iconSlug: string
    brandColor: string
    aliases?: string[]
}

/**
 * Curated list of popular subscription services. Used to auto-suggest a
 * domain, brand colour, and icon when the user types a service name.
 *
 * Adding a service is as simple as appending another entry — no asset bundling
 * required. Logos render via the `simpleicons` CDN at runtime.
 */
export const BRAND_PRESETS: BrandPreset[] = [
    { name: 'Netflix', domain: 'netflix.com', iconSlug: 'netflix', brandColor: '#E50914' },
    { name: 'Spotify', domain: 'spotify.com', iconSlug: 'spotify', brandColor: '#1DB954' },
    { name: 'Apple TV+', domain: 'tv.apple.com', iconSlug: 'appletv', brandColor: '#000000', aliases: ['apple tv', 'appletv'] },
    { name: 'Apple Music', domain: 'music.apple.com', iconSlug: 'applemusic', brandColor: '#FA243C' },
    { name: 'iCloud+', domain: 'icloud.com', iconSlug: 'icloud', brandColor: '#3693F3', aliases: ['icloud'] },
    { name: 'Disney+', domain: 'disneyplus.com', iconSlug: 'disneyplus', brandColor: '#0E47BA', aliases: ['disney plus', 'disney'] },
    { name: 'HBO Max', domain: 'max.com', iconSlug: 'max', brandColor: '#002BE7', aliases: ['max', 'hbo'] },
    { name: 'YouTube Premium', domain: 'youtube.com', iconSlug: 'youtube', brandColor: '#FF0000', aliases: ['youtube'] },
    { name: 'Amazon Prime', domain: 'amazon.com', iconSlug: 'amazonprime', brandColor: '#00A8E1', aliases: ['prime', 'amazon'] },
    { name: 'Hulu', domain: 'hulu.com', iconSlug: 'hulu', brandColor: '#1CE783' },
    { name: 'Paramount+', domain: 'paramountplus.com', iconSlug: 'paramountplus', brandColor: '#0064FF', aliases: ['paramount'] },
    { name: 'Peacock', domain: 'peacocktv.com', iconSlug: 'peacock', brandColor: '#000000' },
    { name: 'Crunchyroll', domain: 'crunchyroll.com', iconSlug: 'crunchyroll', brandColor: '#F47521' },
    { name: 'Twitch', domain: 'twitch.tv', iconSlug: 'twitch', brandColor: '#9146FF' },

    { name: 'ChatGPT', domain: 'openai.com', iconSlug: 'openai', brandColor: '#10A37F', aliases: ['openai', 'chat gpt'] },
    { name: 'Claude', domain: 'anthropic.com', iconSlug: 'anthropic', brandColor: '#D97757' },
    { name: 'Cursor', domain: 'cursor.com', iconSlug: 'cursor', brandColor: '#FFFFFF' },
    { name: 'GitHub', domain: 'github.com', iconSlug: 'github', brandColor: '#FFFFFF' },
    { name: 'Vercel', domain: 'vercel.com', iconSlug: 'vercel', brandColor: '#FFFFFF' },
    { name: 'Linear', domain: 'linear.app', iconSlug: 'linear', brandColor: '#5E6AD2' },
    { name: 'Figma', domain: 'figma.com', iconSlug: 'figma', brandColor: '#F24E1E' },
    { name: 'Framer', domain: 'framer.com', iconSlug: 'framer', brandColor: '#FFFFFF' },
    { name: 'Notion', domain: 'notion.so', iconSlug: 'notion', brandColor: '#FFFFFF' },
    { name: 'Slack', domain: 'slack.com', iconSlug: 'slack', brandColor: '#4A154B' },
    { name: 'Dropbox', domain: 'dropbox.com', iconSlug: 'dropbox', brandColor: '#0061FF' },
    { name: 'Google One', domain: 'one.google.com', iconSlug: 'googleone', brandColor: '#4285F4', aliases: ['google one', 'gdrive', 'google drive'] },
    { name: 'Microsoft 365', domain: 'microsoft.com', iconSlug: 'microsoft', brandColor: '#F25022', aliases: ['office 365', 'microsoft 365'] },
    { name: '1Password', domain: '1password.com', iconSlug: '1password', brandColor: '#0572EC' },
    { name: 'Audible', domain: 'audible.com', iconSlug: 'audible', brandColor: '#F7991C' },
    { name: 'New York Times', domain: 'nytimes.com', iconSlug: 'newyorktimes', brandColor: '#FFFFFF', aliases: ['nyt'] },
    { name: 'Duolingo', domain: 'duolingo.com', iconSlug: 'duolingo', brandColor: '#58CC02' },
]
