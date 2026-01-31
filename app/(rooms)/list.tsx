import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    View,
} from "react-native";
import { ActivityIndicator, Button, Card, FAB, Text } from "react-native-paper";

import { useAuth } from "@/contexts/auth-context";
import { Room, roomsApi } from "@/services/api";

export default function RoomListScreen() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge">No rooms yet</Text>
            <Text variant="bodyMedium" style={styles.emptyHint}>
              Create one to get started!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => router.push(`/(rooms)/${item.id}`)}
          >
            <Card.Title
              title={item.name}
              subtitle={`${item.users.length} member${item.users.length !== 1 ? "s" : ""}`}
            />
            <Card.Actions>
              <Button onPress={() => handleJoinRoom(item.id)}>Join</Button>
              <Button onPress={() => router.push(`/(rooms)/${item.id}`)}>
                View
              </Button>
            </Card.Actions>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/(rooms)/create")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    marginBottom: 12,
  },
  empty: {
    alignItems: "center",
    marginTop: 48,
  },
  emptyHint: {
    opacity: 0.6,
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
