import { useAuthStore } from "@/stores/authStore";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: {
  name: string;
  title: string;
  icon: IconName;
  activeIcon: IconName;
}[] = [
  { name: "index", title: "Home", icon: "home-outline", activeIcon: "home" },
  {
    name: "search",
    title: "Search",
    icon: "search-outline",
    activeIcon: "search",
  },
  {
    name: "bookmarks",
    title: "Saved",
    icon: "bookmark-outline",
    activeIcon: "bookmark",
  },
  {
    name: "profile",
    title: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  if (!isAuthenticated) {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#F1F5F9",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {TAB_CONFIG.map(({ name, title, icon, activeIcon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? activeIcon : icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
