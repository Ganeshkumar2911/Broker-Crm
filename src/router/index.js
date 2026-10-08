import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import authToken from "@/common/authToken";
import { useMyPermissionsStore } from "@/stores/rbac/myPermissions";
import { navItems } from "@/config/navItems";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const token = authToken.getToken().accessToken;
  const isAuthenticated = Boolean(token);

  const publicRoutes = ["login", "register", "dev-login", "two-factor"];
  const isPublicRoute = publicRoutes.includes(to.name);

  // 🔹 If not logged in → block protected routes
  if (!isPublicRoute && !isAuthenticated) {
    return { path: "/login" };
  }

  const myPermissionsStore = useMyPermissionsStore();

  // Ensure permissions are fetched if logged in
  if (isAuthenticated && !myPermissionsStore.isFetched) {
    try {
      await myPermissionsStore.fetchMyPermissions();
    } catch (_) {
      // ignore
    }
  }

  const targetDefaultPath = myPermissionsStore.firstAllowedPath;

  // 🔹 Redirect "/" → default allowed path (if logged in) or login
  if (to.path === "/") {
    return isAuthenticated ? { path: targetDefaultPath } : { path: "/login" };
  }

  // 🔹 If logged in → block login/register
  if (isPublicRoute && isAuthenticated) {
    return { path: targetDefaultPath };
  }

  // 🔹 Check if user tries to access a nav route they do not have permission for
  if (isAuthenticated) {
    const matchedNavItem = navItems.find((item) => item.to === to.path);
    if (
      matchedNavItem &&
      !myPermissionsStore.hasPermission(matchedNavItem.permission)
    ) {
      if (myPermissionsStore.hasNoPermissions) {
        return true;
      }
      return { path: targetDefaultPath };
    }
  }

  return true;
});

// Handle dynamic import / chunk load failures caused by new deployments
router.onError((error, to) => {
  const errorMessage = error?.message || error?.toString() || "";
  const isChunkLoadFailed =
    errorMessage.includes("Failed to fetch dynamically imported module") ||
    errorMessage.includes("Importing a module script failed") ||
    error?.name === "ChunkLoadError";

  if (isChunkLoadFailed) {
    const targetPath = to?.fullPath || window.location.href;
    const reloadKey = "chunk_load_failed_reload";
    const lastReload = sessionStorage.getItem(reloadKey);
    const now = Date.now();

    if (!lastReload || now - Number(lastReload) > 10000) {
      sessionStorage.setItem(reloadKey, String(now));
      window.location.href = targetPath;
    }
  }
});

export default router;
