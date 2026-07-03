export function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }

  if (normalized.includes('user already registered')) {
    return 'An account with this email already exists. Log in instead.';
  }

  if (normalized.includes('password should be at least')) {
    return 'Password must be at least 8 characters.';
  }

  if (normalized.includes('unable to validate email')) {
    return 'Enter a valid email address.';
  }

  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }

  return message;
}
