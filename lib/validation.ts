const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Matches Supabase Auth "digits, lower and uppercase letters, and symbols" character sets. */
export const PASSWORD_SPECIAL_CHARS = "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~";

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRequirementId = 'length' | 'uppercase' | 'number' | 'special';

export type PasswordRequirement = {
  id: PasswordRequirementId;
  label: string;
  met: boolean;
};

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      id: 'length',
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      met: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'number',
      label: 'One number',
      met: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'One special character',
      met: [...PASSWORD_SPECIAL_CHARS].some((char) => password.includes(char)),
    },
  ];
}

export function isStrongPassword(password: string): boolean {
  return getPasswordRequirements(password).every((requirement) => requirement.met);
}

export function getPasswordPolicyError(password: string): string | null {
  if (isStrongPassword(password)) return null;

  const unmet = getPasswordRequirements(password)
    .filter((requirement) => !requirement.met)
    .map((requirement) => requirement.label.toLowerCase());

  if (unmet.length === 0) return null;
  if (unmet.length === 1) {
    return `Password must include ${unmet[0]}.`;
  }
  if (unmet.length === 2) {
    return `Password must include ${unmet[0]} and ${unmet[1]}.`;
  }

  const last = unmet[unmet.length - 1];
  return `Password must include ${unmet.slice(0, -1).join(', ')}, and ${last}.`;
}
