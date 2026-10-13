# 📱 LINC — Flutter Mobile Development & Setup Guide

This guide details the setup, configuration, debugging, and execution instructions for the LINC Flutter client application (`client/mobile`).

---

## 🛠️ Prerequisites & Requirements

### SDK Constraints (from `pubspec.yaml`)
- **Dart SDK:** `>=3.3.0 <4.0.0`
- **Flutter SDK:** `>=3.22.0`
- **Android Studio / Xcode:** Latest stable with Android SDK Platform 34+ and Command-line Tools.
- **Java Development Kit (JDK):** JDK 17 (recommended for Gradle 8.x).

Verify your environment:
```bash
flutter doctor
```
Ensure there are no blocking issues with the Android toolchain or Flutter install.

---

## 🚀 Quick Start Guide

### 1. Navigate to the Mobile Directory
```bash
cd client/mobile
```

### 2. Fetch Dependencies
```bash
flutter pub get
```

### 3. Generate Riverpod & Code Assets (if modifying annotated models)
```bash
dart run build_runner build --delete-conflicting-outputs
```

### 4. Run the Application
- **Android Emulator / Physical Device:**
  ```bash
  flutter run
  ```
- **Flutter Web (Development):**
  ```bash
  flutter run -d chrome
  ```

---

## 🌐 Backend Network Configuration

The LINC mobile app connects to the Express backend via HTTP and Socket.IO for real-time messaging.

### Switching Endpoints in `lib/config/api_config.dart`
The app supports both local development and the hosted Render production cloud:

| Environment | Base URL | Notes |
|---|---|---|
| **Render Cloud (Default)** | `https://linc-backend-2zcf.onrender.com/api/v1` | Hosted cloud instance for staging and team testing. |
| **Android Emulator Local** | `http://10.0.2.2:5000/api/v1` | `10.0.2.2` maps directly to your host machine's `localhost`. |
| **iOS Simulator Local** | `http://localhost:5000/api/v1` | Shares network loopback directly with host machine. |
| **Physical Device (WiFi)** | `http://<YOUR_LOCAL_IP>:5000/api/v1` | Phone and PC must be on the same local Wi-Fi network. |

### In-App Server Config Dialog
You can switch base URLs on the fly from the mobile app:
1. On the Welcome / Auth screen, tap the **Server Config** icon.
2. Select the **Render Cloud Preset** or input a custom local IP address.
3. Tap **Save & Reconnect**.

---

## ⚠️ Common Errors & Troubleshooting

### 1. Android Gradle Memory Heap Exhaustion (`OutOfMemoryError`)
- **Symptom:** Gradle build crashes during release or debug bundling with `java.lang.OutOfMemoryError: Java heap space`.
- **Fix:** Ensure `client/mobile/android/gradle.properties` includes optimized heap configurations:
  ```properties
  org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
  ```

### 2. Android Emulator Cannot Reach `localhost:5000`
- **Symptom:** `SocketException: Connection refused` or network timeout when logging in or making API calls.
- **Fix:** Do not use `http://localhost:5000` on Android emulators. Use `http://10.0.2.2:5000`. For physical Android devices, use your computer's local LAN IP (e.g., `http://192.168.1.100:5000`).

### 3. Render Cloud Backend Cold Starts
- **Symptom:** First request on app startup hangs for 40–60 seconds or times out.
- **Fix:** Render free tier spins down idle instances. The mobile client implements an initial health check with retry timeouts. Wait ~50 seconds for instance spin-up or verify status at `https://linc-backend-2zcf.onrender.com/api/v1/categories`.

### 4. Layout Overflow & `BoxConstraints` Crashes
- **Symptom:** Red error screen stating `BoxConstraints forces an infinite width` or `RenderFlex overflowed by X pixels`.
- **Fix:**
  - Wrap horizontal column children in `Expanded` or `Flexible`.
  - Avoid combining `IntrinsicHeight` with dynamic list views or infinite scroll widgets.
  - Wrap top-level column bodies in `SingleChildScrollView(physics: BouncingScrollPhysics())` when soft keyboards appear on text inputs.

### 5. Missing Token on Guest Mode
- **Symptom:** `401 Unauthorized — no token provided` on public home explore.
- **Fix:** Guest mode is enabled for read-only browsing (`/home`, categories, and public search). If performing an authenticated action (booking, sending message, writing review), the app automatically triggers a navigation redirect to `WelcomeScreen`.

---

## 🧪 Testing

Run Flutter unit and widget tests:
```bash
flutter test
```
