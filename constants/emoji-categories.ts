export type EmojiCategory = {
    id: string
    label: string
    emojis: string[]
}

/**
 * Curated subscription-friendly emoji set. Keeps the picker fast (no
 * native data load, no extra dep) and on-brand for a tracker. Add freely.
 */
export const EMOJI_CATEGORIES: EmojiCategory[] = [
    {
        id: 'media',
        label: 'Media',
        emojis: ['🎬', '🎞️', '🍿', '📺', '🎮', '🕹️', '🎧', '🎵', '🎙️', '📻', '📚', '📖', '📰'],
    },
    {
        id: 'tech',
        label: 'Tech',
        emojis: ['💻', '🖥️', '🖱️', '⌨️', '📱', '☁️', '🛜', '🛰️', '🔐', '🪪', '🤖', '🧠'],
    },
    {
        id: 'home',
        label: 'Home',
        emojis: ['🏠', '🏡', '🛋️', '🚪', '🛁', '🚿', '🧹', '🧺', '🛏️', '🪴', '💡', '🔧'],
    },
    {
        id: 'utility',
        label: 'Bills',
        emojis: ['💡', '🔌', '💧', '🔥', '🚰', '📡', '📶', '☎️', '📞', '📦', '🧾'],
    },
    {
        id: 'fitness',
        label: 'Fitness',
        emojis: ['🏋️', '🧘', '🏃', '⛹️', '🚴', '🏊', '🥊', '🤸', '⚽', '🏀', '🎾', '🥗'],
    },
    {
        id: 'food',
        label: 'Food',
        emojis: ['🍔', '🍕', '🍣', '🥗', '🍱', '🥡', '🍜', '☕', '🍵', '🧋', '🥤', '🍩', '🍫'],
    },
    {
        id: 'transport',
        label: 'Transport',
        emojis: ['🚗', '🚕', '🚙', '🚌', '🚆', '✈️', '🛵', '🛴', '🚲', '⛽', '🛞', '🅿️'],
    },
    {
        id: 'work',
        label: 'Work',
        emojis: ['💼', '🧑‍💻', '🗂️', '📊', '📈', '📅', '🗓️', '🖊️', '📝', '📌', '📁'],
    },
    {
        id: 'people',
        label: 'People',
        emojis: ['👨‍👩‍👧', '👶', '🐶', '🐱', '🐾', '❤️', '💖', '🫶', '🎁', '🎂', '🎉'],
    },
    {
        id: 'finance',
        label: 'Money',
        emojis: ['💳', '💰', '🪙', '💵', '🏦', '📈', '📉', '🧾', '🛒', '🛍️'],
    },
    {
        id: 'misc',
        label: 'Misc',
        emojis: ['⭐', '✨', '🔥', '💎', '🌍', '🌐', '📍', '🔔', '⏰', '🧩', '🎨', '🪄'],
    },
]

export const ALL_EMOJIS: string[] = Array.from(
    new Set(EMOJI_CATEGORIES.flatMap(c => c.emojis))
)
