import { useFunAvatar } from "@/hooks/use-fun-avatar";
import { Image } from "expo-image";

export default function ProfileImage() {
  const funAvatarUrl = useFunAvatar();

  return (
    <>
      {/* {user?.imageUrl ? (
        <Image
          key={user.imageUrl}
          source={{ uri: user.imageUrl }}
          style={{ width: 88, height: 88, borderRadius: 44 }}
          contentFit="cover"
          recyclingKey={user.imageUrl}
        />
      ) : (
        <View
          className="h-[88px] w-[88px] items-center justify-center rounded-full"
          style={{ backgroundColor: avatarColor(displayName) }}
        >
          <Text className="font-inter-bold text-3xl text-white">
            {initials(displayName)}
          </Text>
        </View>
      )} */}
      <Image
        key={funAvatarUrl}
        source={{ uri: funAvatarUrl }}
        style={{ width: 88, height: 88, borderRadius: 44 }}
        contentFit="cover"
        recyclingKey={funAvatarUrl}
      />
    </>
  );
}
