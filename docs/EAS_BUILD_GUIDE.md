# EAS Build Guide for CME Agent

## What is EAS?

**Expo Application Services (EAS) Build** is a cloud-based service provided by Expo that handles building, signing, and submitting native apps (iOS and Android) without requiring local Xcode or Android Studio setup. Instead of building on your machine, you push your code to Expo's servers, and they handle the entire build process.

### Why use EAS?

1. **No Local Build Tools Required** - No need to install Xcode, Android Studio, or manage NDKs
2. **Consistent Builds** - All builds happen in the same controlled environment
3. **Platform-Specific Code Signing** - Handles certificate and provisioning profile management
4. **CI/CD Integration** - Easily integrates with GitHub Actions, GitLab CI, and other CI/CD platforms
5. **App Store Submission** - Can automatically submit builds to TestFlight, Google Play, etc.
6. **Build Matrix** - Build for multiple platforms simultaneously

## Configuration Overview

The `eas.json` file defines three build profiles for CME Agent:

### Development Profile
- **Purpose**: Local testing on physical devices or simulators
- **Distribution**: Internal (not submitted to app stores)
- **Platform-Specific**:
  - **Android**: APK format for easy installation
  - **iOS**: Simulator build for development testing
- **Key Features**: Includes development client for fast iteration

### Preview Profile
- **Purpose**: Internal testing via TestFlight or internal distribution
- **Distribution**: Internal (not submitted to app stores)
- **Platform-Specific**:
  - **Android**: APK format
  - **iOS**: Release build compatible with TestFlight
- **Key Features**: Uses "preview" channel for OTA updates

### Production Profile
- **Purpose**: Final production builds for App Store and Play Store submission
- **Distribution**: Store (submitted to official app stores)
- **Platform-Specific**:
  - **Android**: AAB (Android App Bundle) format for Play Store
  - **iOS**: Archive suitable for App Store Connect
- **Key Features**:
  - Auto-submit enabled for streamlined releases
  - Large resource class for faster compilation
  - Production environment variables

## Common Commands

### Installation

First, install the EAS CLI:

```bash
npm install -g eas-cli
```

Or use npx to run without installation:

```bash
npx eas-cli --version
```

### Authentication

Log in to your Expo account:

```bash
eas login
```

You'll be prompted to enter your Expo credentials.

### Building

#### Development Build
```bash
eas build --platform all --profile development
```

For specific platform:
```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

#### Preview Build
```bash
eas build --platform all --profile preview
```

For specific platform:
```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

#### Production Build
```bash
eas build --platform all --profile production
```

For specific platform:
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Monitoring Builds

View build status:
```bash
eas build --status
```

View build logs:
```bash
eas build:view <BUILD_ID>
```

List all builds:
```bash
eas build:list
```

### Submitting to App Stores

#### Submit to App Store (iOS)
```bash
eas submit --platform ios --latest
```

Or submit a specific build:
```bash
eas submit --platform ios --id <BUILD_ID>
```

#### Submit to Google Play (Android)
```bash
eas submit --platform android --latest
```

Or submit a specific build:
```bash
eas submit --platform android --id <BUILD_ID>
```

#### Submit Both Platforms
```bash
eas submit --platform all --latest
```

### Environment Variables

EAS uses environment variables from multiple sources. For production builds:

1. **Expo Secrets** - Managed through the Expo dashboard
2. **.env Files** - Local environment files (not committed)
3. **GitHub Secrets** - When using GitHub Actions

Set secrets in Expo dashboard:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY
```

View secrets:
```bash
eas secret:list
```

## Signing Configuration

### iOS Signing

For iOS builds, you'll need:
- Apple Developer Account
- App ID
- Provisioning Profiles
- Signing Certificates

EAS can manage these automatically. To set up:

```bash
eas credentials
```

This interactive command will:
1. Verify your App ID
2. Create or use existing certificates
3. Manage provisioning profiles

For automated submission, configure in `eas.json`:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "$APPLE_ID",
      "appleTeamId": "$APPLE_TEAM_ID",
      "ascAppId": "$ASC_APP_ID"
    }
  }
}
```

### Android Signing

For Android builds, you'll need:
- Google Play Developer Account
- Service Account with appropriate permissions
- Upload key/signing key (managed by Google Play)

EAS can manage signing. To set up:

```bash
eas credentials
```

For automated submission, configure in `eas.json`:
```json
"submit": {
  "production": {
    "android": {
      "serviceAccountJsonPath": "$ANDROID_SERVICE_ACCOUNT_JSON_PATH",
      "track": "production"
    }
  }
}
```

## Troubleshooting

### Build Fails with "Certificate not found"

**Solution**: Run credentials setup to ensure valid certificates exist:
```bash
eas credentials
```

Then rebuild:
```bash
eas build --platform ios --profile production
```

### Environment Variables Not Available in Build

**Issue**: `EXPO_PUBLIC_*` variables aren't being read during build.

**Solution**:
1. Verify variables are listed in `eas.json` build profile:
```json
"env": {
  "EXPO_PUBLIC_SUPABASE_URL": true,
  "EXPO_PUBLIC_SUPABASE_ANON_KEY": true
}
```

2. Set via Expo secrets:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL
```

3. If using .env file locally, ensure it's NOT in version control

### Build Timeout

**Solution**: Use larger resource class for production builds:
```json
"production": {
  "android": {
    "resourceClass": "large"
  },
  "ios": {
    "resourceClass": "large"
  }
}
```

### Cannot Submit to App Store

**Issue**: Submission fails with authentication error.

**Solution**:
1. Verify Apple credentials are correct:
```bash
eas credentials
```

2. Ensure App ID exists in App Store Connect
3. Check that the bundle identifier matches in `app.json`

For Android:
1. Verify service account has correct permissions
2. Check that Google Play account is set up
3. Ensure app is created in Google Play Console

### "Distribution mismatch"

**Issue**: Build was created with different distribution setting than expected.

**Solution**: Use explicit profile flags:
```bash
eas build --platform ios --profile production
```

### Out of Memory During Build

**Solution**: Use large resource class:
```bash
eas build --platform android --profile production --resource-class large
```

## Development Workflow

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start Expo development server
npx expo start

# 3. Scan QR code with Expo Go or dev app
```

### Testing Before Submission
```bash
# 1. Create preview build
eas build --platform all --profile preview

# 2. Download and test on device or simulator
# 3. Run any automated tests
npm run test

# 4. Perform manual QA
```

### Production Release
```bash
# 1. Update version in app.json
# 2. Commit changes to version control
# 3. Create production build
eas build --platform all --profile production

# 4. Verify builds complete successfully
eas build:status

# 5. Submit to app stores
eas submit --platform all --latest

# 6. Monitor submission status in App Store Connect / Google Play Console
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: EAS Build

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install

      - run: npm install -g eas-cli

      - run: eas build --platform all --profile preview
        env:
          EAS_TOKEN: ${{ secrets.EAS_TOKEN }}
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}
```

## Best Practices

1. **Use Profiles** - Always explicitly specify `--profile` flag to avoid confusion
2. **Version Management** - Update version and build number before production builds
3. **Environment Separation** - Use different Expo secrets for dev, preview, and production
4. **Monitor Builds** - Check build logs for warnings or issues
5. **Test Locally First** - Always test with `expo start` before submitting builds
6. **Commit Version Changes** - Always commit version bumps to git
7. **Automated Submission** - Use CI/CD for consistent, repeatable deployments
8. **Monitor Store Submissions** - Watch App Store Connect and Google Play Console for processing status

## Resources

- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [EAS Build Overview](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo Configuration Reference](https://docs.expo.dev/guides/config/)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)

## Quick Reference

| Command | Purpose |
|---------|---------|
| `eas login` | Authenticate with Expo |
| `eas build --platform all --profile development` | Build for local testing |
| `eas build --platform all --profile preview` | Build for internal testing |
| `eas build --platform all --profile production` | Build for app store submission |
| `eas submit --platform all --latest` | Submit latest builds to app stores |
| `eas build:status` | Check current builds |
| `eas credentials` | Manage signing certificates |
| `eas secret:create` | Add environment variable secret |
| `eas secret:list` | View all secrets |

## Support

For issues or questions:
1. Check [Expo Discord Community](https://chat.expo.dev/)
2. Review [Expo GitHub Issues](https://github.com/expo/expo/issues)
3. Consult [Expo Documentation](https://docs.expo.dev/)
