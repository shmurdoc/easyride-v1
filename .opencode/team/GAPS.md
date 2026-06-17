# Gaps & Issues

## BUILD-RIDER-APK-002

### Bug: Cannot find native module 'ExpoLocation'
- **When**: Rider app launches on emulator
- **Symptoms**: App starts, runs JS bundle, but `ExpoLocation` native module cannot be found
- **Error**: `Error: Cannot find native module 'ExpoLocation', js engine: hermes`
- **Consequence**: `"main" has not been registered` - app displays red error screen
- **Possible cause**: Bundle was generated referencing ExpoLocation, but native module registration fails at runtime. May be a prebuild/linking issue with expo-location (17.0.1)
- **Severity**: HIGH - blocks app functionality
- **Status**: UNRESOLVED
