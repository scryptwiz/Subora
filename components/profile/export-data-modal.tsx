import { usePreferences } from '@/contexts/preferences-context'
import { useSubscriptions } from '@/contexts/subscriptions-context'
import { useConvertedSpendTotals } from '@/hooks/use-converted-totals'
import { shareCsvContents } from '@/lib/share-csv'
import { buildSubscriptionsExportCsv } from '@/lib/subscriptions-export-csv'
import { Feather } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
    visible: boolean
    onClose: () => void
}

export function ExportDataModal({ visible, onClose }: Props) {
    const insets = useSafeAreaInsets()
    const { height } = useWindowDimensions()
    const { subscriptions, configured } = useSubscriptions()
    const { displayCurrency } = usePreferences()
    const converted = useConvertedSpendTotals()
    const [exporting, setExporting] = useState(false)

    const handleExport = async () => {
        if (exporting) return
        if (!configured) {
            Alert.alert('Not connected', 'Add your Supabase keys in the app environment to export saved data.')
            return
        }
        setExporting(true)
        try {
            const csv = buildSubscriptionsExportCsv(subscriptions, {
                displayCurrency,
                monthlyTotalDisplay: converted.monthlyNumber,
                yearlyTotalDisplay: converted.yearlyNumber,
            })
            await shareCsvContents(csv)
            onClose()
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Could not create the export.'
            Alert.alert('Export failed', msg)
        } finally {
            setExporting(false)
        }
    }

    return (
        <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
            <Pressable
                accessibilityRole='button'
                accessibilityLabel='Dismiss'
                className='flex-1 justify-end bg-black/60'
                onPress={onClose}
            >
                <Pressable
                    className='rounded-t-3xl border border-[#27272A] bg-[#16161A]'
                    style={{
                        paddingBottom: insets.bottom + 16,
                        maxHeight: height * 0.72,
                    }}
                    onPress={e => e.stopPropagation()}
                >
                    <View className='flex-row items-center justify-between border-b border-[#1F1F22] px-5 py-4'>
                        <Text className='font-inter-bold text-lg text-white'>Export data</Text>
                        <Pressable
                            accessibilityRole='button'
                            accessibilityLabel='Close'
                            hitSlop={12}
                            onPress={onClose}
                            disabled={exporting}
                            className='h-10 w-10 items-center justify-center rounded-full bg-[#1F1F22]'
                        >
                            <Feather name='x' size={18} color='#FFFFFF' />
                        </Pressable>
                    </View>

                    <ScrollView
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 16 }}
                    >
                        <Text className='font-inter text-sm leading-5 text-neutral-400'>
                            Download a CSV snapshot of your subscriptions plus a budget overview (active vs
                            inactive, monthly and yearly estimates in your display currency when rates are
                            available).
                        </Text>
                        <View className='gap-2 rounded-2xl border border-[#27272A] bg-[#111111] p-4'>
                            <Text className='font-inter-medium text-sm text-white'>Included in the file</Text>
                            <Text className='font-inter text-xs leading-5 text-neutral-500'>
                                • Budget summary rows for planning{'\n'}• One row per subscription with price,
                                cycle, renewal date, and status{'\n'}• UTF-8 with BOM for Excel compatibility
                            </Text>
                        </View>
                        <Pressable
                            accessibilityRole='button'
                            accessibilityLabel='Export CSV'
                            disabled={exporting}
                            onPress={() => void handleExport()}
                            className='flex-row items-center justify-center gap-2 rounded-2xl bg-lime-400 py-4'
                            style={({ pressed }) =>
                                pressed && !exporting ? { opacity: 0.9 } : exporting ? { opacity: 0.6 } : undefined
                            }
                        >
                            {exporting ? (
                                <ActivityIndicator color='#111111' />
                            ) : (
                                <Feather name='download' size={20} color='#111111' />
                            )}
                            <Text className='font-inter-bold text-base text-[#111111]'>
                                {exporting ? 'Preparing…' : 'Export CSV'}
                            </Text>
                        </Pressable>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    )
}
