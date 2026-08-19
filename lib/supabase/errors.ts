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

  if (
    normalized.includes('password should contain at least one character of each') ||
    normalized.includes('weak_password') ||
    normalized.includes('password is known to be weak')
  ) {
    return 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character.';
  }

  if (normalized.includes('unable to validate email')) {
    return 'Enter a valid email address.';
  }

  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }

  return message;
}
