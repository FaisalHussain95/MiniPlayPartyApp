import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    List,
    Text,
} from "react-native-paper";

import { useAuth } from "@/contexts/auth-context";
import { Room, roomsApi } from "@/services/api";

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoom = useCallback(async () => {
    if (!token || !id) return;
    try {
      const data = await roomsApi.get(token, id);
      setRoom(data);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load room",
      );
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  const isAdmin = room?.users.some((u) => u.id === user?.id && u.isAdmin);

  const handleLeave = async () => {
    if (!token || !id) return;
    Alert.alert("Leave room", "Are you sure you want to leave this room?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await roomsApi.leave(token, id);
            router.back();
          } catch (error) {
            Alert.alert(
              "Error",
              error instanceof Error ? error.message : "Failed to leave room",
            );
          }
        },
      },
    ]);
  };

  const handleAcceptUser = async (userId: number) => {
    if (!token || !id) return;
    try {
      await roomsApi.handleUser(token, id, { accept: [userId] });
      fetchRoom();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to accept user",
      );
    }
  };

  const handleRejectUser = async (userId: number) => {
    if (!token || !id) return;
    try {
      await roomsApi.handleUser(token, id, { reject: [userId] });
      fetchRoom();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to reject user",
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

  if (!room) {
    return (
      <View style={styles.centered}>
        <Text>Room not found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={room.users}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <>
          <Card style={styles.header}>
            <Card.Title
              title={room.name}
              subtitle={`${room.users.length} member${room.users.length !== 1 ? "s" : ""}`}
              left={(props) =>
                room.avatar ? (
                  <Avatar.Image {...props} source={{ uri: room.avatar }} />
                ) : (
                  <Avatar.Icon {...props} icon="home-group" />
                )
              }
            />
            <Card.Actions>
              {isAdmin && (
                <Button onPress={() => router.push(`/(rooms)/edit/${id}`)}>
                  Edit
                </Button>
              )}
              <Button onPress={handleLeave}>Leave</Button>
            </Card.Actions>
          </Card>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Members
          </Text>
        </>
      }
      renderItem={({ item }) => (
        <List.Item
          title={item.name}
          description={item.username}
          left={(props) =>
            item.avatar ? (
              <Avatar.Image
                {...props}
                size={40}
                source={{ uri: item.avatar }}
              />
            ) : (
              <Avatar.Icon {...props} size={40} icon="account" />
            )
          }
          right={() => item.isAdmin && <Chip compact>Admin</Chip>}
        />
      )}
      ListFooterComponent={
        isAdmin && room.requests.length > 0 ? (
          <>
            <Divider style={styles.divider} />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Join requests
            </Text>
            {room.requests.map((req) => (
              <List.Item
                key={req.id}
                title={req.name}
                description={req.username}
                left={(props) =>
                  req.avatar ? (
                    <Avatar.Image
                      {...props}
                      size={40}
                      source={{ uri: req.avatar }}
                    />
                  ) : (
                    <Avatar.Icon {...props} size={40} icon="account" />
                  )
                }
                right={() => (
                  <View style={styles.actions}>
                    <Button
                      mode="contained"
                      compact
                      onPress={() => handleAcceptUser(req.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleRejectUser(req.id)}
                    >
                      Reject
                    </Button>
                  </View>
                )}
              />
            ))}
          </>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
});
