import { io } from "socket.io-client";

class MatrixTicker {
  constructor({ token, reconnect = true, max_retry = 50, max_delay = 60 }) {
    const isProdDomain =
      typeof window !== "undefined" &&
      window.location.hostname === "admin.panthercapitals.com";

    const customBaseUrl =
      typeof window !== "undefined"
        ? localStorage.getItem("custom_base_url")
        : null;

    let customWsUrl = null;
    if (customBaseUrl) {
      customWsUrl = customBaseUrl.trim().replace(/\/admin\/?$/, "");
      if (!customWsUrl.endsWith("/")) {
        customWsUrl += "/";
      }
    }

    const DEV_WS_URL = "https://admin.panthercapitals.com/";
    // const DEV_WS_URL = "https://ls01t281-2504.inc1.devtunnels.ms/";
    const PROD_WS_URL = isProdDomain
      ? "https://admin.panthercapitals.com/"
      : "https://1pz4zm0b-2504.euw.devtunnels.ms/";
      // : "https://ls01t281-2504.inc1.devtunnels.ms/";

    const isDev =
      !isProdDomain &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("devtunnels.ms") ||
        window.location.port !== "");

    this.root =
      customWsUrl ||
      (isProdDomain ? PROD_WS_URL : isDev ? DEV_WS_URL : PROD_WS_URL);
    this.token = token;

    this.auto_reconnect = reconnect;
    this.reconnect_max_tries = max_retry;
    this.reconnect_max_delay = max_delay;

    this.ws = null;

    this.triggers = {
      connect: [],
      disconnect: [],
      error: [],

      price_update: [],

      superadmin_test: [],
      new_client: [],
      kyc_uploaded: [],
      new_broker: [],
      payment_received: [],
      settlement: [],
      new_user_registered: [],
      new_deposit: [],
      new_withdrawal: [],
      new_notification: [],
      live_user_count_update: [],

      // WhatsApp Chat events
      new_message: [],
      chat_assigned: [],
      chat_closed: [],
    };

    this.current_reconnection_count = 0;
    this.last_reconnect_interval = 0;

    this.connect();
  }

  /* ---------------- Connect ---------------- */
  connect() {
    if (this.ws) return;

    const currentToken =
      this.token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : "") ||
      "";

    const cleanRoot = this.root.replace(/\/+$/, "");
    console.log(
      "[MatrixTicker] Connecting to WebSocket:",
      cleanRoot,
      "Token present:",
      !!currentToken,
    );

    this.ws = io(cleanRoot, {
      path: "/socket.io",
      auth: { token: currentToken },
      query: { token: currentToken },
      transports: ["websocket", "polling"],
      reconnection: false,
    });

    this.ws.on("connect", () => {
      console.log("[MatrixTicker] Socket connected successfully! ID:", this.ws.id);

      this.current_reconnection_count = 0;

      if (this.activeChatCustomerId) {
        this.ws.emit("join_chat", { dtCustomerId: this.activeChatCustomerId });
        this.ws.emit("join_customer_chat", { dtCustomerId: this.activeChatCustomerId });
        console.log(
          "[MatrixTicker] Auto-joined active chat room on connect:",
          this.activeChatCustomerId,
        );
      }

      this.trigger("connect");
    });

    this.ws.on("disconnect", (reason) => {
      console.warn("[MatrixTicker] Socket disconnected:", reason);

      this.trigger("disconnect", [reason]);

      if (this.auto_reconnect) {
        this.reconnect();
      }
    });

    this.ws.on("connect_error", (err) => {
      console.error("[MatrixTicker] Socket connect_error:", err.message || err);

      this.trigger("error", [err]);
    });

    /* ---------------- PRICE UPDATE ---------------- */
    this.ws.on("price_update", (data) => {
      this.trigger("price_update", [data]);
    });

    /* ---------------- OTHER EVENTS ---------------- */
    this.ws.on("superadmin_test", (data) => {
      this.trigger("superadmin_test", [data]);
    });

    this.ws.on("new_user_registered", (data) => {
      this.trigger("new_user_registered", [data]);
    });

    this.ws.on("kyc_uploaded", (data) => {
      this.trigger("kyc_uploaded", [data]);
    });

    this.ws.on("new_broker", (data) => {
      this.trigger("new_broker", [data]);
    });

    this.ws.on("payment_received", (data) => {
      this.trigger("payment_received", [data]);
    });

    this.ws.on("settlement", (data) => {
      this.trigger("settlement", [data]);
    });

    this.ws.on("new_deposit", (data) => {
      this.trigger("new_deposit", [data]);
    });

    this.ws.on("new_withdrawal", (data) => {
      this.trigger("new_withdrawal", [data]);
    });

    this.ws.on("new_notification", (data) => {
      this.trigger("new_notification", [data]);
    });

    this.ws.on("live_user_count_update", (data) => {
      this.trigger("live_user_count_update", [data]);
    });

    /* ---------------- WHATSAPP CHAT EVENTS ---------------- */
    this.ws.on("new_message", (data) => {
      this.trigger("new_message", [data]);
    });

    this.ws.on("chat_assigned", (data) => {
      this.trigger("chat_assigned", [data]);
    });

    this.ws.on("chat_closed", (data) => {
      this.trigger("chat_closed", [data]);
    });
  }

  /* ---------------- Disconnect ---------------- */
  disconnect() {
    if (!this.ws) return;

    this.auto_reconnect = false;

    this.ws.disconnect();

    this.ws = null;
  }

  /* ---------------- Event Binding ---------------- */
  on(event, callback) {
    if (!this.triggers[event]) {
      this.triggers[event] = [];
    }

    this.triggers[event].push(callback);
  }

  off(event, callback) {
    if (!this.triggers[event]) return;
    if (!callback) {
      this.triggers[event] = [];
      return;
    }
    this.triggers[event] = this.triggers[event].filter((cb) => cb !== callback);
  }

  trigger(event, args = []) {
    this.triggers[event]?.forEach((cb) => cb(...args));
  }

  /* ---------------- WhatsApp Chat Room ---------------- */
  joinChat(dtCustomerId) {
    if (!dtCustomerId) return;
    if (this.activeChatCustomerId === dtCustomerId && this.isRoomJoined) {
      return; // Already joined this room
    }
    this.activeChatCustomerId = dtCustomerId;
    if (this.ws) {
      // Emit both in case backend listens to join_chat or join_customer_chat
      this.ws.emit("join_chat", { dtCustomerId });
      this.ws.emit("join_customer_chat", { dtCustomerId });
      this.isRoomJoined = true;
      console.log("[MatrixTicker] Joined chat room:", dtCustomerId);
    }
  }

  leaveChat(dtCustomerId) {
    if (this.activeChatCustomerId === dtCustomerId || !dtCustomerId) {
      this.activeChatCustomerId = null;
      this.isRoomJoined = false;
    }
    if (this.ws && dtCustomerId) {
      this.ws.emit("leave_chat", { dtCustomerId });
      this.ws.emit("leave_customer_chat", { dtCustomerId });
      console.log("[MatrixTicker] Left chat room:", dtCustomerId);
    }
  }

  /* ---------------- Subscribe ---------------- */
  subscribe(symbols, id) {
    if (this.ws && symbols.length > 0) {
      this.ws.emit("subscribe_symbol", {
        symbol: symbols,
        user_id: id,
      });
    }
  }

  unsubscribe(symbols, id) {
    if (this.ws) {
      this.ws.emit("unsubscribe", {
        symbol: symbols,
        user_id: id,
      });
    }
  }

  /* ---------------- Reconnect ---------------- */
  reconnect() {
    if (this.current_reconnection_count > this.reconnect_max_tries) {
      return;
    }

    this.last_reconnect_interval = Math.min(
      2 ** this.current_reconnection_count,
      this.reconnect_max_delay,
    );

    this.current_reconnection_count++;

    setTimeout(() => {
      this.connect();
    }, this.last_reconnect_interval * 1000);
  }
}

export default MatrixTicker;
