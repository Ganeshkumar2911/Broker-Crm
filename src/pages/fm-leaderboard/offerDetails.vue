<template>
  <div class="space-y-6 py-2">
    <!-- HERO / ACTIVE OFFER BANNER -->
    <div class="bg-card-background border border-primary-border rounded-lg p-5 sm:p-6 shadow-2xs relative overflow-hidden">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <!-- Left Title & Meta -->
        <div class="flex items-start sm:items-center gap-4 min-w-0">
          <div class="w-13 h-13 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold text-lg shrink-0 shadow-xs">
            <Tag class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-lg sm:text-xl font-bold text-primary-text tracking-tight truncate">
                {{ activeOffer?.name || 'Offer Details' }}
              </h1>

              <span
                v-if="activeOffer?.visibility"
                class="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border text-secondary-text bg-background border-primary-border"
              >
                {{ activeOffer.visibility }}
              </span>

              <span
                v-if="activeOffer"
                class="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 shadow-2xs"
                :class="activeOffer.is_active
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                  : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="activeOffer.is_active ? 'bg-primary-green animate-pulse' : 'bg-zinc-400'" />
                {{ activeOffer.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <!-- Meta Row -->
            <div class="flex items-center gap-3 text-xs text-secondary-text mt-2 flex-wrap font-medium">
              <button
                v-if="activeOffer?.offer_code"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-primary-border font-mono text-[11px] font-bold text-primary hover:border-primary/40 transition-colors cursor-pointer"
                @click="copyText(activeOffer.offer_code, 'Offer Code')"
                title="Click to copy offer code"
              >
                <span>{{ activeOffer.offer_code }}</span>
                <Check v-if="copiedCode" class="w-3 h-3 text-emerald-500" />
                <Copy v-else class="w-3 h-3 opacity-60" />
              </button>

              <span v-if="activeOffer?.created_at" class="flex items-center gap-1">
                <Calendar class="w-3.5 h-3.5 opacity-60" />
                Created {{ formatDate(activeOffer.created_at) }}
              </span>

              <span v-if="activeOffer?.summary" class="hidden sm:inline text-secondary-text/80 max-w-md truncate">
                · {{ activeOffer.summary }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Quick Actions -->
        <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            v-if="hasPermission('fund_manager.update')"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            @click="addFollowerDialogOpen = true"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span>Add Follower</span>
          </button>

          <button
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors cursor-pointer"
            @click="openCreateLinkDialog"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Generate Link</span>
          </button>

          <button
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            @click="openEditInfoDialog('common')"
          >
            <Pencil class="w-3.5 h-3.5" />
            <span>Edit Offer</span>
          </button>
          <button
            class="p-2 rounded-xl border border-primary-border bg-card-background text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer shadow-2xs"
            :disabled="store.loading || store.linksLoading || store.agentsLoading"
            @click="refreshData"
          >
            <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.loading || store.linksLoading || store.agentsLoading }" />
          </button>
        </div>
      </div>

      <!-- KPI METRIC STRIP -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-primary-border/60">
        <!-- 1. Total Fees -->
        <div class="bg-background/60 border border-primary-border/60 rounded-xl p-3.5 transition-all hover:bg-background">
          <div class="flex items-center justify-between text-secondary-text mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider">Fees Collected</span>
            <DollarSign class="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p class="text-base font-extrabold text-primary-text font-mono">
            {{ formatCurrency(activeOffer?.total_fees_collected) }}
          </p>
        </div>

        <!-- 2. Subscribers -->
        <div class="bg-background/60 border border-primary-border/60 rounded-xl p-3.5 transition-all hover:bg-background">
          <div class="flex items-center justify-between text-secondary-text mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider">Subscribers</span>
            <Users class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-base font-extrabold text-primary-text">
            {{ activeOffer?.subscribers_count ?? 0 }}
          </p>
        </div>

        <!-- 3. Min Capital -->
        <div class="bg-background/60 border border-primary-border/60 rounded-xl p-3.5 transition-all hover:bg-background">
          <div class="flex items-center justify-between text-secondary-text mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider">Min Capital</span>
            <Wallet class="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p class="text-base font-extrabold text-primary-text font-mono">
            {{ formatCurrency(activeOffer?.minimum_balance) }}
          </p>
        </div>

        <!-- 4. Performance Fee -->
        <div class="bg-background/60 border border-primary-border/60 rounded-xl p-3.5 transition-all hover:bg-background">
          <div class="flex items-center justify-between text-secondary-text mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider">Perf / Mgmt Fee</span>
            <TrendingUp class="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p class="text-base font-extrabold text-primary-text font-mono">
            {{ activeOffer?.performance_fee ?? 0 }}% <span class="text-xs text-secondary-text font-normal">· {{ activeOffer?.management_fee ?? 0 }}%</span>
          </p>
        </div>
      </div>
    </div>

    <!-- INTERACTIVE TAB NAVIGATION -->
    <div class="flex items-center gap-1.5 p-1 bg-card-background border border-primary-border rounded-lg w-fit shadow-2xs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
        :class="activeTab === tab.id
          ? 'bg-primary text-white shadow-xs'
          : 'text-secondary-text hover:text-primary-text hover:bg-background/60'"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="w-3.5 h-3.5" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.count !== undefined"
          class="px-1.5 py-0.2 rounded-md text-[10px] font-mono"
          :class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-background text-secondary-text border border-primary-border'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- TAB 1: OVERVIEW & FEE RULES -->
    <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
      <!-- Left Column: Strategy & Fee Rules -->
      <div class="lg:col-span-2 space-y-4 flex flex-col justify-between">
        <!-- Common Info Card -->
        <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs">
          <div class="flex items-center justify-between px-4 py-3 border-b border-primary-border bg-background/40">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                <Tag class="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 class="text-xs font-bold text-primary-text">Offer Description & Strategy</h3>
                <p class="text-[11px] text-secondary-text">Primary information displayed to followers</p>
              </div>
            </div>
            <button
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary-border bg-background hover:bg-card-background text-primary-text hover:text-primary text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              @click="openEditInfoDialog('common')"
            >
              <Pencil class="w-3 h-3 text-secondary-text" />
              <span>Edit</span>
            </button>
          </div>

          <div class="p-4 space-y-3">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold">Offer Title</p>
                <p class="text-xs font-bold text-primary-text mt-0.5">{{ activeOffer?.name || '—' }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary-border bg-background text-secondary-text font-bold">
                  {{ activeOffer?.visibility || 'public' }}
                </span>
                <span v-if="activeOffer?.offer_code" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary">
                  {{ activeOffer.offer_code }}
                </span>
              </div>
            </div>

            <div>
              <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">Summary / Strategy</p>
              <p class="text-xs text-primary-text/90 leading-relaxed bg-background/60 border border-primary-border/60 rounded-lg p-2.5">
                {{ activeOffer?.summary || activeOffer?.notes || 'No summary configured for this subscription offer.' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Fee Structure Breakdown Widget -->
        <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs">
          <div class="flex items-center justify-between px-4 py-3 border-b border-primary-border bg-background/40">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                <DollarSign class="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 class="text-xs font-bold text-primary-text">Fee Structure & Distribution</h3>
                <p class="text-[11px] text-secondary-text">Performance & Management fee settings</p>
              </div>
            </div>
            <button
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary-border bg-background hover:bg-card-background text-primary-text hover:text-primary text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              @click="openEditInfoDialog('fees')"
            >
              <Pencil class="w-3 h-3 text-secondary-text" />
              <span>Edit</span>
            </button>
          </div>

          <div class="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Performance Fee -->
            <div class="bg-background border border-primary-border rounded-lg p-3 flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] uppercase font-bold text-secondary-text tracking-wider">Performance</span>
                <TrendingUp class="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div>
                <p class="text-lg font-extrabold text-primary-text font-mono">
                  {{ activeOffer?.performance_fee ?? 0 }}%
                </p>
                <p class="text-[10px] text-secondary-text mt-0.5">On net profits</p>
              </div>
            </div>

            <!-- Management Fee -->
            <div class="bg-background border border-primary-border rounded-lg p-3 flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] uppercase font-bold text-secondary-text tracking-wider">Management</span>
                <Clock class="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p class="text-lg font-extrabold text-primary-text font-mono">
                  {{ activeOffer?.management_fee ?? 0 }}%
                </p>
                <p class="text-[10px] text-secondary-text mt-0.5 capitalize">
                  {{ activeOffer?.management_fee_interval || 'monthly' }}
                </p>
              </div>
            </div>

            <!-- Registration Fee -->
            <div class="bg-background border border-primary-border rounded-lg p-3 flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] uppercase font-bold text-secondary-text tracking-wider">Registration</span>
                <Shield class="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <p class="text-lg font-extrabold text-primary-text font-mono">
                  {{ formatCurrency(activeOffer?.registration_fee) }}
                </p>
                <p class="text-[10px] text-secondary-text mt-0.5">One-time entry</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Account Limitations & Quick Launch -->
      <div class="space-y-4 flex flex-col justify-between">
        <!-- Account Requirement Limits -->
        <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs">
          <div class="flex items-center justify-between px-4 py-3 border-b border-primary-border bg-background/40">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                <Wallet class="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 class="text-xs font-bold text-primary-text">Account Requirements</h3>
                <p class="text-[11px] text-secondary-text">Follower entry capital filter</p>
              </div>
            </div>
            <button
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary-border bg-background hover:bg-card-background text-primary-text hover:text-primary text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              @click="openEditInfoDialog('filters')"
            >
              <Pencil class="w-3 h-3 text-secondary-text" />
              <span>Edit</span>
            </button>
          </div>

          <div class="p-4">
            <div class="bg-background border border-primary-border rounded-lg p-3 text-center">
              <p class="text-[10px] uppercase font-bold tracking-widest text-secondary-text">Minimum Balance</p>
              <p class="text-2xl font-black text-primary font-mono my-0.5">
                {{ formatCurrency(activeOffer?.minimum_balance) }}
              </p>
              <p class="text-[10px] text-secondary-text">Required capital to follow</p>
            </div>
          </div>
        </div>

        <!-- Quick Summary Card -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4 shadow-2xs space-y-2.5">
          <div>
            <h4 class="text-xs font-bold text-primary-text">Quick Launch</h4>
            <p class="text-[11px] text-secondary-text mt-0.5">
              Invite followers or assign profit-sharing partner agents.
            </p>
          </div>
          <div class="space-y-2 pt-0.5">
            <button
              v-if="hasPermission('fund_manager.update')"
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-primary-text text-xs font-semibold transition-colors cursor-pointer shadow-2xs group"
              @click="addFollowerDialogOpen = true"
            >
              <span class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserPlus class="w-3.5 h-3.5" />
                </div>
                <span>Add Follower</span>
              </span>
              <Plus class="w-3.5 h-3.5 opacity-60 group-hover:text-emerald-600 transition-colors" />
            </button>

            <button
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-primary-border bg-background hover:bg-card-background text-primary-text text-xs font-semibold transition-colors cursor-pointer shadow-2xs group"
              @click="openCreateLinkDialog"
            >
              <span class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Link2 class="w-3 h-3" />
                </div>
                <span>Generate Join Link</span>
              </span>
              <Plus class="w-3.5 h-3.5 opacity-60 group-hover:text-primary transition-colors" />
            </button>
            <button
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-primary-border bg-background hover:bg-card-background text-primary-text text-xs font-semibold transition-colors cursor-pointer shadow-2xs group"
              @click="openCreateAgentDialog"
            >
              <span class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Users class="w-3 h-3" />
                </div>
                <span>Add Partner Agent</span>
              </span>
              <Plus class="w-3.5 h-3.5 opacity-60 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: JOIN LINKS MANAGER -->
    <div v-else-if="activeTab === 'links'" class="space-y-4">
      <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs">
        <!-- Top Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-b border-primary-border bg-background/40">
          <div>
            <h3 class="text-sm font-bold text-primary-text">Offer's Join Links & Campaigns</h3>
            <p class="text-xs text-secondary-text mt-0.5">
              Direct invitation tokens allowing clients to subscribe directly to this offer.
            </p>
          </div>
          <button
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
            @click="openCreateLinkDialog"
          >
            <Plus class="w-3.5 h-3.5" /> Generate Join Link
          </button>
        </div>

        <!-- Content Area -->
        <div v-if="store.linksLoading" class="flex flex-col items-center justify-center py-16 text-xs text-secondary-text gap-2">
          <Loader2 class="w-6 h-6 animate-spin text-primary opacity-80" />
          <p>Loading join links...</p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="store.joinLinks.length === 0"
          class="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div class="w-14 h-14 rounded-lg bg-background border border-primary-border flex items-center justify-center mb-3 text-secondary-text shadow-2xs">
            <Link2 class="w-6 h-6 opacity-40" />
          </div>
          <h4 class="text-sm font-bold text-primary-text mb-1">No Join Links Created</h4>
          <p class="text-xs text-secondary-text max-w-sm mb-4">
            Generate invitation tokens for private promotions or custom campaigns.
          </p>
          <button
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            @click="openCreateLinkDialog"
          >
            <Plus class="w-3.5 h-3.5" /> Create First Link
          </button>
        </div>

        <!-- Links Table View -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-xs text-left">
            <thead>
              <tr class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3.5 px-5 whitespace-nowrap">Title & Invitation Token</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Expiration Date</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Usage Limit</th>
                <th class="py-3.5 px-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border/60">
              <tr
                v-for="link in store.joinLinks"
                :key="link.id"
                class="hover:bg-background/40 transition-colors"
              >
                <!-- Title & Code -->
                <td class="py-4 px-5 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Link2 class="w-4 h-4" />
                    </div>
                    <div>
                      <p class="font-bold text-primary-text text-xs">{{ link.title || 'Untitled Link' }}</p>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[11px] font-mono text-primary font-semibold select-all">
                          {{ link.link_code || link.token }}
                        </span>
                        <button
                          class="text-secondary-text hover:text-primary transition-colors cursor-pointer"
                          @click="copyLink(link.link_code || link.share_url || link.token)"
                          title="Copy Full Link"
                        >
                          <Copy class="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Expiry -->
                <td class="py-4 px-4 text-secondary-text whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <Calendar class="w-3.5 h-3.5 opacity-60" />
                    <span>{{ link.expires_at ? formatDate(link.expires_at) : 'Never expires' }}</span>
                  </div>
                </td>

                <!-- Status -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <span
                    class="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 shadow-2xs"
                    :class="link.is_active !== false
                      ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                      : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
                  >
                    <CheckCircle2 v-if="link.is_active !== false" class="w-3 h-3" />
                    <XCircle v-else class="w-3 h-3" />
                    {{ link.is_active !== false ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <!-- Usage -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-primary-border bg-background text-secondary-text">
                    {{ link.max_uses ? `${link.used_count ?? 0} / ${link.max_uses} used` : `${link.used_count ?? 0} used (No limit)` }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-4 px-5 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      class="px-2.5 py-1.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-primary text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      @click="copyLink(link.link_code || link.share_url || link.token)"
                      title="Copy URL"
                    >
                      <Copy class="w-3 h-3" /> Copy URL
                    </button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border/60 hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                      @click="openEditLinkDialog(link)"
                      title="Edit Link"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border/60 hover:border-rose-500/30 hover:bg-rose-500/10 text-secondary-text hover:text-rose-500 transition-colors cursor-pointer"
                      @click="confirmDeleteLink(link)"
                      title="Delete Link"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: PROFIT SHARING AGENTS -->
    <div v-else-if="activeTab === 'agents'" class="space-y-4">
      <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs">
        <!-- Top Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-b border-primary-border bg-background/40">
          <div>
            <h3 class="text-sm font-bold text-primary-text">Profit Sharing Partner Agents</h3>
            <p class="text-xs text-secondary-text mt-0.5">
              Assign trading accounts to receive sub-shares of the performance fee from this offer.
            </p>
          </div>
          <button
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
            @click="openCreateAgentDialog"
          >
            <Plus class="w-3.5 h-3.5" /> Add Agent
          </button>
        </div>

        <!-- Share Distribution Visualization Bar -->
        <div class="p-5 border-b border-primary-border/80 bg-background/30 space-y-3">
          <div class="flex items-center justify-between text-xs font-bold text-secondary-text">
            <span>Share Distribution</span>
            <span class="text-primary-text font-mono">
              Total Allocated: <strong class="text-primary">{{ formatShare(store.agentsSummary.total_share) }}</strong>
              · Remaining: <strong class="text-emerald-500">{{ formatShare(store.agentsSummary.remaining_share) }}</strong>
            </span>
          </div>

          <!-- Stacked Progress Bar -->
          <div class="h-3 w-full bg-background border border-primary-border rounded-full overflow-hidden flex shadow-2xs">
            <div
              class="bg-primary h-full transition-all duration-300"
              :style="{ width: `${Math.min(100, store.agentsSummary.total_share || 0)}%` }"
              title="Allocated to Agents"
            />
            <div
              class="bg-emerald-500/40 h-full transition-all duration-300"
              :style="{ width: `${Math.min(100, store.agentsSummary.remaining_share || 0)}%` }"
              title="Remaining Share"
            />
          </div>
        </div>

        <!-- Content Area -->
        <div v-if="store.agentsLoading" class="flex flex-col items-center justify-center py-16 text-xs text-secondary-text gap-2">
          <Loader2 class="w-6 h-6 animate-spin text-primary opacity-80" />
          <p>Loading additional agents...</p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="store.agents.length === 0"
          class="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div class="w-14 h-14 rounded-lg bg-background border border-primary-border flex items-center justify-center mb-3 text-secondary-text shadow-2xs">
            <Users class="w-6 h-6 opacity-40" />
          </div>
          <h4 class="text-sm font-bold text-primary-text mb-1">No Additional Agents Configured</h4>
          <p class="text-xs text-secondary-text max-w-sm mb-4">
            Distribute a portion of the fund manager's performance fee to partner trading accounts.
          </p>
          <button
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            @click="openCreateAgentDialog"
          >
            <Plus class="w-3.5 h-3.5" /> Add First Agent
          </button>
        </div>

        <!-- Agents Table View -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-xs text-left">
            <thead>
              <tr class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3.5 px-5 whitespace-nowrap">Partner Account</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Broker Label</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Share Allocation</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Created Date</th>
                <th class="py-3.5 px-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border/60">
              <tr
                v-for="agent in store.agents"
                :key="agent.id"
                class="hover:bg-background/40 transition-colors"
              >
                <!-- Partner Account -->
                <td class="py-4 px-5 whitespace-nowrap font-bold text-primary-text">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Users class="w-4 h-4" />
                    </div>
                    <div>
                      <p class="font-mono text-xs">{{ formatAgentAccount(agent) }}</p>
                      <p class="text-[10px] text-secondary-text font-normal">ID #{{ agent.id }}</p>
                    </div>
                  </div>
                </td>

                <!-- Broker Label -->
                <td class="py-4 px-4 text-secondary-text whitespace-nowrap font-medium">
                  {{ agent.broker_label || '—' }}
                </td>

                <!-- Share -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <span class="text-xs font-extrabold px-3 py-1 rounded-lg border border-primary/20 bg-primary/10 text-primary font-mono">
                    {{ formatShare(agent.share_percentage) }}
                  </span>
                </td>

                <!-- Status -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <span
                    class="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 shadow-2xs"
                    :class="agent.is_active
                      ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                      : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
                  >
                    {{ agent.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <!-- Created Date -->
                <td class="py-4 px-4 text-secondary-text whitespace-nowrap font-medium">
                  {{ formatDate(agent.created_at) }}
                </td>

                <!-- Actions -->
                <td class="py-4 px-5 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border/60 hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                      @click="openEditAgentDialog(agent)"
                      title="Edit Agent"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-border/60 hover:border-rose-500/30 hover:bg-rose-500/10 text-secondary-text hover:text-rose-500 transition-colors cursor-pointer"
                      @click="confirmDeleteAgent(agent)"
                      title="Delete Agent"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- DIALOGS -->
    <AddFollowerDialog
      :open="addFollowerDialogOpen"
      :fm-id="fmId"
      :default-offer-id="offerId"
      :currency="activeCurrency"
      @close="addFollowerDialogOpen = false"
      @created="onFollowerAdded"
    />

    <CreateJoinLinkDialog
      :open="linkDialogOpen"
      :offer-id="offerId"
      :edit-link="editingLink"
      @close="linkDialogOpen = false"
      @created="onLinkCreated"
    />

    <EditOfferInfoDialog
      v-if="activeOffer && editingSection"
      :open="editInfoDialogOpen"
      :section="editingSection"
      :offer-id="offerId"
      :offer="activeOffer"
      @close="editInfoDialogOpen = false"
      @updated="refreshData"
    />

    <CreateAgentDialog
      :open="agentDialogOpen"
      :offer-id="offerId"
      @close="agentDialogOpen = false"
      @created="onAgentCreated"
    />

    <EditAgentDialog
      :open="agentEditDialogOpen"
      :offer-id="offerId"
      :agent="editingAgent"
      @close="agentEditDialogOpen = false"
    />

    <DeleteAgentConfirmationDialog
      :open="!!deleteAgentTarget"
      :agent="deleteAgentTarget"
      :loading="store.deleteAgentLoading"
      @close="deleteAgentTarget = null"
      @confirm="doDeleteAgent"
    />

    <!-- Delete Link Modal -->
    <div
      v-if="deleteLinkTarget"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="deleteLinkTarget = null"
    >
      <div class="bg-card-background rounded-lg border border-primary-border w-full max-w-sm overflow-hidden shadow-2xl">
        <div class="px-5 py-4 border-b border-primary-border flex items-center gap-2">
          <Trash2 class="w-4 h-4 text-rose-500" />
          <h2 class="text-sm font-bold text-primary-text">Delete Join Link</h2>
        </div>
        <div class="px-5 py-4">
          <p class="text-xs text-secondary-text leading-relaxed">
            Are you sure you want to delete <span class="font-bold text-primary-text">"{{ deleteLinkTarget.title || deleteLinkTarget.link_code }}"</span>? This action cannot be undone.
          </p>
        </div>
        <div class="px-5 py-4 border-t border-primary-border flex gap-3 bg-card-background">
          <button
            class="flex-1 px-4 py-2 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            @click="deleteLinkTarget = null"
          >
            Cancel
          </button>
          <button
            :disabled="store.deleteLinkLoading"
            class="flex-1 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            @click="doDeleteLink"
          >
            <Loader2 v-if="store.deleteLinkLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ store.deleteLinkLoading ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Plus, Tag, Link2, Pencil, Trash2, Copy, RotateCw, Loader2,
  CheckCircle2, XCircle, Users, ArrowLeft, Calendar, DollarSign,
  TrendingUp, Wallet, Clock, Shield, Check, UserPlus
} from 'lucide-vue-next'
import { useFmOffersStore } from '@/stores/fmOffers/fmOffers'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import Tooltip from '@/components/common/Tooltip.vue'
import AddFollowerDialog from '@/components/fmOffers/AddFollowerDialog.vue'
import CreateJoinLinkDialog from '@/components/fmOffers/CreateJoinLinkDialog.vue'
import EditOfferInfoDialog from '@/components/fmOffers/EditOfferInfoDialog.vue'
import CreateAgentDialog from '@/components/fmOffers/CreateAgentDialog.vue'
import EditAgentDialog from '@/components/fmOffers/EditAgentDialog.vue'
import DeleteAgentConfirmationDialog from '@/components/fmOffers/DeleteAgentConfirmationDialog.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()
const store = useFmOffersStore()
const { hasPermission } = usePermissionCheck()

const offerId = computed(() => route.params.id)
const storedActiveOffer = ref(null)
const activeTab = ref('overview')
const copiedCode = ref(false)

const activeOffer = computed(() => {
  const currentOffer = store.offers.find((o) => String(o.id) === String(offerId.value))
  if (currentOffer) return currentOffer
  if (storedActiveOffer.value && String(storedActiveOffer.value.id) === String(offerId.value)) {
    return storedActiveOffer.value
  }
  return null
})

const fmId = computed(() => {
  return (
    route.query.fm_id ||
    activeOffer.value?.fund_manager_id ||
    activeOffer.value?.fm_id ||
    storedActiveOffer.value?.fund_manager_id ||
    storedActiveOffer.value?.fm_id ||
    null
  )
})

const tabs = computed(() => [
  { id: 'overview', label: 'Overview & Terms', icon: Tag },
  { id: 'links', label: 'Join Links', icon: Link2, count: store.joinLinks.length },
  { id: 'agents', label: 'Profit Sharing Agents', icon: Users, count: store.agents.length },
])

// Dialog States
const addFollowerDialogOpen = ref(false)
const linkDialogOpen = ref(false)
const editingLink = ref(null)
const deleteLinkTarget = ref(null)

const editInfoDialogOpen = ref(false)
const editingSection = ref(null)

const agentDialogOpen = ref(false)
const agentEditDialogOpen = ref(false)
const editingAgent = ref(null)
const deleteAgentTarget = ref(null)

const goBackToOffers = () => {
  const targetFmId = fmId.value
  if (targetFmId) {
    router.push(`/fm/offers/${targetFmId}`)
  } else {
    router.back()
  }
}

const openCreateLinkDialog = () => {
  editingLink.value = null
  linkDialogOpen.value = true
}
const openEditLinkDialog = (link) => {
  editingLink.value = { ...link }
  linkDialogOpen.value = true
}
const confirmDeleteLink = (link) => {
  deleteLinkTarget.value = link
}
const doDeleteLink = () => {
  if (!deleteLinkTarget.value) return
  store.deleteJoinLink(offerId.value, deleteLinkTarget.value.id, () => {
    deleteLinkTarget.value = null
  })
}
const onLinkCreated = () => {
  activeTab.value = 'links'
  store.fetchJoinLinks(offerId.value)
}

const onFollowerAdded = () => {
  refreshData()
}

const openEditInfoDialog = (section) => {
  editingSection.value = section
  editInfoDialogOpen.value = true
}

const openCreateAgentDialog = () => { agentDialogOpen.value = true }
const openEditAgentDialog = (agent) => {
  editingAgent.value = agent
  agentEditDialogOpen.value = true
}
const confirmDeleteAgent = (agent) => { deleteAgentTarget.value = agent }
const doDeleteAgent = () => {
  if (!deleteAgentTarget.value) return
  store.deleteAgent(offerId.value, deleteAgentTarget.value.id, () => {
    deleteAgentTarget.value = null
  })
}
const onAgentCreated = () => {
  activeTab.value = 'agents'
  store.fetchAgents(offerId.value)
}

const copyText = async (text, label = 'Code') => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
    copiedCode.value = true
    setTimeout(() => { copiedCode.value = false }, 2000)
    snackbar.show(`${label} copied to clipboard.`, 'success')
  } catch {
    snackbar.show(`Failed to copy ${label}.`, 'error')
  }
}

const copyLink = async (linkValue) => {
  try {
    const code = linkValue?.startsWith('/join/') ? linkValue.replace('/join/', '') : linkValue
    const fullUrl = `${window.location.origin}/join/${code}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(fullUrl)
    } else {
      const ta = document.createElement('textarea')
      ta.value = fullUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    snackbar.show('Link copied to clipboard.', 'success')
  } catch {
    snackbar.show('Failed to copy link.', 'error')
  }
}

const fmt = (v) => (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const activeCurrency = computed(() => {
  return (
    route.query.currency ||
    activeOffer.value?.broker_currency ||
    activeOffer.value?.currency ||
    'USD'
  )
})

const getCurrencySymbol = (currency) => {
  const c = String(currency || '').trim().toUpperCase()
  if (c === 'USC' || c === 'CENT') return 'C'
  if (c === 'CAD') return 'C$'
  if (c === 'EUR') return '€'
  if (c === 'GBP') return '£'
  if (c === 'INR') return '₹'
  if (c === 'JPY') return '¥'
  if (c === 'USD') return '$'
  return c ? `${c} ` : '$'
}

const formatCurrency = (val, currency = null) => {
  if (val === null || val === undefined || isNaN(val)) return '—'
  const num = Number(val)
  if (isNaN(num)) return '—'
  const sym = getCurrencySymbol(currency || activeCurrency.value)
  return `${sym}${fmt(num)}`
}
const formatDate = (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const formatShare = (s) => (s === null || s === undefined || s === '') ? '—' : `${Number(s)}%`
const formatAgentAccount = (a) => a?.trading_account_id ?? a?.account_number ?? a?.trading_account?.account_number ?? '—'

const refreshData = () => {
  if (fmId.value) {
    store.fetchOffers(fmId.value, true)
  }
  store.fetchJoinLinks(offerId.value)
  store.fetchAgents(offerId.value)
}

onMounted(() => {
  try {
    storedActiveOffer.value = JSON.parse(localStorage.getItem('active_offer') || 'null')
  } catch {
    storedActiveOffer.value = null
  }
  refreshData()
})

watch(activeOffer, (offer) => {
  if (offer) localStorage.setItem('active_offer', JSON.stringify(offer))
}, { immediate: true, deep: true })
</script>
