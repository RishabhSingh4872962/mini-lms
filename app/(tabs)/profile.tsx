import { useAuthStore } from "@/stores/authStore";
import { useCourseStore } from "@/stores/courseStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color: string;
  bg: string;
}

function StatCard({ icon, value, label, color, bg }: StatCardProps) {
  return (
    <View
      className="flex-1 rounded-2xl p-4 items-center gap-1"
      style={{ backgroundColor: bg }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-1"
        style={{ backgroundColor: color + "20" }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-slate-900 text-xl font-bold">{value}</Text>
      <Text className="text-slate-500 text-xs text-center">{label}</Text>
    </View>
  );
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

function MenuItem({
  icon,
  label,
  sublabel,
  onPress,
  danger = false,
  rightElement,
}: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 py-4 active:bg-slate-50 px-1"
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center ${
          danger ? "bg-red-50" : "bg-slate-100"
        }`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? "#EF4444" : "#64748B"}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`font-semibold text-base ${
            danger ? "text-red-500" : "text-slate-800"
          }`}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text className="text-slate-400 text-xs mt-0.5">{sublabel}</Text>
        ) : null}
      </View>
      {rightElement ?? (
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      )}
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-slate-100 mx-1" />;
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { courses, bookmarks } = useCourseStore();

  const bookmarkCount = bookmarks.size;
  const totalCourses = courses.length;

  // Synthetic enrolled count (persist with AsyncStorage in a real app)
  const enrolledCount = Math.min(3, Math.floor(bookmarkCount / 2));

  const avatarUrl =
    user?.avatar?.url && user.avatar.url !== ""
      ? user.avatar.url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user?.username ?? "U",
        )}&background=4F46E5&color=fff&size=200`;

  const handleLogout = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  }, [logout]);

  const handleNotImplemented = useCallback(() => {
    Alert.alert("Coming Soon", "This feature is under development.");
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Header ── */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-slate-900 text-2xl font-bold">Profile</Text>
        </View>

        {/* ── Avatar + Info Card ── */}
        <View className="mx-4 mt-3 bg-white rounded-3xl p-5 border border-slate-100 items-center">
          <View className="relative mb-4">
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 90, height: 90, borderRadius: 45 }}
              contentFit="cover"
            />
            <Pressable
              onPress={handleNotImplemented}
              className="absolute bottom-0 right-0 bg-indigo-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white"
            >
              <Ionicons name="camera" size={14} color="white" />
            </Pressable>
          </View>

          <Text className="text-slate-900 text-xl font-bold capitalize">
            {user?.username ?? "User"}
          </Text>
          <Text className="text-slate-400 text-sm mt-1">
            {user?.email ?? "—"}
          </Text>

          {/* Role badge */}
          <View className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-1.5">
            <Text className="text-indigo-600 text-xs font-bold">
              {user?.role ?? "USER"}
            </Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <View className="flex-row mx-4 mt-3 gap-3">
          <StatCard
            icon="library-outline"
            value={enrolledCount}
            label="Enrolled"
            color="#4F46E5"
            bg="#EEF2FF"
          />
          <StatCard
            icon="bookmark"
            value={bookmarkCount}
            label="Saved"
            color="#F59E0B"
            bg="#FFFBEB"
          />
          <StatCard
            icon="layers-outline"
            value={totalCourses}
            label="Available"
            color="#10B981"
            bg="#ECFDF5"
          />
        </View>

        {/* ── Account Section ── */}
        <View className="mx-4 mt-4 bg-white rounded-3xl px-4 border border-slate-100">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider pt-4 pb-2">
            Account
          </Text>
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            sublabel="Update your personal info"
            onPress={handleNotImplemented}
          />
          <Divider />
          <MenuItem
            icon="lock-closed-outline"
            label="Change Password"
            sublabel="Keep your account secure"
            onPress={handleNotImplemented}
          />
          <Divider />
          <MenuItem
            icon="mail-outline"
            label="Email"
            sublabel={user?.email ?? "—"}
            onPress={handleNotImplemented}
            rightElement={
              user?.isEmailVerified ? (
                <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text className="text-emerald-600 text-xs font-semibold">
                    Verified
                  </Text>
                </View>
              ) : (
                <View className="bg-amber-50 px-2 py-1 rounded-lg">
                  <Text className="text-amber-600 text-xs font-semibold">
                    Unverified
                  </Text>
                </View>
              )
            }
          />
        </View>

        {/* ── Preferences Section ── */}
        <View className="mx-4 mt-4 bg-white rounded-3xl px-4 border border-slate-100">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider pt-4 pb-2">
            Preferences
          </Text>
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            sublabel="Manage push notifications"
            onPress={handleNotImplemented}
          />
          <Divider />
          <MenuItem
            icon="moon-outline"
            label="Appearance"
            sublabel="Light / Dark mode"
            onPress={handleNotImplemented}
          />
          <Divider />
          <MenuItem
            icon="language-outline"
            label="Language"
            sublabel="English"
            onPress={handleNotImplemented}
          />
        </View>

        {/* ── Support Section ── */}
        <View className="mx-4 mt-4 bg-white rounded-3xl px-4 border border-slate-100">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider pt-4 pb-2">
            Support
          </Text>
          <MenuItem
            icon="help-circle-outline"
            label="Help & FAQ"
            onPress={handleNotImplemented}
          />
          <Divider />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={handleNotImplemented}
          />
          <Divider />
          <MenuItem
            icon="document-text-outline"
            label="Terms of Service"
            onPress={handleNotImplemented}
          />
        </View>

        {/* ── Danger Zone ── */}
        <View className="mx-4 mt-4 bg-white rounded-3xl px-4 border border-slate-100 mb-2">
          <MenuItem
            icon="log-out-outline"
            label="Sign Out"
            danger
            onPress={handleLogout}
            rightElement={<View />}
          />
        </View>

        {/* ── App version ── */}
        <Text className="text-center text-slate-300 text-xs mt-4">
          LearnHub v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
