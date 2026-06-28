import { useFunAvatar } from "@/hooks/use-fun-avatar";
import { Image as ExpoImage } from "expo-image";

export default function ProfileImage() {
  const funAvatarUrl = useFunAvatar();
  return (
    <>
      {/* {user?.imageUrl ? (
        <HStack
          modifiers={[frame({ width: 60, height: 60 }), cornerRadius(100)]}
        >
          <ExpoImage
            source={{ uri: user.imageUrl }}
            style={{ width: 60, height: 60 }}
            contentFit="fill"
          />
        </HStack>
      ) : (
        <SwiftUIImage
          systemName="person.crop.circle.fill"
          modifiers={[
            foregroundStyle("#3F3F46"),
            resizable(),
            frame({ width: 60, height: 60 }),
          ]}
        />
      )} */}
      <ExpoImage
        source={{ uri: funAvatarUrl }}
        style={{ width: 60, height: 60 }}
        contentFit="fill"
      />
    </>
  );
}
