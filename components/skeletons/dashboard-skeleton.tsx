import { getNativeDefault } from "@/theme/colors";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonBlock } from "./skeleton-block";

export function DashboardSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 126,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <SkeletonBlock style={styles.skH3W32Full} />
            <SkeletonBlock style={styles.skH6W40Md} />
          </View>
          <SkeletonBlock style={styles.skH11W11Full} />
        </View>

        <View style={styles.mainCard}>
          <View style={styles.mainCardContent}>
            <SkeletonBlock style={styles.skH3W28Full} />
            <SkeletonBlock style={styles.skH12W48Lg} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <SkeletonBlock style={styles.skH3W16Full} />
            <SkeletonBlock style={styles.skH7W20Md} />
            <SkeletonBlock style={styles.skH3W24Full} />
          </View>
          <View style={styles.statCard}>
            <SkeletonBlock style={styles.skH3W20Full} />
            <SkeletonBlock style={styles.skH7W24Md} />
            <SkeletonBlock style={styles.skH3W20Full} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SkeletonBlock style={styles.skH5W28Md} />
            <SkeletonBlock style={styles.skH3W16Full} />
          </View>
          <View style={styles.listContainer}>
            {[0, 1, 2, 3, 4].map((i) => (
              <UpcomingRowSkeleton key={i} />
            ))}
          </View>
        </View>

        <SkeletonBlock style={styles.skH14Lg} />
      </ScrollView>
    </View>
  );
}

function UpcomingRowSkeleton() {
  return (
    <View style={styles.row}>
      <SkeletonBlock style={styles.skH12W12Lg} />
      <View style={styles.rowTextContainer}>
        <SkeletonBlock style={styles.skH4W32Md} />
        <SkeletonBlock style={styles.skH3W20Full} />
      </View>
      <SkeletonBlock style={styles.skH3W16Full} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getNativeDefault("background"),
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextContainer: {
    gap: 8,
  },
  mainCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    padding: 20,
  },
  mainCardContent: {
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    padding: 16,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listContainer: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getNativeDefault("separator"),
    backgroundColor: getNativeDefault("secondaryBackground"),
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowTextContainer: {
    flex: 1,
    gap: 8,
  },
  // Skeleton Block Sizes/Shapes
  skH3W32Full: { height: 12, width: 128, borderRadius: 9999 },
  skH6W40Md: { height: 24, width: 160, borderRadius: 6 },
  skH11W11Full: { height: 44, width: 44, borderRadius: 9999 },
  skH3W28Full: { height: 12, width: 112, borderRadius: 9999 },
  skH12W48Lg: { height: 48, width: 192, borderRadius: 8 },
  skH3W16Full: { height: 12, width: 64, borderRadius: 9999 },
  skH7W20Md: { height: 28, width: 80, borderRadius: 6 },
  skH3W24Full: { height: 12, width: 96, borderRadius: 9999 },
  skH3W20Full: { height: 12, width: 80, borderRadius: 9999 },
  skH7W24Md: { height: 28, width: 96, borderRadius: 6 },
  skH5W28Md: { height: 20, width: 112, borderRadius: 6 },
  skH14Lg: { height: 56, borderRadius: 16 },
  skH12W12Lg: { height: 48, width: 48, borderRadius: 16 },
  skH4W32Md: { height: 16, width: 128, borderRadius: 6 },
});
