import useAuthStore from '../store/authStore';

export default function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    fetchUser,
    clearError,
    updateProfile,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    fetchUser,
    clearError,
    updateProfile,
  };
}
