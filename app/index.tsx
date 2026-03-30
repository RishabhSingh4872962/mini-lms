import { useAuthStore } from "@/stores/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}
