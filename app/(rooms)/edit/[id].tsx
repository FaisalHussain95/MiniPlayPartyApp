import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Avatar,
    Button,
    Checkbox,
    Divider,
    List,
    Text,
    TextInput,
} from "react-native-paper";

import { useAuth } from "@/contexts/auth-context";
import { Room, roomsApi } from "@/services/api";

export default function EditRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [name, setName] = useState("");
  const [adminIds, setAdminIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRoom = useCallback(async () => {
    if (!token || !id) return;
    try {
      const data = await roomsApi.get(token, id);
      setRoom(data);
      setName(data.name);
      setAdminIds(data.users.filter((u) => u.isAdmin).map((u) => u.id));
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

  const toggleAdmin = (userId: number) => {
    setAdminIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSave = async () => {
    if (!token || !id || !room) return;

    if (!name.trim()) {
      Alert.alert("Error", "Room name is required");
      return;
    }

    setSaving(true);
    try {
      await roomsApi.update(token, id, {
        name: name.trim(),
        userIds: room.users.map((u) => u.id),
        adminIds,
      });
      Alert.alert("Success", "Room updated!");
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update room",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !id) return;
    Alert.alert("Delete room", "This action cannot be undone. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await roomsApi.delete(token, id);
            router.replace("/(rooms)/list");
          } catch (error) {
            Alert.alert(
              "Error",
              error instanceof Error ? error.message : "Failed to delete room",
            );
          }
        },
      },
    ]);
  };

  const handleRemoveUser = async (userId: number) => {
    if (!token || !id || !room) return;
    Alert.alert("Remove user", "Remove this user from the room?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const newUserIds = room.users
              .filter((u) => u.id !== userId)
              .map((u) => u.id);
            const newAdminIds = adminIds.filter((aid) => aid !== userId);
            await roomsApi.update(token, id, {
              name: room.name,
              userIds: newUserIds,
              adminIds: newAdminIds,
            });
            fetchRoom();
          } catch (error) {
            Alert.alert(
              "Error",
              error instanceof Error ? error.message : "Failed to remove user",
            );
          }
        },
      },
    ]);
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
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Room details
          </Text>
          <TextInput
            label="Room name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Members
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            Toggle admin status or remove members
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
          right={() => (
            <View style={styles.memberActions}>
              <View style={styles.adminToggle}>
                <Text variant="bodySmall">Admin</Text>
                <Checkbox
                  status={adminIds.includes(item.id) ? "checked" : "unchecked"}
                  onPress={() => toggleAdmin(item.id)}
                />
              </View>
              <Button
                mode="text"
                compact
                onPress={() => handleRemoveUser(item.id)}
              >
                Remove
              </Button>
            </View>
          )}
        />
      )}
      ListFooterComponent={
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          >
            Save changes
          </Button>
          <Button mode="outlined" textColor="red" onPress={handleDelete}>
            Delete room
          </Button>
        </View>
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
  sectionTitle: {
    marginBottom: 8,
  },
  hint: {
    opacity: 0.6,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  adminToggle: {
    alignItems: "center",
  },
  footer: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
});
