import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Room, roomsApi } from "@/services/api";

export default function HomeScreen() {
  const { user, token, logout } = useAuth();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const backgroundColor = useThemeColor({}, "background");

  const fetchMyRooms = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await roomsApi.list(token);
      // Filter to only rooms where I'm a member
      const rooms = data.rooms.filter((room) =>
        room.users.some((u) => u.id === user?.id),
      );
      setMyRooms(rooms);
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (user) {
      fetchMyRooms();
    }
  }, [user, fetchMyRooms]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">MiniPlayParty</ThemedText>
          <ThemedText type="subtitle">
            {user ? `Welcome, ${user.name}!` : "Rooms hub"}
          </ThemedText>
          <ThemedText>
            Create a room or jump into an existing one to start a mini‑game with
            friends.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.actions}>
          {user ? (
            <>
              <Button
                mode="contained"
                onPress={() => router.push("/(rooms)/create")}
              >
                Create room
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push("/(rooms)/list")}
              >
                Browse rooms
              </Button>
            </>
          ) : (
            <>
              <Button
                mode="contained"
                onPress={() => router.push("/(auth)/login")}
              >
                Sign in
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push("/(auth)/register")}
              >
                Register
              </Button>
            </>
          )}
        </ThemedView>

        {user && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Your rooms</ThemedText>

            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : myRooms.length > 0 ? (
              myRooms.slice(0, 3).map((room) => (
                <Card
                  key={room.id}
                  style={styles.card}
                  onPress={() => router.push(`/(rooms)/${room.id}`)}
                >
                  <Card.Title
                    title={room.name}
                    subtitle={`${room.users.length} member${room.users.length !== 1 ? "s" : ""}`}
                  />
                  <Card.Actions>
                    <Button onPress={() => router.push(`/(rooms)/${room.id}`)}>
                      Open
                    </Button>
                  </Card.Actions>
                </Card>
              ))
            ) : (
              <Card style={styles.card}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    You don't have any rooms yet.
                  </Text>
                  <Text variant="bodySmall" style={styles.emptyHint}>
                    Create one or ask someone to invite you!
                  </Text>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => router.push("/(rooms)/create")}>
                    Create room
                  </Button>
                  <Button onPress={() => router.push("/(rooms)/list")}>
                    Browse
                  </Button>
                </Card.Actions>
              </Card>
            )}

            <Button mode="text" onPress={logout}>
              Sign out
            </Button>
          </ThemedView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  section: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
  },
  loader: {
    marginVertical: 16,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 4,
  },
  emptyHint: {
    textAlign: "center",
    opacity: 0.6,
  },
});
