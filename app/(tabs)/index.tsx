import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
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
          <ThemedText type="subtitle">Suggested rooms</ThemedText>
          <Card style={styles.card}>
            <Card.Title title="Trivia Night" subtitle="Open · 8 members" />
            <Card.Content>
              <Text variant="bodyMedium">
                Fast rounds, quick laughs. Join to test your trivia skills.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => router.push("/(rooms)/list")}>
                Browse
              </Button>
            </Card.Actions>
          </Card>

          <Button mode="text" onPress={logout}>
            Sign out
          </Button>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
});
