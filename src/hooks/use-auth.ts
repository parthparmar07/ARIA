// Auth is disabled — we use localStorage only, no Firebase.
export const useAuth = () => {
  return {
    user: null, // Always null — no Firebase configured
  };
};

export const getAuthHeaders = async () => {
  return {};
};
