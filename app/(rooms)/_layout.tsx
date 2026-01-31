import { Stack } from "expo-router";

export default function RoomsLayout() {
  return (
    <Stack>
      <Stack.Screen name="list" options={{ title: "Browse Rooms" }} />
      <Stack.Screen name="create" options={{ title: "Create Room" }} />
      <Stack.Screen name="[id]" options={{ title: "Room" }} />
      <Stack.Screen name="edit/[id]" options={{ title: "Edit Room" }} />
    </Stack>
  );
}
