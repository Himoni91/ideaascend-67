
/**
 * Safely access profile properties with null checking
 * @param profile The profile object that might be null
 * @param key The property key to access
 * @param defaultValue Optional default value if property is not available
 */
export function getProfileProperty<T>(
  profile: { [key: string]: any } | null | undefined,
  key: string,
  defaultValue: T
): T {
  if (!profile) return defaultValue;
  return (profile[key] as T) || defaultValue;
}

/**
 * Safely creates a user profile object from potentially null data
 */
export function createSafeProfile(profile: any | null | undefined) {
  if (!profile) {
    return {
      username: '',
      full_name: '',
      avatar_url: '',
      position: '',
      company: '',
    };
  }
  
  return {
    username: profile.username || '',
    full_name: profile.full_name || '',
    avatar_url: profile.avatar_url || '',
    position: profile.position || '',
    company: profile.company || '',
  };
}
