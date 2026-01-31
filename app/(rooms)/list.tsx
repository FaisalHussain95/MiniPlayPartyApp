import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, H2, Spinner, Text, XStack, YStack } from "tamagui";

import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Room, roomsApi } from "@/services/api";

export default function RoomListScreen() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, "background");

  const fetchRooms = useCallback(async () => {
    if (!token) return;
    try {
      const data = await roomsApi.list(token);
      setRooms(data.rooms);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load rooms",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!token) return;
    try {
      await roomsApi.join(token, roomId);
      Alert.alert("Success", "Join request sent!");
      fetchRooms();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to join room",
      );
    }
  };

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
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <YStack padding="$4" paddingBottom="$2">
            <H2>Browse Rooms</H2>
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
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(rooms)/${item.id}`)}>
            <Card
              elevation="$1"
              borderWidth={1}
              borderColor="$gray5"
              margin="$2"
              marginHorizontal="$4"
              padding="$3"
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
                  <Button
                    size="$2"
                    variant="outlined"
                    onPress={() => handleJoinRoom(item.id)}
                  >
                    Join
                  </Button>
                  <Button
                    size="$2"
                    theme="active"
                    onPress={() => router.push(`/(rooms)/${item.id}`)}
                  >
                    View
                  </Button>
                </XStack>
              </XStack>
            </Card>
          </Pressable>
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
