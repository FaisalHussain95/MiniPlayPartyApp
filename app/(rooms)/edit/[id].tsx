import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Avatar,
    Button,
    H3,
    Input,
    Label,
    Separator,
    SizableText,
    Spinner,
    Text,
    XStack,
    YStack,
} from "tamagui";

import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Room, roomsApi } from "@/services/api";

export default function EditRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [name, setName] = useState("");
  const [adminIds, setAdminIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const backgroundColor = useThemeColor({}, "background");

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
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
        </YStack>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text>Room not found</Text>
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
        data={room.users}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <H3 marginBottom="$2">Room details</H3>
            <YStack marginBottom="$4" gap="$2">
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                size="$4"
                placeholder="Enter room name"
                value={name}
                onChangeText={setName}
              />
            </YStack>

            <Separator marginVertical="$4" />

            <H3 marginBottom="$1">Members</H3>
            <Text fontSize="$2" color="$gray10" marginBottom="$2">
              Toggle admin status or remove members
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <XStack
            padding="$3"
            gap="$3"
            alignItems="center"
            borderBottomWidth={1}
            borderColor="$gray5"
          >
            <Avatar circular size="$4" backgroundColor="$green9">
              {item.avatar ? (
                <Avatar.Image src={item.avatar} />
              ) : (
                <Avatar.Fallback
                  backgroundColor="$green9"
                  justifyContent="center"
                  alignItems="center"
                >
                  <SizableText color="$white" fontSize="$2">
                    {item.name.substring(0, 2).toUpperCase()}
                  </SizableText>
                </Avatar.Fallback>
              )}
            </Avatar>
            <YStack flex={1}>
              <Text fontWeight="500">{item.name}</Text>
              <Text fontSize="$2" color="$gray10">
                @{item.username}
              </Text>
            </YStack>
            <XStack gap="$3" alignItems="center">
              <YStack alignItems="center">
                <Text fontSize="$1" color="$gray10">
                  Admin
                </Text>
                <Switch
                  value={adminIds.includes(item.id)}
                  onValueChange={() => toggleAdmin(item.id)}
                  disabled={item.id === user?.id}
                />
              </YStack>
              <Button
                size="$2"
                chromeless
                theme="red"
                onPress={() => handleRemoveUser(item.id)}
                disabled={item.id === user?.id}
                opacity={item.id === user?.id ? 0.5 : 1}
              >
                Remove
              </Button>
            </XStack>
          </XStack>
        )}
        ListFooterComponent={
          <YStack marginTop="$6" gap="$3">
            <Button
              size="$4"
              theme="active"
              onPress={handleSave}
              disabled={saving}
              icon={saving ? <Spinner /> : undefined}
            >
              Save changes
            </Button>
            <Button
              size="$4"
              variant="outlined"
              theme="red"
              onPress={handleDelete}
            >
              Delete room
            </Button>
          </YStack>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
});
