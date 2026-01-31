import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Avatar,
  Button,
  Card,
  H2,
  H3,
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

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const backgroundColor = useThemeColor({}, "background");

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
            <Card
              elevation="$1"
              borderWidth={1}
              borderColor="$gray5"
              padding="$4"
              marginBottom="$4"
            >
              <YStack gap="$3">
                <XStack gap="$3" alignItems="center">
                  <Avatar circular size="$6" backgroundColor="$blue9">
                    {room.avatar ? (
                      <Avatar.Image src={room.avatar} />
                    ) : (
                      <Avatar.Fallback
                        backgroundColor="$blue9"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <SizableText color="$white" fontWeight="600">
                          {room.name.substring(0, 2).toUpperCase()}
                        </SizableText>
                      </Avatar.Fallback>
                    )}
                  </Avatar>
                  <YStack>
                    <H2>{room.name}</H2>
                    <Text fontSize="$3" color="$gray10">
                      {room.users.length} member
                      {room.users.length === 1 ? "" : "s"}
                    </Text>
                  </YStack>
                </XStack>
                <XStack gap="$2" justifyContent="flex-end">
                  {isAdmin && (
                    <Button
                      size="$3"
                      variant="outlined"
                      onPress={() => router.push(`/(rooms)/edit/${id}`)}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    size="$3"
                    variant="outlined"
                    theme="red"
                    onPress={handleLeave}
                  >
                    Leave
                  </Button>
                </XStack>
              </YStack>
            </Card>

            <H3 marginBottom="$2">Members</H3>
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
            {item.isAdmin && (
              <View style={styles.badge}>
                <Text fontSize="$1" color="$blue11">
                  Admin
                </Text>
              </View>
            )}
          </XStack>
        )}
        ListFooterComponent={
          isAdmin && room.requests.length > 0 ? (
            <>
              <Separator marginVertical="$4" />
              <H3 marginBottom="$2">Join requests</H3>
              {room.requests.map((req) => (
                <XStack
                  key={req.id}
                  padding="$3"
                  gap="$3"
                  alignItems="center"
                  borderBottomWidth={1}
                  borderColor="$gray5"
                >
                  <Avatar circular size="$4" backgroundColor="$orange9">
                    {req.avatar ? (
                      <Avatar.Image src={req.avatar} />
                    ) : (
                      <Avatar.Fallback
                        backgroundColor="$orange9"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <SizableText color="$white" fontSize="$2">
                          {req.name.substring(0, 2).toUpperCase()}
                        </SizableText>
                      </Avatar.Fallback>
                    )}
                  </Avatar>
                  <YStack flex={1}>
                    <Text fontWeight="500">{req.name}</Text>
                    <Text fontSize="$2" color="$gray10">
                      @{req.username}
                    </Text>
                  </YStack>
                  <XStack gap="$2">
                    <Button
                      size="$2"
                      theme="active"
                      onPress={() => handleAcceptUser(req.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="$2"
                      variant="outlined"
                      onPress={() => handleRejectUser(req.id)}
                    >
                      Reject
                    </Button>
                  </XStack>
                </XStack>
              ))}
            </>
          ) : null
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
  badge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
