const authToken = {
  setToken: (accessToken = null, role = null) => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      let detectedRole = role;
      if (!detectedRole) {
        try {
          const parts = accessToken.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload?.role) {
              detectedRole = payload.role;
            }
          }
        } catch (_) {}
      }
      if (detectedRole) {
        localStorage.setItem("role", detectedRole);
      }
    }
  },
  getToken: () => {
    return {
      accessToken: localStorage.getItem("accessToken"),
      role: localStorage.getItem("role"),
    };
  },
  getRole: () => {
    let r = localStorage.getItem("role");
    if (!r) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload?.role) {
              r = payload.role;
              localStorage.setItem("role", r);
            }
          }
        } catch (_) {}
      }
    }
    return r;
  },
  isStaff: () => {
    return authToken.getRole() === "staff";
  },
  isSuperAdminOrAdmin: () => {
    const r = authToken.getRole();
    return r === "superadmin" || r === "admin";
  },
  removeToken: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    sessionStorage.removeItem("2fa_temp_token");
    sessionStorage.removeItem("2fa_email");
    sessionStorage.removeItem("2fa_role");
    sessionStorage.removeItem("2fa_is_setup");
  }
};
export default authToken;
