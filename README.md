# LearnHub — Mini LMS Mobile App

A production-ready **Learning Management System** built with React Native Expo, demonstrating native features, WebView integration, state management, and robust error handling.

---

## Table of Contents

- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Architecture Decisions](#architecture-decisions)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [WebView Communication](#webview-communication)
- [Native Features](#native-features)
- [Error Handling](#error-handling)
- [Performance](#performance)
- [Building the APK](#building-the-apk)
- [Known Issues & Limitations](#known-issues--limitations)

---

## Screenshots

### Authentication & Home

| Login                      | Register                      | Home                      |
| -------------------------- | ----------------------------- | ------------------------- |
| ![](screenshots/login.png) | ![](screenshots/register.png) | ![](screenshots/home.png) |

---

### Course Experience

| Course Detail                      | WebView Content              | Bookmarks                      |
| ---------------------------------- | ---------------------------- | ------------------------------ |
| ![](screenshots/course-detail.png) | ![](screenshots/webview.png) | ![](screenshots/bookmarks.png) |

---

### Discovery & Profile

| Search                             | Profile                             | Offline                             |
| ---------------------------------- | ----------------------------------- | ----------------------------------- |
| ![](assets/screenshots/search.png) | ![](assets/screenshots/profile.png) | ![](assets/screenshots/offline.png) |

---

## Tech Stack

| Category          | Technology                             |
| ----------------- | -------------------------------------- |
| Framework         | React Native Expo SDK 54               |
| Language          | TypeScript (strict mode)               |
| Navigation        | Expo Router v6 (file-based)            |
| Styling           | NativeWind v4 (Tailwind for RN)        |
| State Management  | Zustand v5 with persistence middleware |
| Sensitive Storage | Expo SecureStore                       |
| App Storage       | AsyncStorage                           |
| API Client        | Axios with interceptors                |
| Form Handling     | React Hook Form + Zod                  |
| List Rendering    | LegendList v2                          |
| Images            | expo-image                             |
| WebView           | react-native-webview                   |
| Notifications     | expo-notifications                     |
| Network           | expo-network                           |
| Haptics           | expo-haptics                           |

---

## Features

### Part 1 — Authentication

- Login and registration with full Zod validation
- Tokens stored in **Expo SecureStore** (never AsyncStorage)
- Auto-login on app restart via token validation against `/current-user`
- Silent token refresh on 401 with request queue (no duplicate refresh calls)
- Logout clears both SecureStore tokens and Zustand state

### Part 2 — Course Catalog

- Fetches products (as courses) and random users (as instructors) in parallel
- Merges both datasets deterministically — same course always gets same instructor
- Infinite scroll with **LegendList** (`estimatedItemSize`, `recycleItems`)
- Pull-to-refresh
- Search across title, description, category, and instructor name
- Category filter chips
- Skeleton loaders during initial fetch
- Bookmark toggle persisted in AsyncStorage via Zustand `persist` middleware
- Course detail screen with enroll simulation

### Part 3 — WebView Integration

- Local HTML template generated in-app (no external URL needed)
- **Native → WebView**: course data injected via `injectJavaScript` + `postMessage`
- **Native → WebView**: bookmark toggle synced to WebView toast
- **WebView → Native**: enroll event triggers native Alert
- **WebView → Native**: lesson progress updates native header bar in real time
- `injectedJavaScriptBeforeContentLoaded` injects app context (`platform`, `courseId`, `appVersion`)
- Hardware back button navigates WebView history before closing screen
- WebView error state with retry

### Part 4 — Native Features

- Local notification on **5th bookmark** milestone (fires immediately)
- **24-hour reminder** notification scheduled on every app open (cancelled + rescheduled)
- Notification permissions requested gracefully
- Platform guard for web (notifications skipped on web)

### Part 5 — State Management & Performance

- Zustand stores for auth, courses, and bookmarks
- Auth state (non-sensitive) persisted to AsyncStorage; tokens in SecureStore only
- Bookmarks persisted as array (Set serialised → array → Set on rehydration)
- `useMemo` for filtered course lists
- `useCallback` for all list render functions
- `memo` on `CourseCard` and `SearchResultCard`

### Part 6 — Error Handling

- `useNetworkStatus` hook polls every 5 seconds + re-checks on app foreground
- Animated `OfflineBanner` slides in/out globally across all screens
- `ErrorBoundary` class component wraps entire app — shows dev stack trace in `__DEV__`
- `useRetry` hook — exponential backoff (800ms → 1.6s → 3.2s), configurable max attempts
- `parseApiError` maps HTTP status codes to human-readable messages
- Axios response interceptor retries network-level failures (no response) up to 3 times
- Timeout configured at 15 seconds per request
- Offline mode shows cached courses and search results

---

## Project Structure

```
├── app/
│   ├── _layout.tsx              # Root layout — providers, error boundary, splash
│   ├── index.tsx                # Auth redirect gate
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Bottom tab navigator
│   │   ├── index.tsx            # Home — course catalog
│   │   ├── search.tsx           # Search with filters + highlight
│   │   ├── bookmarks.tsx        # Saved courses
│   │   └── profile.tsx          # User profile + stats
│   └── course/
│       ├── [id].tsx             # Course detail
│       └── webview/
│           └── [id].tsx         # WebView content viewer
│
├── api/
│   ├── client.ts                # Axios instance + interceptors + parseApiError
│   ├── auth.ts                  # Auth endpoints
│   ├── courses.ts               # Products + users endpoints
│   └── profile.ts               # Profile update endpoint
│
├── stores/
│   ├── authStore.ts             # Auth state + actions
│   └── courseStore.ts           # Courses + bookmarks + pagination
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx            # With show/hide password toggle
│   │   └── ErrorBanner.tsx
│   ├── courses/
│   │   ├── CourseCard.tsx       # Memoized list card
│   │   ├── CourseCardSkeleton.tsx
│   │   └── SearchBar.tsx
│   └── common/
│       ├── EmptyState.tsx
│       ├── OfflineBanner.tsx    # Animated network status banner
│       ├── ErrorBoundary.tsx    # React class error boundary
│       └── NetworkStatusProvider.tsx
│
├── hooks/
│   ├── useNetworkStatus.ts      # Polling network state
│   └── useRetry.ts              # Exponential backoff retry
│
├── lib/
│   ├── secureStore.ts           # Token storage abstraction
│   ├── notifications.ts         # Notification helpers
│   └── courseHtmlTemplate.ts    # WebView HTML template generator
│
├── schemas/
│   └── auth.schema.ts           # Zod schemas + inferred types
│
├── types/
│   ├── auth.types.ts
│   ├── api.types.ts
│   └── course.types.ts
│
├── constants/
│   └── api.ts                   # Base URL, endpoints, timeout constants
│
├── global.css                   # NativeWind base styles
├── tailwind.config.js
├── babel.config.js
├── app.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For Android: Android Studio with an emulator, or a physical device with Expo Go
- For iOS: Xcode + Simulator (macOS only), or Expo Go on device

### 1. Clone the repository

```bash
git clone https://github.com/your-username/learnhub-lms.git
cd learnhub-lms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npx expo start --clear
```

Scan the QR code with **Expo Go** on your device, or press:

- `a` — open on Android emulator
- `i` — open on iOS simulator

### Demo Credentials

The app ships with a demo hint on the login screen:

```
username: doejohn
password: test@123
```

---

## Environment Variables

This project uses **no `.env` file** — the API base URL is a public endpoint configured directly in `constants/api.ts`.

```typescript
// constants/api.ts
export const API_BASE_URL = "https://api.freeapi.app";
export const API_TIMEOUT = 15_000; // 15 seconds
export const API_MAX_RETRIES = 3;
```

If you need to point to a different API, update `API_BASE_URL` in that file.

> **SecureStore note:** Expo SecureStore is not available in Expo Go on some older Android versions. Use a development build (`npx expo run:android`) for full SecureStore support.

---

## Architecture Decisions

### File-based routing with Expo Router

Expo Router v6 provides a Next.js-like file system routing. Route groups `(auth)` and `(tabs)` keep navigation concerns separated without affecting the URL. The root `index.tsx` acts as a redirect gate — users are sent to login or tabs based on auth state, preventing flash of wrong screen.

### Auth token strategy — SecureStore only for tokens

Tokens (`accessToken`, `refreshToken`) are stored exclusively in **Expo SecureStore**, which uses the device Keychain (iOS) and EncryptedSharedPreferences (Android). Non-sensitive user data (username, email, role) is persisted in AsyncStorage via Zustand's `persist` middleware for fast hydration on startup. This separation follows the principle of least privilege.

### Zustand over Redux / Context

Zustand was chosen because it has zero boilerplate, supports async actions naturally, and its `persist` middleware handles AsyncStorage serialisation cleanly. The `partialize` option lets us exclude derived state (like `isLoading`) from persistence. `Set<number>` for bookmarks is serialised to a plain array on write and rehydrated back to a `Set` on read.

### LegendList over FlatList

LegendList is a drop-in FlatList replacement with significantly better recycling performance on large datasets. `estimatedItemSize` and `recycleItems` are set so the list pre-allocates item slots rather than creating and destroying components on scroll.

### Axios interceptors for token refresh

The response interceptor handles 401s with a **request queue pattern** — if a refresh is already in progress, subsequent 401 requests are queued and replayed once the new token arrives. This prevents the race condition where multiple simultaneous 401s would fire multiple refresh calls.

### WebView communication via postMessage

Rather than URL scheme injection or custom headers for data passing, `injectJavaScript` + `window.dispatchEvent(new MessageEvent(...))` is used bidirectionally. This is the most reliable approach across iOS and Android WebView implementations and avoids security issues with custom URL schemes.

### Deterministic synthetic data

Since the free API provides no course metadata (duration, level, rating), values are derived deterministically from the course `id` using modular arithmetic. The same course always renders the same metadata across sessions, making the UI feel consistent without a real backend.

---

## State Management

```
┌─────────────────────────────────────────────┐
│                  Zustand Stores              │
│                                             │
│  authStore          courseStore             │
│  ──────────         ─────────────           │
│  user               courses[]              │
│  isAuthenticated    bookmarks (Set)         │
│  isLoading          currentPage             │
│  error              hasMore                 │
│                     isLoadingMore           │
└────────┬──────────────────┬────────────────┘
         │                  │
    SecureStore          AsyncStorage
  (access token)      (user data +
  (refresh token)      bookmarks array)
```

---

## API Integration

| Endpoint                        | Method | Purpose                      |
| ------------------------------- | ------ | ---------------------------- |
| `/api/v1/users/login`           | POST   | Login                        |
| `/api/v1/users/register`        | POST   | Register                     |
| `/api/v1/users/logout`          | POST   | Logout                       |
| `/api/v1/users/current-user`    | GET    | Validate token / get profile |
| `/api/v1/users/refresh-token`   | POST   | Refresh access token         |
| `/api/v1/public/randomproducts` | GET    | Course list (paginated)      |
| `/api/v1/public/randomusers`    | GET    | Instructor list (paginated)  |

All requests attach `Authorization: Bearer <token>` via request interceptor. Retry logic with exponential backoff handles network failures (no response). Status-code-aware error messages are surfaced via `parseApiError`.

---

## WebView Communication

```
React Native (Native)              WebView (HTML/JS)
──────────────────────             ─────────────────
                         inject
injectJavaScript()  ─────────────▶  window.dispatchEvent
                                     (MessageEvent)
                                           │
                                     render course data
                                     lesson interactions
                         message
onMessage handler   ◀─────────────  ReactNativeWebView
                                     .postMessage()
```

**Native → WebView messages:**

- `COURSE_DATA` — full course object injected on load
- `TOGGLE_BOOKMARK` — bookmark state change to show WebView toast

**WebView → Native messages:**

- `ENROLL` — user tapped enroll in WebView, triggers native Alert
- `LESSON_PROGRESS` — completed lesson count + percentage, updates native header

---

## Native Features

### Notifications

| Trigger                | Type                         | Timing                             |
| ---------------------- | ---------------------------- | ---------------------------------- |
| 5th bookmark added     | Immediate local notification | Fires instantly                    |
| App opened / refreshed | 24-hour reminder             | Fires 24h later, replaces previous |

Permissions are requested lazily — only when the first notification would fire. The reminder notification is cancelled and rescheduled on each app open so the 24h window always resets from the last visit.

### Network Monitoring

`useNetworkStatus` polls `expo-network` every 5 seconds and also triggers on `AppState` change from background to active. Status is provided globally via `NetworkStatusProvider` context so any screen can read it without adding its own polling.

---

## Error Handling

```
App Launch
    │
    ▼
ErrorBoundary (class component)
    │  catches render errors
    │  shows dev stack trace in __DEV__
    │
    ▼
NetworkStatusProvider
    │  polls every 5s
    │
    ▼
OfflineBanner (animated, position: absolute)
    │  slides in when offline
    │
    ▼
Screens use useRetry() for API calls
    │  attempt 1 → wait 800ms
    │  attempt 2 → wait 1600ms
    │  attempt 3 → wait 3200ms → show error
    │
    ▼
parseApiError() maps status codes
    │  401 → "Session expired"
    │  429 → "Too many requests"
    │  500 → "Server error"
    │  network → "You may be offline"
```

---

## Performance

- `React.memo` on `CourseCard`, `SearchResultCard`
- `useCallback` on all `renderItem`, `keyExtractor`, event handlers
- `useMemo` on filtered/sorted course lists
- `LegendList` with `recycleItems` and `estimatedItemSize={290}`
- `expo-image` with `transition={300}` for smooth image loading and built-in caching
- Skeleton loaders block UI only during initial fetch — subsequent refreshes use `isRefreshing` with pull-to-refresh
- Parallel `Promise.all` for fetching products + instructors simultaneously

---

## Building the APK

### Development Build (recommended for testing)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS
eas build:configure

# Build development APK for Android
eas build --platform android --profile development
```

### Local Build (no EAS account needed)

```bash
# Prebuild native directories
npx expo prebuild --platform android

# Build debug APK
cd android && ./gradlew assembleDebug

# APK location
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Production APK

```bash
eas build --platform android --profile production
```

Configure `eas.json` before building:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## Known Issues & Limitations

### SecureStore in Expo Go

Expo SecureStore has limited support in the Expo Go app on some Android versions. For full SecureStore functionality, use a development build (`npx expo run:android`).

### Notification permissions on Android 13+

Android 13 and above require explicit `POST_NOTIFICATIONS` permission. The app requests this at runtime before scheduling the first notification. If denied, notifications are silently skipped.

### LegendList peer dependency

`@legendapp/list` requires `react-native-reanimated` and `react-native-worklets`. Both are included in the project's dependencies. Ensure `babel.config.js` includes `react-native-reanimated/plugin` as the last plugin entry.

### WebView on Expo Go (iOS)

The react-native-webview package is not available in the standard Expo Go app on iOS. Use a development build or test on Android Expo Go, which does include WebView.

### Synthetic course data

Course ratings, duration, level, and student count are generated deterministically from the product ID — they are not real values from the API. The free API does not provide this metadata for products.

### Profile avatar update

The avatar update button is wired to the `PATCH /api/v1/users/avatar` endpoint in `api/profile.ts`, but the UI shows a "Coming Soon" alert. This is because the free API's avatar upload may require additional authentication that varies by account. The API integration code is complete and ready to connect.

### Pagination sync between products and users

Products and users are fetched from separate paginated endpoints. Page numbers are kept in sync (`Promise.all`), but if either API returns fewer results than the other, the instructor assigned to a course may repeat. This is handled gracefully by the modulo operation in `mergeCourses`.

---

## License

MIT — free to use for portfolio and educational purposes.

---

## Author

Built as part of a React Native Expo developer assignment demonstrating:
senior-level architecture, TypeScript strict mode, native feature integration,
WebView bidirectional communication, and production-ready error handling.
