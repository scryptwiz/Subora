import { DatePickerRow } from '@/components/add-subscription/date-picker-row'
import { FieldLabel, RowDivider } from '@/components/add-subscription/form-fields'
import { ReminderNotificationsNudge } from '@/components/add-subscription/reminder-notifications-nudge'
import { ReminderOffsetChips } from '@/components/add-subscription/reminder-offset-chips'
import React from 'react'
import { View } from 'react-native'

type BillingAndRemindersCardProps = {
    renewalDate: Date
    minRenewalDate: Date
    onRenewalDateChange: (value: Date) => void
    formatRenewalDate: (value: Date) => string
    reminderOffsets: number[]
    onReminderOffsetsChange: React.Dispatch<React.SetStateAction<number[]>>
}

export function BillingAndRemindersCard({
    renewalDate,
    minRenewalDate,
    onRenewalDateChange,
    formatRenewalDate,
    reminderOffsets,
    onReminderOffsetsChange,
}: BillingAndRemindersCardProps) {
    return (
        <View className='gap-3'>
            <FieldLabel icon='calendar' label='Billing' />
            <View className='overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#16161A]'>
                <DatePickerRow
                    icon='calendar'
                    title='Renewal date'
                    value={renewalDate}
                    onChange={onRenewalDateChange}
                    formatValue={formatRenewalDate}
                    minimumDate={minRenewalDate}
                />
                <RowDivider />
                <ReminderNotificationsNudge />
                <ReminderOffsetChips reminderOffsets={reminderOffsets} onChange={onReminderOffsetsChange} />
            </View>
        </View>
    )
}
