import { Link, router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Button,
    H1,
    Input,
    Paragraph,
    Spinner,
    Text,
    XStack,
    YStack,
} from "tamagui";

import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const backgroundColor = useThemeColor({}, "background");

  const handleRegister = async () => {
    if (!name || !username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await register(username, password, name);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Registration failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <YStack gap="$5" padding="$5" flex={1} justifyContent="center">
          <YStack gap="$2" alignItems="center" marginBottom="$4">
            <H1>Create account</H1>
            <Paragraph color="$gray10" textAlign="center">
              Join MiniPlayParty and start playing
            </Paragraph>
          </YStack>

          <YStack gap="$4">
            <Input
              size="$4"
              placeholder="Display name"
              value={name}
              onChangeText={setName}
            />

            <Input
              size="$4"
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              size="$4"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              size="$4"
              theme="active"
              onPress={handleRegister}
              disabled={loading}
              icon={loading ? <Spinner /> : undefined}
            >
              Create account
            </Button>
          </YStack>

          <XStack
            gap="$2"
            justifyContent="center"
            alignItems="center"
            marginTop="$4"
          >
            <Text>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Text color="$blue10" fontWeight="600">
                Sign in
              </Text>
            </Link>
          </XStack>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
