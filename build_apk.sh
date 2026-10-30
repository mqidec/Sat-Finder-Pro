#!/usr/bin/env bash
set -e

echo "=== 1. Setting up Java 21 ==="
JAVA_DIR="/tmp/java"
if [ ! -f "$JAVA_DIR/bin/java" ]; then
  mkdir -p "$JAVA_DIR"
  echo "Downloading OpenJDK 21 Temurin..."
  curl -sL "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.6%2B7/OpenJDK21U-jdk_x64_linux_hotspot_21.0.6_7.tar.gz" | tar -xz --strip-components=1 -C "$JAVA_DIR"
fi

export JAVA_HOME="$JAVA_DIR"
export PATH="$JAVA_HOME/bin:$PATH"
java -version

echo "=== 2. Setting up Android SDK ==="
SDK_DIR="/tmp/android-sdk"
if [ ! -f "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" ]; then
  mkdir -p "$SDK_DIR/cmdline-tools"
  cd /tmp
  curl -sL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o cmdtools.zip
  unzip -q cmdtools.zip
  mv cmdline-tools "$SDK_DIR/cmdline-tools/latest"
  rm cmdtools.zip
fi

export ANDROID_HOME="$SDK_DIR"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

echo "Accepting Android SDK licenses..."
yes | "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" --licenses > /dev/null 2>&1 || true

echo "Installing Android platform and build-tools..."
"$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" "platform-tools" "platforms;android-34" "platforms;android-35" "build-tools;35.0.0" > /dev/null 2>&1 || true

echo "=== 3. Building Web Assets ==="
cd /app/applet
npm run build

echo "=== 4. Syncing Capacitor Android Project ==="
npx cap sync android

echo "=== 5. Building Native Android APK ==="
echo "sdk.dir=$SDK_DIR" > /app/applet/android/local.properties
chmod +x /app/applet/android/gradlew
cd /app/applet/android
./gradlew assembleDebug --no-daemon --max-workers=1

echo "=== 6. Deploying APK to destination directories ==="
APK_OUTPUT="/app/applet/android/app/build/outputs/apk/debug/app-debug.apk"

if [ ! -f "$APK_OUTPUT" ]; then
  echo "FATAL: APK was not found at $APK_OUTPUT"
  find /app/applet/android -name "*.apk"
  exit 1
fi

mkdir -p /app/applet/.build-outputs
mkdir -p /app/applet/APK_DOWNLOAD
mkdir -p /app/applet/public/APK_DOWNLOAD

cp -vf "$APK_OUTPUT" /app/applet/.build-outputs/app-debug.apk
cp -vf "$APK_OUTPUT" /app/applet/APK_DOWNLOAD/app-debug.apk
cp -vf "$APK_OUTPUT" /app/applet/public/APK_DOWNLOAD/app-debug.apk

echo "=== 7. Verification ==="
ls -lh /app/applet/.build-outputs/app-debug.apk
ls -lh /app/applet/APK_DOWNLOAD/app-debug.apk

FILE_SIZE=$(stat -c%s "/app/applet/APK_DOWNLOAD/app-debug.apk")
echo "APK Size in bytes: $FILE_SIZE"

if [ "$FILE_SIZE" -lt 1000000 ]; then
  echo "ERROR: APK is smaller than 1MB"
  exit 1
fi

echo "SUCCESS: Valid installable Android APK compiled and placed in APK_DOWNLOAD/app-debug.apk and .build-outputs/app-debug.apk"
