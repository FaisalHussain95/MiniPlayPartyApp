import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, SectionList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, H2, H3, Spinner, Text, XStack, YStack } from "tamagui";

import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Room, roomsApi } from "@/services/api";

type RoomSection = {
  title: string;
  data: Room[];
};

export default function RoomListScreen() {
  const { token, user } = useAuth();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [pendingRooms, setPendingRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, "background");

  const fetchRooms = useCallback(async () => {
    if (!token || !user) return;
    try {
      const data = await roomsApi.list(token);
      // Rooms I'm a member of
      const memberRooms = data.rooms.filter((room) =>
        room.users.some((u) => u.id === user.id),
      );
      // Rooms where I have a pending join request
      const requestedRooms = data.rooms.filter(
        (room) =>
          room.requests.some((r) => r.id === user.id) &&
          !room.users.some((u) => u.id === user.id),
      );
      setMyRooms(memberRooms);
      setPendingRooms(requestedRooms);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load rooms",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const handleCancelRequest = async (roomId: string) => {
    if (!token) return;
    try {
      await roomsApi.leave(token, roomId);
      Alert.alert("Success", "Join request cancelled");
      fetchRooms();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to cancel request",
      );
    }
  };

  const sections: RoomSection[] = [
    { title: "My Rooms", data: myRooms },
    { title: "Pending Requests", data: pendingRooms },
  ].filter((section) => section.data.length > 0);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["bottom"]}
    >
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <YStack padding="$4" paddingBottom="$2">
            <H2>My Rooms</H2>
          </YStack>
        }
        ListEmptyComponent={
          <YStack alignItems="center" paddingVertical="$8">
            <Text fontSize="$5">No rooms yet</Text>
            <Text fontSize="$3" color="$gray10">
              Create one to get started!
            </Text>
          </YStack>
        }
        renderSectionHeader={({ section: { title } }) => (
          <YStack paddingHorizontal="$4" paddingTop="$4" paddingBottom="$2">
            <H3 color="$gray11">{title}</H3>
          </YStack>
        )}
        renderItem={({ item, section }) => (
          <Card
            elevation="$1"
            borderWidth={1}
            borderColor="$gray5"
            margin="$2"
            marginHorizontal="$4"
            padding="$3"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => router.push(`/(rooms)/${item.id}`)}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack flex={1}>
                <Text fontWeight="600">{item.name}</Text>
                <Text fontSize="$2" color="$gray10">
                  {item.users.length} member
                  {item.users.length === 1 ? "" : "s"}
                </Text>
              </YStack>
              <XStack gap="$2">
                {section.title === "Pending Requests" ? (
                  <Button
                    size="$2"
                    theme="red"
                    variant="outlined"
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCancelRequest(item.id);
                    }}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    size="$2"
                    theme="active"
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/(rooms)/${item.id}`);
                    }}
                  >
                    View
                  </Button>
                )}
              </XStack>
            </XStack>
          </Card>
        )}
      />

      <Button
        size="$5"
        circular
        theme="active"
        position="absolute"
        bottom="$4"
        right="$4"
        onPress={() => router.push("/(rooms)/create")}
      >
        +
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  list: {
    paddingBottom: 80,
  },
});
