import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, H2, Input, Label, Paragraph, Spinner, YStack } from "tamagui";

import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { roomsApi } from "@/services/api";

export default function CreateRoomScreen() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const backgroundColor = useThemeColor({}, "background");

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a room name");
      return;
    }

    if (!token) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    setLoading(true);
    try {
      const room = await roomsApi.create(token, { name: name.trim() });
      Alert.alert("Success", "Room created!");
      router.replace(`/(rooms)/${room.id}`);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create room",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <YStack flex={1} padding="$5" gap="$3">
          <H2>Create a new room</H2>
          <Paragraph color="$gray10">
            Give your room a name and invite friends later
          </Paragraph>

          <YStack marginTop="$4" gap="$2">
            <Label htmlFor="room-name">Room name</Label>
            <Input
              id="room-name"
              size="$4"
              placeholder="Enter room name"
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
            />
          </YStack>

          <Button
            size="$4"
            theme="active"
            marginTop="$4"
            onPress={handleCreate}
            disabled={loading}
            icon={loading ? <Spinner /> : undefined}
          >
            Create room
          </Button>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
