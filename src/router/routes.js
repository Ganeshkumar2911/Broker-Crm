import DefaultLayout from "@/layouts/default.vue";
import AuthLayout from "@/layouts/auth.vue";

const routes = [
  {
    path: "",
    component: AuthLayout,
    children: [
      {
        path: "/login",
        name: "login",
        component: () => import("@/pages/auth/login.vue"),
      },
      {
        path: "/dev-login",
        name: "dev-login",
        component: () => import("@/pages/auth/dev-login.vue"),
      },
      {
        path: "/2fa",
        name: "two-factor",
        component: () => import("@/pages/auth/two-factor.vue"),
      },
    ],
  },
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/pages/dashboard/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Dashboard",
          description:
            "Overview of your trading performance and account status.",
        },
      },
      {
        path: "/clients",
        name: "clients",
        component: () => import("@/pages/clients/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Clients",
          description: "View and manage platform clients.",
        },
      },
      {
        path: "/client/details/:id",
        component: () => import("@/pages/client-details/index.vue"),
        meta: {
          showBackButton: true,
          requiresAuth: true,
          title: "Clients Details",
          description: "View and manage client info.",
        },
        children: [
          {
            path: "",
            name: "client-details",
            component: () => import("@/pages/client-details/overview.vue"),
            meta: {
              showBackButton: true,
              requiresAuth: true,
              title: "Clients Details",
              description: "View and manage client info.",
            },
          },
          {
            path: "profile",
            name: "client-details-profile",
            component: () => import("@/pages/client-details/profile.vue"),
            meta: {
              showBackButton: true,
              requiresAuth: true,
              title: "Client Profile & KYC",
              description: "View client profile and KYC.",
            },
          },
          {
            path: "financials",
            name: "client-details-financials",
            component: () => import("@/pages/client-details/financial.vue"),
            meta: {
              showBackButton: true,
              requiresAuth: true,
              title: "Client Financials",
              description: "View client financials.",
            },
          },
          {
            path: "bank-details",
            name: "client-details-bank-details",
            component: () => import("@/pages/client-details/bankDetails.vue"),
            meta: {
              showBackButton: true,
              requiresAuth: true,
              title: "Client Bank Details",
              description: "View client saved bank accounts and payout destinations.",
            },
          },
          {
            path: "trading",
            name: "client-details-trading",
            component: () => import("@/pages/client-details/trading.vue"),
            meta: {
              showBackButton: true,
              requiresAuth: true,
              title: "Client Trading",
              description: "View client trading details.",
            },
          },
          {
            path: "crm",
            name: "client-details-crm",
            component: () => import("@/pages/client-details/crm&support.vue"),
            meta: {
              showBackButton: true,
              requiresAuth: true,
              title: "Client CRM & Support",
              description: "View client CRM and support tickets.",
            },
          },
          {
            path: "marketing",
            name: "client-details-marketing",
            component: () => import("@/pages/client-details/marketing.vue"),
            meta: {
              showBackButton: true,
              requiresAuth: true,
              title: "Client Marketing",
              description: "View client marketing details.",
            },
          },
          {
            path: "notifications",
            name: "client-details-notifications",
            component: () => import("@/pages/client-details/notifications.vue"),
            meta: {
              showBackButton: true,
              requiresAuth: true,
              title: "Client Notifications",
              description: "View client notifications and history.",
            },
          },
          {
            path: "audit-logs",
            name: "client-details-audit-logs",
            component: () => import("@/pages/client-details/auditLogs.vue"),
            meta: {
              showBackButton: true,
              requiresAuth: true,
              title: "Client Audit Logs",
              description: "View client enhanced audit log events.",
            },
          },
          {
            path: "audit-logs/:logId",
            name: "client-details-audit-log-detail",
            component: () => import("@/pages/enhanced-audit-logs/AuditLogForensicsView.vue"),
            meta: {
              showBackButton: true,
              requiresAuth: true,
              title: "Client Audit Log Details",
              description: "View client audit log event details.",
            },
          },
        ],
      },
      {
        path: "/lead-management",
        name: "lead-management",
        component: () => import("@/pages/lead-management/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Lead Management",
          description:
            "Track and manage leads throughout their onboarding journey.",
        },
      },
      {
        path: "/trading-accounts",
        name: "trading-accounts",
        component: () => import("@/pages/trading-accounts/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Trading Accounts",
          description:
            "Manage your trading accounts and view performance metrics.",
        },
      },
      {
        path: "/account/trade/:id",
        name: "client-accounts",
        component: () => import("@/pages/trading-accounts/trades.vue"),
        meta: {
          requiresAuth: true,
          title: "Account Trades",
          description: "Manage your client accounts and view Trade metrics.",
          showBackButton: true,
        },
      },
      {
        path: "/account/transactions/:id",
        name: "client-transactions",
        component: () => import("@/pages/trading-accounts/transactions.vue"),
        meta: {
          requiresAuth: true,
          title: "Account Transactions",
          description: "View and manage transactions for a specific account.",
          showBackButton: true,
        },
      },
      {
        path: "/client-wallet",
        name: "client-wallet",
        component: () => import("@/pages/client-wallet/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Client Wallet",
          description: "View and manage your client wallet.",
        },
      },
      {
        path: "/my-wallet",
        name: "my-wallet",
        component: () => import("@/pages/my-wallet/index.vue"),
        meta: {
          requiresAuth: true,
          title: "My Wallet",
          description: "View and manage your wallet details.",
        },
      },
      {
        path: "/payment-requests",
        name: "payment-requests",
        component: () => import("@/pages/payment-requests/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Payment Requests",
          description: "Manage and view payment requests.",
        },
      },
      {
        path: "/bank-requests",
        name: "bank-requests",
        component: () => import("@/pages/bankrequest/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Bank Requests",
          description: "Review and approve client, IB, and FM saved bank account requests.",
        },
      },
      {
        path: "/vendor-transfers",
        name: "vendor-transfers",
        component: () => import("@/pages/vendor-transfers/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Vendor Transfers",
          description: "Manage and view vendor transfer queue.",
        },
      },
      {
        path: "/payment-requests/logs",
        name: "payment-gateway-logs",
        component: () => import("@/pages/payment-requests/logs.vue"),
        meta: {
          requiresAuth: true,
          title: "Payment Gateway Logs",
          description:
            "View and inspect payment gateway logs and transactions.",
          showBackButton: true,
        },
      },
      {
        path: "/payment-methods",
        name: "payment-methods",
        component: () => import("@/pages/paymentMethods/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Payment Methods",
          description:
            "Manage payment methods, wallet labels, and activation status.",
        },
      },
      {
        path: "/fm-wallet",
        name: "fm-wallet",
        component: () => import("@/pages/fm-wallet/index.vue"),
        meta: {
          requiresAuth: true,
          title: "FM Wallet",
          description: "View and manage fund manager wallet ledger.",
        },
      },
      {
        path: "/ib-wallet",
        name: "ib-wallet",
        component: () => import("@/pages/ib-wallet/index.vue"),
        meta: {
          requiresAuth: true,
          title: "IB Wallet",
          description: "View and manage IB wallet ledger.",
        },
      },
      {
        path: "/fm-leaderboard",
        name: "fm-leaderboard",
        component: () => import("@/pages/fm-leaderboard/index.vue"),
        meta: {
          requiresAuth: true,
          title: "FM Leaderboard",
          description:
            "See how you rank against other traders in the FM Leaderboard.",
        },
      },
      {
        path: "/fm/settlement-preview/:id",
        name: "fm-settlement-preview",
        component: () => import("@/pages/fm-leaderboard/fmSettlement.vue"),
        meta: {
          requiresAuth: true,
          title: "FM Settlement Preview",
          description: "Preview settlement details for a Fund Manager.",
          showBackButton: true,
        },
      },
      {
        path: "/fm/settlement-preview/:id/user/:userId",
        name: "fm-settlement-user-preview",
        component: () => import("@/pages/fm-leaderboard/fmSettlementUser.vue"),
        meta: {
          requiresAuth: true,
          title: "Client Settlement Details",
          description: "Detailed client follower trades and commission splits.",
          showBackButton: true,
        },
      },
      {
        path: "/fm/offers/:id",
        name: "fm-offers",
        component: () => import("@/pages/fm-leaderboard/fmOffers.vue"),
        meta: {
          requiresAuth: true,
          title: "FM Offers",
          description: "View and manage offers for a Fund Manager.",
          showBackButton: true,
        },
      },
      {
        path: "/fm-offers/:id",
        name: "fm-offer-details",
        component: () => import("@/pages/fm-leaderboard/offerDetails.vue"),
        meta: {
          requiresAuth: true,
          title: "Offer Join Links & Agents",
          description:
            "Manage campaign links, additional agents, and offer configuration.",
          showBackButton: true,
        },
      },
      {
        path: "/fm/followers/:id",
        name: "fm-followers",
        component: () => import("@/pages/fm-leaderboard/fmFollowers.vue"),
        meta: {
          requiresAuth: true,
          title: "FM Followers & Clients",
          description: "View followers and clients assigned to a Fund Manager.",
          showBackButton: true,
        },
      },
      {
        path: "/follower-info/:id",
        name: "follower-info",
        component: () => import("@/pages/fm-leaderboard/followerDetails.vue"),
        meta: {
          requiresAuth: true,
          title: "Follower Details",
          description:
            "View subscription, account, and fee details for this follower.",
          showBackButton: true,
        },
      },
      {
        path: "/fm/trade-book/:id",
        name: "fm-trade-book",
        component: () => import("@/pages/fmTradeBook/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Fund Manager Trade Book",
          description:
            "Live positions, orders, and deal execution history for Fund Manager master account.",
          showBackButton: true,
        },
      },
      {
        path: "/follower/trade-book/:id",
        name: "follower-trade-book",
        component: () => import("@/pages/fmTradeBook/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Follower Trade Book",
          description:
            "Live positions, orders, and deal execution history for follower trading account.",
          showBackButton: true,
        },
      },
      {
        path: "/fm-request",
        name: "fm-request",
        component: () => import("@/pages/fm-request/index.vue"),
        meta: {
          requiresAuth: true,
          title: "FM Requests",
          description: "Manage and view Fund Manager requests.",
        },
      },
      {
        path: "/settlements",
        name: "settlements",
        component: () => import("@/pages/settlements/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Settlements",
          description: "Manage and view settlement requests.",
        },
      },
      {
        path: "/settlement/details/:id",
        name: "settlement-details",
        component: () => import("@/pages/settlements/detail.vue"),
        meta: {
          requiresAuth: true,
          title: "Settlement Details",
          description:
            "View client summaries and distributions for this settlement.",
          showBackButton: true,
        },
      },
      {
        path: "/settlement/details/:id/user/:userId",
        name: "settlement-user-depth",
        component: () => import("@/pages/settlements/user.vue"),
        meta: {
          requiresAuth: true,
          title: "Client Settlement Breakdown",
          description:
            "Detailed follower trades and period breakdown for this client.",
          showBackButton: true,
        },
      },
      {
        path: "/settlement/trade/:id",
        name: "settlement-trades",
        component: () => import("@/pages/settlements/trades.vue"),
        meta: {
          requiresAuth: true,
          title: "Settlement Trades",
          description: "View trades for a specific settlement.",
          showBackButton: true,
        },
      },
      {
        path: "/ib-tree",
        name: "ib-tree",
        component: () => import("@/pages/ib-tree/index.vue"),
        meta: {
          requiresAuth: true,
          title: "IB Hierarchy",
          description: "View and manage IB hierarchy and structure.",
        },
      },
      {
        path: "/ib-clients/:id",
        name: "ib-clients",
        component: () => import("@/pages/ib-tree/clients.vue"),
        meta: {
          requiresAuth: true,
          title: "IB Clients",
          description: "View and manage IB clients.",
          showBackButton: true,
        },
      },
      {
        path: "/ib-referral-links/:id",
        name: "ib-referral-links",
        component: () => import("@/pages/ib-tree/referral-links.vue"),
        meta: {
          requiresAuth: true,
          title: "Referral Links",
          description: "Manage and track referral campaigns for this partner.",
          showBackButton: true,
        },
      },
      {
        path: "/tickets",
        name: "tickets",
        component: () => import("@/pages/tickets/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Support Tickets",
          description: "Raise a ticket to connect with the developer team.",
        },
      },
      {
        path: "/ticket/:id",
        name: "ticket-details",
        component: () => import("@/pages/tickets/ticketDetails.vue"),
        meta: {
          requiresAuth: true,
          title: "Ticket Details",
          description: "View details of the support ticket.",
          showBackButton: true,
        },
      },
      {
        path: "/notifications",
        name: "notifications",
        component: () => import("@/pages/notifications/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Notifications",
          description: "View and manage system notifications.",
        },
      },
      {
        path: "/notifications/read-status/:id",
        name: "notification-read-status",
        component: () => import("@/pages/notifications/readStatus.vue"),
        meta: {
          requiresAuth: true,
          title: "Notification Read Status Logs",
          description: "Track user read statuses and delivery receipts.",
          showBackButton: true,
        },
      },
      {
        path: "/platform-tickets",
        name: "platform-tickets",
        component: () => import("@/pages/platformTickets/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Support Tickets",
          description: "Raise a ticket to connect with the developer team.",
        },
      },
      {
        path: "/media",
        name: "media",
        component: () => import("@/pages/media/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Media Library",
          description:
            "Manage image folders and media assets across the platform.",
        },
      },
      {
        path: "/media/:groupId",
        name: "media-images",
        component: () => import("@/pages/media/[groupId].vue"),
        meta: {
          requiresAuth: true,
          title: "Media Images",
          description: "Manage images within this media group.",
          showBackButton: true,
        },
      },
      {
        path: "/blogs",
        name: "blogs",
        component: () => import("@/pages/blog/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Blog Management",
          description:
            "Create, edit, and publish market insights, educational guides, and platform updates.",
        },
      },
      {
        path: "/platform-tickets/:id",
        name: "platform-tickets-details",
        component: () => import("@/pages/platformTickets/ticketDetails.vue"),
        meta: {
          requiresAuth: true,
          title: "Ticket Details",
          description: "View details of the support ticket.",
          showBackButton: true,
        },
      },
      {
        path: "/e-mails",
        name: "mains",
        component: () => import("@/pages/e-mails/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Email Management",
          description: "Manage platfrom e-mails and templates",
        },
      },
      {
        path: "/e-mails/logs-details/:tagId",
        name: "email-logs-details",
        component: () => import("@/pages/e-mails/EmailLogDetails.vue"),
        meta: {
          showBackButton: true,
          requiresAuth: true,
          title: "Email Management",
          description: "Manage platfrom e-mails and templates",
        },
      },
      {
        path: "/telegram",
        name: "telegram",
        component: () => import("@/pages/telegram/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Telegram",
          description: "Manage Telegram",
        },
      },
      {
        path: "/whatsapp/templates",
        name: "whatsapp-templates",
        component: () => import("@/pages/whatsapp/index.vue"),
        meta: {
          requiresAuth: true,
          title: "WhatsApp Templates",
          description: "Manage WhatsApp message templates and campaigns",
        },
      },
      {
        path: "/whatsapp/templates/create",
        name: "whatsapp-template-create",
        component: () => import("@/pages/whatsapp/CreateTemplate.vue"),
        meta: {
          showBackButton: true,
          requiresAuth: true,
          title: "Create WhatsApp Template",
          description: "Create and configure new WhatsApp message template",
        },
      },
      {
        path: "/watchlist",
        name: "watchlist",
        component: () => import("@/pages/watchlist/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Watchlist Management",
          description:
            "Manage watchlist limits, symbol catalog, and excel imports.",
        },
      },
      {
        path: "/group-config",
        name: "group-config",
        component: () => import("@/pages/groupConfig/categories.vue"),
        meta: {
          requiresAuth: true,
          title: "Group Categories",
          description: "Manage MT5 group categories.",
        },
      },
      {
        path: "/categories/:account_category/:account_type",
        name: "group-config-groups",
        component: () => import("@/pages/groupConfig/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Category Groups",
          description: "Manage MT5 groups inside category.",
          showBackButton: true,
        },
      },
      {
        path: "/company-integrations",
        name: "company-integrations",
        component: () => import("@/pages/companyIntegrations/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Company Integrations",
          description: "Manage external provider integrations.",
        },
      },
      {
        path: "/audit-logs",
        name: "audit-logs",
        component: () => import("@/pages/audit-logs/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Audit Logs",
          description: "Track and view system modifications and events.",
        },
      },
      {
        path: "/enhanced-audit-logs",
        name: "enhanced-audit-logs",
        component: () => import("@/pages/enhanced-audit-logs/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Enhanced Audit Logs",
          description: "Advanced tracking and detailed view of system modifications and events.",
        },
      },
      {
        path: "/enhanced-audit-logs/:id",
        name: "enhanced-audit-log-details",
        component: () => import("@/pages/enhanced-audit-logs/AuditLogForensicsView.vue"),
        meta: {
          requiresAuth: true,
          showBackButton: true,
          title: "Event Forensics",
          description: "Detailed view of audit event with complete context and changes.",
        },
      },
      {
        path: "/rbac",
        name: "rbac",
        component: () => import("@/pages/rbac/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Access Control",
          description: "Manage staff accounts, roles, and permissions.",
        },
      },
      {
        path: "/rbac-modules",
        name: "rbac-modules",
        component: () => import("@/pages/rbac-modules/index.vue"),
        meta: {
          requiresAuth: true,
          title: "RBAC Modules",
          description:
            "Manage dynamic resources, actions, and permissions mappings.",
        },
      },
      {
        path: "/tags",
        name: "tags",
        component: () => import("@/pages/tags/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Tag Management",
          description: "Manage tags and entity assignments.",
        },
      },
      {
        path: "/loyalty-program",
        name: "loyalty-program",
        component: () => import("@/pages/loyalty/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Loyalty Program",
          description:
            "Manage PantherTrade loyalty program rules, tiers, rewards, enrollments, and MT5 history backfills.",
        },
      },
      {
        path: "/commission-engine",
        name: "commission-engine",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Commission Engine",
          description:
            "Manage IB commission rate matrix, MT5 symbol groups, symbols catalog, and sync operations.",
        },
      },
      {
        path: "/commission-engine/approvals",
        name: "commission-engine-approvals",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Draft Commission Workflow",
          description: "Period-based review and batch approval of pending IB commissions.",
        },
      },
      {
        path: "/commission-engine/commissions",
        name: "commission-engine-commissions",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "IB Commissions",
          description: "Review pending and approved IB commissions, calculate payouts, and authorize wallet credits.",
        },
      },
      {
        path: "/commission-engine/trades",
        name: "commission-engine-trades",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "IB Trades",
          description: "Browse open and closed MT5 trade positions, inspect mapping criteria, and rebuild trades.",
        },
      },
      {
        path: "/commission-engine/rates",
        name: "commission-engine-rates",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Commission Rate Matrix",
          description: "Configure IB commission rates per MT5 group and symbol group.",
        },
      },
      {
        path: "/commission-engine/symbol-groups",
        name: "commission-engine-symbol-groups",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Symbol Groups",
          description: "Manage MT5 symbol groups and member assignments.",
        },
      },
      {
        path: "/commission-engine/symbols",
        name: "commission-engine-symbols",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Symbols Catalog",
          description: "Browse symbol catalog and assign unmapped symbols.",
        },
      },
      {
        path: "/commission-engine/sync",
        name: "commission-engine-sync",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Commission Sync Status",
          description: "Monitor ETL sync cursors and trigger manual synchronization.",
        },
      },
      {
        path: "/commission-engine/settings",
        name: "commission-engine-settings",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "IB Commission Settings",
          description: "Configure per-IB payout mode, auto settlement schedule, and manage settlement batches.",
        },
      },
      {
        path: "/commission-engine/etl-settings",
        name: "commission-engine-etl-settings",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "IB Commission ETL Settings",
          description:
            "Configure recalculation revert dates (Next, Night, Weekend) and trigger on-demand recalculation runs.",
        },
      },
      {
        path: "/commission-engine/demo-wallets",
        name: "commission-engine-demo-wallets",
        component: () => import("@/pages/commission-engine/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Demo Wallets Ledger",
          description: "Admin ledger for demo wallet balances and credit transactions.",
        },
      },
      {
        path: "/settings",
        name: "settings",
        component: () => import("@/pages/settings/index.vue"),
        meta: {
          requiresAuth: true,
          title: "System Settings",
          description:
            "Configure system-wide settings, transaction restrictions, and miscellaneous platform settings.",
        },
      },
      {
        path: "/cashback",
        name: "cashback",
        component: () => import("@/pages/cashback/index.vue"),
        meta: {
          requiresAuth: true,
          title: "Cashback Program",
          description: "Manage Cashback Program rules, plans, enrollments, and ledger transactions.",
        },
      },
    ],
  },
];

export default routes;
