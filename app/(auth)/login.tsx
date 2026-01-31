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

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const backgroundColor = useThemeColor({}, "background");

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Login failed",
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
            <H1>MiniPlayParty</H1>
            <Paragraph color="$gray10" textAlign="center">
              Sign in to join or create rooms
            </Paragraph>
          </YStack>

          <YStack gap="$4">
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
              onPress={handleLogin}
              disabled={loading}
              icon={loading ? <Spinner /> : undefined}
            >
              Sign in
            </Button>
          </YStack>

          <XStack
            gap="$2"
            justifyContent="center"
            alignItems="center"
            marginTop="$4"
          >
            <Text>Don&apos;t have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <Text color="$blue10" fontWeight="600">
                Register
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
