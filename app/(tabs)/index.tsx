import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  Card,
  H1,
  H3,
  Paragraph,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";

import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Room, roomsApi } from "@/services/api";

export default function HomeScreen() {
  const { user, token, logout } = useAuth();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const backgroundColor = useThemeColor({}, "background");

  const fetchMyRooms = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await roomsApi.list(token);
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

  // Refetch rooms when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchMyRooms();
      }
    }, [user, fetchMyRooms]),
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <YStack padding="$4" gap="$5">
          {/* Header */}
          <YStack gap="$2">
            <H1>MiniPlayParty</H1>
            <Text fontSize="$5" color="$gray11">
              {user ? `Welcome, ${user.name}!` : "Rooms hub"}
            </Text>
            <Paragraph color="$gray10">
              Create a room or jump into an existing one to start a mini‑game
              with friends.
            </Paragraph>
          </YStack>

          {/* Action Buttons */}
          <XStack gap="$3">
            {user ? (
              <>
                <Button
                  flex={1}
                  size="$4"
                  theme="active"
                  onPress={() => router.push("/(rooms)/create")}
                >
                  Create room
                </Button>
                <Button
                  flex={1}
                  size="$4"
                  variant="outlined"
                  onPress={() => router.push("/(rooms)/list")}
                >
                  Browse rooms
                </Button>
              </>
            ) : (
              <>
                <Button
                  flex={1}
                  size="$4"
                  theme="active"
                  onPress={() => router.push("/(auth)/onboarding")}
                >
                  Get started
                </Button>
                <Button
                  flex={1}
                  size="$4"
                  variant="outlined"
                  onPress={() => router.push("/(auth)/login")}
                >
                  Sign in
                </Button>
              </>
            )}
          </XStack>

          {/* User's Rooms Section */}
          {user && (
            <YStack gap="$3">
              <H3>Your rooms</H3>

              {loading ? (
                <YStack paddingVertical="$5" alignItems="center">
                  <Spinner size="large" />
                </YStack>
              ) : myRooms.length > 0 ? (
                <YStack gap="$2">
                  {myRooms.slice(0, 3).map((room) => (
                    <Pressable
                      key={room.id}
                      onPress={() => router.push(`/(rooms)/${room.id}`)}
                    >
                      <Card
                        elevation="$1"
                        borderWidth={1}
                        borderColor="$gray5"
                        padding="$3"
                      >
                        <XStack
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <YStack>
                            <Text fontWeight="600">{room.name}</Text>
                            <Text fontSize="$2" color="$gray10">
                              {room.users.length} member
                              {room.users.length === 1 ? "" : "s"}
                            </Text>
                          </YStack>
                          <Button
                            size="$2"
                            chromeless
                            onPress={() => router.push(`/(rooms)/${room.id}`)}
                          >
                            Open
                          </Button>
                        </XStack>
                      </Card>
                    </Pressable>
                  ))}
                </YStack>
              ) : (
                <Card borderWidth={1} borderColor="$gray5" padding="$4">
                  <YStack gap="$2" alignItems="center">
                    <Text textAlign="center">
                      You don&apos;t have any rooms yet.
                    </Text>
                    <Text fontSize="$2" color="$gray10" textAlign="center">
                      Create one or ask someone to invite you!
                    </Text>
                    <XStack gap="$2" marginTop="$2">
                      <Button
                        size="$3"
                        theme="active"
                        onPress={() => router.push("/(rooms)/create")}
                      >
                        Create room
                      </Button>
                      <Button
                        size="$3"
                        variant="outlined"
                        onPress={() => router.push("/(rooms)/list")}
                      >
                        Browse
                      </Button>
                    </XStack>
                  </YStack>
                </Card>
              )}

              <Button
                chromeless
                onPress={handleLogout}
                disabled={loggingOut}
                icon={loggingOut ? <Spinner /> : undefined}
              >
                Sign out
              </Button>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
