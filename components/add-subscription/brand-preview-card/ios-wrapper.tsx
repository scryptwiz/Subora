import { RNHostView } from "@expo/ui/swift-ui";
import { BrandPreviewCard } from "./card";

export function BrandPreviewCardIOS() {
  return (
    <RNHostView matchContents>
      <BrandPreviewCard plain />
    </RNHostView>
  );
}
