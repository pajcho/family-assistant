export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return;
  const auth = useAuth();
  if (!auth.session.value && !auth.loading.value) await auth.init();
  if (!auth.loading.value && !auth.isAuthenticated.value) {
    return navigateTo('/login');
  }
});
