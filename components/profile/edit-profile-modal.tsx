import { avatarColor, initials } from '@/lib/logo'
import {
    mergePreferredUsernameIntoUnsafeMetadata,
    preferredUsernameFromUnsafeMetadata,
    profileDisplayName,
} from '@/lib/profile-display-name'
import { isClerkAPIResponseError, useUser } from '@clerk/expo'
import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ClerkUserImage = {
    setProfileImage?: (args: {
        file: { uri: string; name: string; type: string } | FormData
    }) => Promise<unknown>
}

type Props = {
    visible: boolean
    onClose: () => void
}

export function EditProfileModal({ visible, onClose }: Props) {
    const insets = useSafeAreaInsets()
    const { user, isLoaded } = useUser()
    const [username, setUsername] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [pickedUri, setPickedUri] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    /** When this matches `user.id` while the sheet is open, we already hydrated the form — do not reset (Clerk replaces `user` often and would wipe `pickedUri`). */
    const hydratedUserId = useRef<string | null>(null)

    useEffect(() => {
        if (!visible) {
            hydratedUserId.current = null
            return
        }
        if (!user) return
        if (hydratedUserId.current === user.id) return
        hydratedUserId.current = user.id
        setUsername(
            preferredUsernameFromUnsafeMetadata(user.unsafeMetadata) || user.username || ''
        )
        setFirstName(user.firstName ?? '')
        setLastName(user.lastName ?? '')
        setPickedUri(null)
    }, [visible, user])

    const pickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!perm.granted) {
            Alert.alert('Photos', 'Allow photo library access to change your profile picture.')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        })

        if (result.canceled || !result.assets[0]) return
        setPickedUri(result.assets[0].uri)
    }

    const handleSave = async () => {
        if (!user || saving) return
        const usernameTrimmed = username.trim()
        if (!usernameTrimmed) {
            Alert.alert('Username required', 'Add a username before saving.')
            return
        }
        setSaving(true)
        try {
            await user.update({
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
                unsafeMetadata: mergePreferredUsernameIntoUnsafeMetadata(
                    user.unsafeMetadata,
                    usernameTrimmed
                ),
            })

            if (pickedUri) {
                const ext = pickedUri.split('.').pop()?.toLowerCase()
                const mime =
                    ext === 'png'
                        ? 'image/png'
                        : ext === 'webp'
                          ? 'image/webp'
                          : 'image/jpeg'
                const fileName =
                    ext === 'png' || ext === 'webp' ? `avatar.${ext}` : 'avatar.jpg'

                const withImage = user as unknown as ClerkUserImage
                if (typeof withImage.setProfileImage === 'function') {
                    await withImage.setProfileImage({
                        file: { uri: pickedUri, name: fileName, type: mime },
                    })
                } else {
                    Alert.alert(
                        'Photo not updated',
                        'Your name was saved. This build could not upload a new profile photo.'
                    )
                }
            }

            await user.reload()
            onClose()
        } catch (e) {
            const msg = isClerkAPIResponseError(e)
                ? e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message
                : e instanceof Error
                  ? e.message
                  : 'Could not update profile.'
            Alert.alert('Update failed', msg ?? 'Try again.')
        } finally {
            setSaving(false)
        }
    }

    if (!isLoaded || !user) return null

    const displayName = profileDisplayName({
        unsafeMetadata: mergePreferredUsernameIntoUnsafeMetadata(user.unsafeMetadata, username),
        username: user.username,
        firstName,
    })

    const previewUri = pickedUri ?? user.imageUrl ?? null

    return (
        <Modal visible={visible} animationType='slide' presentationStyle='pageSheet' onRequestClose={onClose}>
            <KeyboardAvoidingView
                className='flex-1 bg-[#111111]'
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View
                    className='flex-row items-center justify-between border-b border-[#1F1F22] px-4 py-3'
                    style={{ paddingTop: (Platform.OS === 'ios' ? 0 : insets.top) + 24 }}
                >
                    <Pressable hitSlop={12} onPress={onClose} accessibilityLabel='Close'>
                        <Text className='font-inter-medium text-base text-neutral-400'>Cancel</Text>
                    </Pressable>
                    <Text className='font-inter-medium text-base text-white'>Edit profile</Text>
                    <Pressable
                        hitSlop={12}
                        onPress={() => void handleSave()}
                        disabled={saving}
                        accessibilityLabel='Save profile'
                    >
                        {saving ? (
                            <ActivityIndicator color='#A3E635' size='small' />
                        ) : (
                            <Text className='font-inter-medium text-base text-lime-400'>Save</Text>
                        )}
                    </Pressable>
                </View>

                <ScrollView
                    className='flex-1 px-5'
                    keyboardShouldPersistTaps='handled'
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 24,
                        gap: 24,
                        paddingTop: 24,
                    }}
                >
                    <View className='items-center gap-4'>
                        <Pressable onPress={() => void pickImage()} accessibilityLabel='Change profile photo'>
                            {previewUri ? (
                                <Image
                                    key={previewUri}
                                    source={{ uri: previewUri }}
                                    style={{ width: 112, height: 112, borderRadius: 56 }}
                                    contentFit='cover'
                                />
                            ) : (
                                <View
                                    className='h-[112px] w-[112px] items-center justify-center rounded-full'
                                    style={{ backgroundColor: avatarColor(displayName) }}
                                >
                                    <Text className='font-inter-bold text-4xl text-white'>
                                        {initials(displayName)}
                                    </Text>
                                </View>
                            )}
                            <View className='mt-3 flex-row items-center justify-center gap-2'>
                                <Feather name='camera' size={16} color='#A3A3A3' />
                                <Text className='font-inter-medium text-sm text-neutral-400'>
                                    Change photo
                                </Text>
                            </View>
                        </Pressable>
                        <Text className='text-center font-inter text-xs text-neutral-600'>
                            Username, name, and photo. Email is managed by your sign-in provider.
                        </Text>
                    </View>

                    <View className='gap-2'>
                        <Text className='px-1 font-inter text-xs uppercase tracking-wider text-neutral-500'>
                            Username
                        </Text>
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            placeholder='Username'
                            placeholderTextColor='#52525B'
                            autoCapitalize='none'
                            autoCorrect={false}
                            autoComplete='username'
                            className='h-14 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 font-inter text-base text-white'
                        />
                    </View>

                    <View className='gap-2'>
                        <Text className='px-1 font-inter text-xs uppercase tracking-wider text-neutral-500'>
                            First name
                        </Text>
                        <TextInput
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder='First name'
                            placeholderTextColor='#52525B'
                            autoCapitalize='words'
                            autoCorrect={false}
                            className='h-14 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 font-inter text-base text-white'
                        />
                    </View>

                    <View className='gap-2'>
                        <Text className='px-1 font-inter text-xs uppercase tracking-wider text-neutral-500'>
                            Last name
                        </Text>
                        <TextInput
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder='Last name'
                            placeholderTextColor='#52525B'
                            autoCapitalize='words'
                            autoCorrect={false}
                            className='h-14 rounded-2xl border border-[#27272A] bg-[#16161A] px-4 font-inter text-base text-white'
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    )
}
