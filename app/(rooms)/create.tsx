import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

import { useAuth } from "@/contexts/auth-context";
import { roomsApi } from "@/services/api";

export default function CreateRoomScreen() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Create a new room
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Give your room a name and invite friends later
        </Text>

        <TextInput
          label="Room name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          style={styles.button}
        >
          Create room
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
  },
});
