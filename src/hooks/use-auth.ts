// This is a placeholder hook for demonstration purposes.
// In a real application, you would use Firebase Authentication
// to get the currently signed-in user.

import { useState, useEffect } from 'react';

// A mock user object
const mockUser = {
  uid: 'donor-test-uid',
  email: 'donor@sunrisebakery.com',
  displayName: 'Sunrise Bakery',
};

export const useAuth = () => {
  const [user, setUser] = useState<typeof mockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data
    const timer = setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { user, loading };
};
