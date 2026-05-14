import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { Platform, Share } from 'react-native'

function exportFilename() {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `subora-subscriptions-${y}-${m}-${day}.csv`
}

export async function shareCsvContents(csv: string): Promise<void> {
    if (Platform.OS === 'web') {
        const result = await Share.share({
            title: 'Subora subscription export',
            message: csv,
        })
        if (result.action === Share.dismissedAction) return
        return
    }

    const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory
    if (!baseDir) {
        await Share.share({
            title: 'Subora subscription export',
            message: csv,
        })
        return
    }

    const path = `${baseDir}${exportFilename()}`
    await FileSystem.writeAsStringAsync(path, csv, { encoding: 'utf8' })

    const canShare = await Sharing.isAvailableAsync()
    if (!canShare) {
        await Share.share({
            title: 'Subora subscription export',
            message: csv,
        })
        return
    }

    await Sharing.shareAsync(path, {
        mimeType: 'text/csv',
        dialogTitle: 'Export subscriptions',
        UTI: 'public.comma-separated-values-text',
    })
}
