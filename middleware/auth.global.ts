export default defineNuxtRouteMiddleware(async (to) => {
  // Allow login page without auth check
  if (to.path === '/login' || to.path.endsWith('/login')) return;

  // Check if Supabase is available (might not be on error pages)
  try {
    const auth = useAuth();

    // Always ensure auth is initialized
    await auth.init();

    // Redirect to login if not authenticated
    if (!auth.isAuthenticated.value) {
      return navigateTo('/login');
    }
  } catch {
    // If Supabase isn't available, redirect to login
    return navigateTo('/login');
  }
});
