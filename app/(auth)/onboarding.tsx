import { router } from "expo-router";
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

export default function OnboardingScreen() {
  const { seamlessRegister, restoreFromCloud, storedCredentials } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const backgroundColor = useThemeColor({}, "background");

  const handleGetStarted = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter a display name");
      return;
    }

    setLoading(true);
    try {
      await seamlessRegister(displayName.trim());
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Failed to create account",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restoreFromCloud();
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Failed to restore account",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setRestoring(false);
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
            <H1>Welcome to MiniPlayParty</H1>
            <Paragraph color="$gray10" textAlign="center">
              Join the fun! Just enter your display name and we&apos;ll take care of
              the rest.
            </Paragraph>
          </YStack>

          {storedCredentials && (
            <YStack
              gap="$3"
              padding="$4"
              backgroundColor="$blue2"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$blue6"
              marginBottom="$3"
            >
              <Text fontWeight="600" color="$blue11">
                Welcome back!
              </Text>
              <Text color="$blue11">
                We found your previous account: {storedCredentials.displayName}
              </Text>
              <Button
                size="$3"
                theme="blue"
                onPress={handleRestore}
                disabled={restoring}
                icon={restoring ? <Spinner /> : undefined}
              >
                Restore my account
              </Button>
            </YStack>
          )}

          <YStack gap="$4">
            <Input
              size="$4"
              placeholder="Enter your display name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />

            <Button
              size="$4"
              theme="active"
              onPress={handleGetStarted}
              disabled={loading}
              icon={loading ? <Spinner /> : undefined}
            >
              {storedCredentials ? "Create new account" : "Get started"}
            </Button>
          </YStack>

          <XStack
            gap="$2"
            justifyContent="center"
            alignItems="center"
            marginTop="$4"
          >
            <Text color="$gray10" fontSize="$2" textAlign="center">
              By continuing, your credentials will be securely stored for easy
              access next time
            </Text>
          </XStack>

          <XStack
            gap="$2"
            justifyContent="center"
            alignItems="center"
            marginTop="$2"
          >
            <Text fontSize="$2">Have username and password?</Text>
            <Button
              chromeless
              size="$2"
              onPress={() => router.push("/(auth)/login")}
            >
              Sign in
            </Button>
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
