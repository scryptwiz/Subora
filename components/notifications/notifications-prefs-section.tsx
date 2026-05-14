import { NotificationsReminderOffsetsChips } from '@/components/notifications/notifications-reminder-offsets-chips'
import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Switch, Text, View } from 'react-native'

type Props = {
    notificationsEnabled: boolean
    reminderOffsets: number[]
    saving: boolean
    onToggleMaster: (value: boolean) => void
    onChangeOffsets: (next: number[]) => void
}

export function NotificationsPrefsSection({
    notificationsEnabled,
    reminderOffsets,
    saving,
    onToggleMaster,
    onChangeOffsets,
}: Props) {
    return (
        <View className='gap-3'>
            <Text className='px-1 font-inter text-xs uppercase tracking-wider text-neutral-500'>Reminders</Text>
            <View className='overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#16161A]'>
                <View className='flex-row items-center justify-between gap-3 px-4 py-4'>
                    <View className='flex-1'>
                        <Text className='font-inter-medium text-base text-white'>Push and local alerts</Text>
                        <Text className='mt-0.5 font-inter text-xs text-neutral-500'>
                            We also send a server reminder when your device is online (Expo push).
                        </Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={onToggleMaster}
                        disabled={saving}
                        trackColor={{ false: '#27272A', true: '#3F3F46' }}
                        thumbColor={notificationsEnabled ? '#FAFAFA' : '#A1A1AA'}
                    />
                </View>
                <View className='h-px bg-[#1F1F22]' />
                <View className='gap-3 px-4 py-4'>
                    <View className='flex-row items-start gap-2'>
                        <Feather name='clock' size={16} color='#A1A1AA' style={{ marginTop: 2 }} />
                        <View className='min-w-0 flex-1'>
                            <Text className='font-inter-medium text-base text-white'>Days before renewal</Text>
                            <Text className='mt-0.5 font-inter text-xs text-neutral-500'>
                                Default for subscriptions without their own reminder pattern. Pick up to 3. Server
                                matching uses UTC; local alerts use device time.
                            </Text>
                        </View>
                    </View>
                    <NotificationsReminderOffsetsChips
                        selected={reminderOffsets}
                        disabled={saving}
                        onChange={onChangeOffsets}
                    />
                </View>
            </View>
        </View>
    )
}
