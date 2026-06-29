import { getNativeDefault } from "@/theme/colors";
import { StyleSheet, View } from "react-native";
import { SkeletonBlock } from "./skeleton-block";

export function NotificationsPrefsSkeleton() {
  return (
    <View style={styles.container}>
      {/* "Reminders" Title Skeleton */}
      <SkeletonBlock style={styles.sectionHeader} />

      {/* Card Skeleton */}
      <View style={styles.card}>
        {/* Row 1: Push and local alerts */}
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <SkeletonBlock style={styles.titleSkeleton} />
            <SkeletonBlock style={styles.descriptionSkeleton1} />
            <SkeletonBlock style={styles.descriptionSkeleton2} />
          </View>
          <SkeletonBlock style={styles.switchSkeleton} />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Row 2: Days before renewal */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <SkeletonBlock style={styles.iconSkeleton} />
            <View style={styles.headerTextContainer}>
              <SkeletonBlock style={styles.titleSkeleton} />
              <SkeletonBlock style={styles.descriptionSkeleton1} />
              <SkeletonBlock style={styles.descriptionSkeleton2} />
            </View>
          </View>

          {/* Chips skeleton */}
          <View style={styles.chipsContainer}>
            <SkeletonBlock style={styles.chipSkeleton} />
            <SkeletonBlock style={[styles.chipSkeleton, { width: 50 }]} />
            <SkeletonBlock style={[styles.chipSkeleton, { width: 65 }]} />
            <SkeletonBlock style={[styles.chipSkeleton, { width: 55 }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionHeader: {
    height: 12,
    width: 80,
    borderRadius: 999,
    marginLeft: 4,
    marginVertical: 2,
  },
  card: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  titleSkeleton: {
    height: 16,
    width: 140,
    borderRadius: 4,
  },
  descriptionSkeleton1: {
    height: 12,
    width: "90%",
    borderRadius: 4,
    marginTop: 2,
  },
  descriptionSkeleton2: {
    height: 12,
    width: "60%",
    borderRadius: 4,
  },
  switchSkeleton: {
    height: 31,
    width: 51,
    borderRadius: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: getNativeDefault("separator"),
  },
  detailsContainer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  iconSkeleton: {
    height: 16,
    width: 16,
    borderRadius: 4,
    marginTop: 2,
  },
  headerTextContainer: {
    minWidth: 0,
    flex: 1,
    gap: 6,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chipSkeleton: {
    height: 28,
    width: 70,
    borderRadius: 999,
  },
});
