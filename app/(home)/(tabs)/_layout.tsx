import { Feather } from '@expo/vector-icons'
import { Tabs, useRouter } from 'expo-router'
import React from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ACTIVE = '#FFFFFF'
const INACTIVE = '#52525B'
const TAB_HEIGHT = 64

export default function TabsLayout() {
    const insets = useSafeAreaInsets()
    const router = useRouter()

    const bottomInset = Math.max(insets.bottom, 12)

    return (
        <View className='flex-1 bg-[#111111]'>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: ACTIVE,
                    tabBarInactiveTintColor: INACTIVE,
                    tabBarStyle: {
                        backgroundColor: '#0E0E10',
                        borderTopColor: '#1F1F22',
                        borderTopWidth: StyleSheet.hairlineWidth,
                        height: TAB_HEIGHT + bottomInset,
                        paddingTop: 10,
                        paddingBottom: bottomInset,
                    },
                    sceneStyle: { backgroundColor: '#111111' },
                }}
            >
                <Tabs.Screen
                    name='index'
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => <Feather name='home' size={22} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name='subscriptions'
                    options={{
                        title: 'Subscriptions',
                        tabBarIcon: ({ color }) => <Feather name='grid' size={22} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name='profile'
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color }) => <Feather name='user' size={22} color={color} />,
                    }}
                />
            </Tabs>

            {/* Floating action button — opens the Add Subscription modal */}
            <View
                pointerEvents='box-none'
                style={{
                    position: 'absolute',
                    right: 20,
                    bottom: TAB_HEIGHT + bottomInset + 12,
                }}
            >
                <Pressable
                    onPress={() => router.push('/(home)/add-subscription')}
                    accessibilityRole='button'
                    accessibilityLabel='Add subscription'
                    style={({ pressed }) => [
                        styles.fab,
                        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                    ]}
                >
                    <Feather name='plus' size={24} color='#111111' />
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    fab: {
        height: 56,
        width: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.4,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
            },
            android: {
                elevation: 12,
            },
        }),
    },
})
