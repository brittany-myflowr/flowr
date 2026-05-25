import { Alert } from 'react-native';

export function signInWithApplePlaceholder() {
  Alert.alert('Coming soon', 'Apple Sign In will be connected in a future update.');
}

export function signInWithGooglePlaceholder() {
  Alert.alert(
    'Coming soon',
    'Google Sign In will be connected when OAuth credentials are configured.',
  );
}
