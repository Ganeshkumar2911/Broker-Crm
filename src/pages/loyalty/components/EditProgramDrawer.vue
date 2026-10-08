<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Sticky Header -->
        <div class="px-6 py-4.5 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/90 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <component :is="sectionMeta.icon" class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                {{ sectionMeta.title }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                {{ sectionMeta.subtitle }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="$emit('close')"
          >
            <X class="w-4.5 h-4.5" />
          </button>
        </div>

        <!-- Section Navigation Pills (When in All mode or for quick switching) -->
        <div v-if="props.initialSection === 'all'" class="px-6 pt-3 pb-1 border-b border-primary-border bg-card-background/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            v-for="sec in sectionTabs"
            :key="sec.key"
            type="button"
            class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer whitespace-nowrap"
            :class="activeSection === sec.key ? 'bg-primary text-white shadow-xs' : 'text-secondary-text hover:text-primary-text hover:bg-background'"
            @click="activeSection = sec.key"
          >
            {{ sec.label }}
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form id="edit-program-form" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs" @submit.prevent="handleSubmit">
          <!-- General Info Card -->
          <div
            v-if="activeSection === 'all' || activeSection === 'general'"
            id="section-general"
            class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5 text-primary" />
              General Parameters
            </span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Program Code</label>
                  <input
                    v-model="form.code"
                    type="text"
                    required
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary uppercase font-mono transition"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Status</label>
                  <BaseSelect
                    v-model="form.status"
                    :options="statusOptions"
                    placeholder="Select status..."
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Program Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Description</label>
                <textarea
                  v-model="form.description"
                  rows="2"
                  placeholder="Program overview and trader rules..."
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition resize-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Account Scope</label>
                  <BaseSelect
                    v-model="form.account_scope"
                    :options="scopeOptions"
                    placeholder="Select scope..."
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Terms Version</label>
                  <input
                    v-model="form.terms_version"
                    type="text"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>
              </div>

              <div class="space-y-2 pt-1 border-t border-primary-border/60">
                <div class="flex items-center justify-between">
                  <label class="font-semibold text-primary-text">Program Banners & Images (Max 4)</label>
                  <span class="text-[10px] text-secondary-text font-mono">{{ imageUrlsList.length }}/4</span>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="(url, idx) in imageUrlsList"
                    :key="idx"
                    class="flex items-center gap-2"
                  >
                    <div class="w-8 h-8 rounded-lg bg-background border border-primary-border overflow-hidden shrink-0 flex items-center justify-center">
                      <video
                        v-if="url && isVideoUrl(url)"
                        :src="url"
                        autoplay
                        loop
                        muted
                        playsinline
                        class="w-full h-full object-cover"
                      />
                      <img
                        v-else-if="url"
                        :src="url"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.style.display = 'none'"
                      />
                      <ImageIcon v-else class="w-3.5 h-3.5 text-secondary-text" />
                    </div>
                    <input
                      v-model="imageUrlsList[idx]"
                      type="url"
                      placeholder="https://..."
                      class="flex-1 px-3 py-1.5 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      class="w-7 h-7 flex items-center justify-center text-secondary-text hover:text-rose-400 rounded-lg hover:bg-background transition cursor-pointer"
                      title="Remove Image"
                      @click="removeImageUrl(idx)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  v-if="imageUrlsList.length < 4"
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-primary-border hover:border-primary/50 text-secondary-text hover:text-primary transition text-xs cursor-pointer w-full justify-center"
                  @click="addImageUrl"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Add Program Banner URL</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Timeline Dates Card -->
          <div
            v-if="activeSection === 'all' || activeSection === 'lifecycle'"
            id="section-lifecycle"
            class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5 text-primary" />
              Program Lifecycle Dates
            </span>

            <div class="space-y-1">
              <label class="font-semibold text-primary-text">Program Date Range</label>
              <BaseDatePicker
                v-model="dateRange"
                :range="true"
                :enableTime="true"
                :disableFuture="false"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                placeholder="Select start and end date & time"
              />
            </div>
          </div>

          <div
            v-if="activeSection === 'all' || activeSection === 'core_rules'"
            id="section-core_rules"
            class="space-y-5"
          >
            <!-- Earning & Redemption Limits -->
            <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
              <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
                <Award class="w-3.5 h-3.5 text-primary" />
                Earning & Redemption Metrics
              </span>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Base Pts / Std Lot</label>
                  <input
                    v-model.number="form.base_points_per_lot"
                    type="number"
                    step="any"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Min Redemption Pts</label>
                  <input
                    v-model.number="form.min_redemption_points"
                    type="number"
                    step="any"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Min Trade Duration (s)</label>
                  <input
                    v-model.number="form.min_trade_duration_seconds"
                    type="number"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Point Validity (Days)</label>
                  <input
                    v-model.number="form.point_validity_days"
                    type="number"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>
              </div>
            </div>

            <!-- Tier Qualification & Durations -->
            <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
              <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-primary" />
                Tier Window & Policy Durations
              </span>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Tier Window (Days)</label>
                  <input
                    v-model.number="form.tier_window_days"
                    type="number"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Grace Period (Days)</label>
                  <input
                    v-model.number="form.grace_period_days"
                    type="number"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1 sm:col-span-2">
                  <label class="font-semibold text-primary-text">Dormancy Threshold (Days)</label>
                  <input
                    v-model.number="form.dormant_days"
                    type="number"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>
              </div>

              <!-- Carry Over & Wallet Transfer Toggles -->
              <div class="pt-2 border-t border-primary-border/60 space-y-2.5">
                <label class="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    v-model="form.carry_over_enrollments"
                    type="checkbox"
                    class="w-4 h-4 rounded text-primary border-primary-border focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <p class="font-semibold text-primary-text">Carry Over Enrollments</p>
                    <p class="text-[10px] text-secondary-text">Automatically migrate active members to subsequent cycles</p>
                  </div>
                </label>

                <label class="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    v-model="form.allow_general_wallet_transfer"
                    type="checkbox"
                    class="w-4 h-4 rounded text-primary border-primary-border focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <p class="font-semibold text-primary-text">Allow General Wallet Transfer</p>
                    <p class="text-[10px] text-secondary-text">Permit clients to convert central points to any eligible trading account</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Deposit Bonus (Promo Grant) -->
            <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
                  <Coins class="w-3.5 h-3.5 text-primary" />
                  Deposit Bonus (Promo Grant)
                </span>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    v-model="form.deposit_bonus_enabled"
                    type="checkbox"
                    class="w-4 h-4 rounded text-primary border-primary-border focus:ring-0 cursor-pointer"
                  />
                  <span class="text-xs font-semibold" :class="form.deposit_bonus_enabled ? 'text-primary' : 'text-secondary-text'">
                    {{ form.deposit_bonus_enabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </label>
              </div>

              <p class="text-[10px] text-secondary-text">
                Awards points on every qualifying deposit based on threshold brackets. Formula: <span class="font-mono text-primary-text font-semibold">points = base_points × ceil(usd / bracket_usd)</span>, capped at max points if set.
              </p>

              <div v-if="form.deposit_bonus_enabled" class="space-y-3 pt-2 border-t border-primary-border/60">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <!-- Points per Bracket -->
                  <div class="space-y-1">
                    <label class="font-semibold text-primary-text text-xs flex items-center justify-between">
                      <span>Points per Bracket</span>
                      <span class="text-[10px] text-primary font-mono font-medium">pts</span>
                    </label>
                    <input
                      v-model.number="form.deposit_bonus_base_points"
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      placeholder="10.00"
                      class="w-full px-3 py-2 bg-card-background border rounded-lg text-primary-text outline-none transition font-mono text-xs"
                      :class="depositBonusErrors.base ? 'border-primary-red focus:border-primary-red' : 'border-primary-border focus:border-primary'"
                    />
                    <p v-if="depositBonusErrors.base" class="text-[9px] text-primary-red">{{ depositBonusErrors.base }}</p>
                    <p v-else class="text-[9px] text-secondary-text">Points awarded per bracket level</p>
                  </div>

                  <!-- Bracket Size (USD) -->
                  <div class="space-y-1">
                    <label class="font-semibold text-primary-text text-xs flex items-center justify-between">
                      <span>Bracket Size (USD)</span>
                      <span class="text-[10px] text-primary font-mono font-medium">USD</span>
                    </label>
                    <input
                      v-model.number="form.deposit_bonus_band_usd"
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      placeholder="200.00"
                      class="w-full px-3 py-2 bg-card-background border rounded-lg text-primary-text outline-none transition font-mono text-xs"
                      :class="depositBonusErrors.band ? 'border-primary-red focus:border-primary-red' : 'border-primary-border focus:border-primary'"
                    />
                    <p v-if="depositBonusErrors.band" class="text-[9px] text-primary-red">{{ depositBonusErrors.band }}</p>
                    <p v-else class="text-[9px] text-secondary-text">Deposit threshold increment (USD)</p>
                  </div>

                  <!-- Max points (optional) -->
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <label class="font-semibold text-primary-text text-xs">Max points (optional)</label>
                      <button
                        v-if="form.deposit_bonus_max_points !== null && form.deposit_bonus_max_points !== ''"
                        type="button"
                        class="text-[10px] text-primary hover:underline cursor-pointer"
                        @click="form.deposit_bonus_max_points = null"
                      >
                        Clear Cap
                      </button>
                    </div>
                    <input
                      v-model.number="form.deposit_bonus_max_points"
                      type="number"
                      step="any"
                      min="0"
                      placeholder="Leave blank for no cap"
                      class="w-full px-3 py-2 bg-card-background border rounded-lg text-primary-text outline-none transition font-mono text-xs"
                      :class="depositBonusErrors.max ? 'border-primary-red focus:border-primary-red' : 'border-primary-border focus:border-primary'"
                    />
                    <p v-if="depositBonusErrors.max" class="text-[9px] text-primary-red">{{ depositBonusErrors.max }}</p>
                    <p v-else class="text-[9px] text-secondary-text">Cap per deposit (null = unlimited)</p>
                  </div>
                </div>

                <!-- Dynamic 3-Level Preview & Calculator -->
                <div class="p-3 bg-card-background/70 border border-primary-border/80 rounded-lg space-y-2.5 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold text-primary-text flex items-center gap-1.5">
                      <Calculator class="w-3.5 h-3.5 text-primary" />
                      Dynamic Level Breakdown
                    </span>
                    <span class="text-[10px] text-secondary-text">
                      Formula: <span class="font-mono text-primary-text font-semibold">pts = base × ceil(usd / bracket)</span>
                    </span>
                  </div>

                  <!-- 3 Dynamic Levels Display -->
                  <div v-if="dynamicPreviewLevels.length > 0" class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                    <div
                      v-for="lvl in dynamicPreviewLevels"
                      :key="lvl.level"
                      class="p-2.5 rounded-lg bg-background/80 border border-primary-border flex flex-col justify-between"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] uppercase font-bold text-secondary-text tracking-wider">Level {{ lvl.level }}</span>
                        <span v-if="lvl.isCapped" class="text-[9px] px-1.5 py-0.2 rounded bg-primary-yellow/10 text-primary-yellow font-medium">Capped</span>
                      </div>
                      <span class="font-mono text-xs font-semibold text-primary-text mt-1">{{ lvl.range }}</span>
                      <div class="flex items-center justify-between mt-1.5 pt-1.5 border-t border-primary-border/60">
                        <span class="text-[10px] text-secondary-text">Awards</span>
                        <span class="font-mono text-xs font-bold text-primary-green">{{ lvl.points }} pts</span>
                      </div>
                    </div>
                  </div>

                  <div v-else class="p-2.5 text-center text-secondary-text text-[11px] bg-background/50 rounded-lg border border-dashed border-primary-border">
                    Enter positive points and bracket size to view level breakdown.
                  </div>

                  <!-- Custom Amount Interactive Test -->
                  <div class="pt-2 border-t border-primary-border/60">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background/60 p-2.5 rounded-lg border border-primary-border/70">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] text-secondary-text font-medium shrink-0">Test Any Deposit:</span>
                        <div class="relative w-32">
                          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-secondary-text font-mono">$</span>
                          <input
                            v-model.number="previewDepositAmount"
                            type="number"
                            step="any"
                            min="0"
                            placeholder="750"
                            class="w-full pl-6 pr-2 py-1 bg-card-background border border-primary-border rounded text-primary-text outline-none focus:border-primary font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div class="flex items-center gap-2 font-mono text-xs shrink-0">
                        <span class="text-[10px] font-sans text-secondary-text">Payout:</span>
                        <span class="font-bold text-primary-green">{{ previewBonusResult.points }} pts</span>
                        <span class="text-[10px] font-sans text-secondary-text">({{ previewBonusResult.levelLabel }})</span>
                      </div>
                    </div>

                    <p class="text-[10px] text-secondary-text flex items-center gap-1 mt-1.5">
                      <Info class="w-3 h-3 text-secondary-text shrink-0" />
                      <span>{{ previewBonusResult.description }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Eligibility Rules -->
          <div
            v-if="activeSection === 'all' || activeSection === 'eligibility'"
            id="section-eligibility"
            class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-primary-green" />
              Account Eligibility Rules
            </span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <label class="flex items-center gap-2 p-2.5 bg-card-background border border-primary-border rounded-lg cursor-pointer select-none">
                  <input
                    v-model="form.eligibility_rules.require_kyc"
                    type="checkbox"
                    class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                  />
                  <div>
                    <span class="font-semibold text-primary-text block">Require KYC</span>
                    <span class="text-[9px] text-secondary-text">Only verified clients</span>
                  </div>
                </label>

                <label class="flex items-center gap-2 p-2.5 bg-card-background border border-primary-border rounded-lg cursor-pointer select-none">
                  <input
                    v-model="form.eligibility_rules.require_live"
                    type="checkbox"
                    class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                  />
                  <div>
                    <span class="font-semibold text-primary-text block">Require Live</span>
                    <span class="text-[9px] text-secondary-text">Exclude demo accounts</span>
                  </div>
                </label>

                <label class="flex items-center gap-2 p-2.5 bg-card-background border border-primary-border rounded-lg cursor-pointer select-none">
                  <input
                    v-model="form.eligibility_rules.exclude_copy_accounts"
                    type="checkbox"
                    class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                  />
                  <div>
                    <span class="font-semibold text-primary-text block">Exclude Copy A/Cs</span>
                    <span class="text-[9px] text-secondary-text">No copy trading accounts</span>
                  </div>
                </label>

                <label class="flex items-center gap-2 p-2.5 bg-card-background border border-primary-border rounded-lg cursor-pointer select-none">
                  <input
                    v-model="form.eligibility_rules.earn_on_copy_fills"
                    type="checkbox"
                    class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                  />
                  <div>
                    <span class="font-semibold text-primary-text block">Earn on Copy Fills</span>
                    <span class="text-[9px] text-secondary-text">Award on copied fills</span>
                  </div>
                </label>
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Excluded Account Categories (Comma-separated)</label>
                <input
                  v-model="excludedCategoriesText"
                  type="text"
                  placeholder="cent, pamm"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Allowed MT5 Group Codes (Comma-separated, leave blank for all)</label>
                <input
                  v-model="allowedGroupCodesText"
                  type="text"
                  placeholder="e.g. REAL, PRO (optional)"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <!-- Instrument Rules & Suffix Normalization -->
          <div
            v-if="activeSection === 'all' || activeSection === 'instruments'"
            id="section-instruments"
            class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
                <FileCode class="w-3.5 h-3.5 text-primary" />
                Instrument Rules & Custom Multipliers
              </span>

              <button
                type="button"
                class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[11px] transition cursor-pointer border border-primary/20"
                @click="addInstrumentRule"
              >
                <Plus class="w-3 h-3" />
                <span>Add Symbol Rule</span>
              </button>
            </div>

            <!-- Normalize Suffixes Toggle -->
            <label class="flex items-center gap-2 p-2.5 bg-card-background border border-primary-border rounded-lg cursor-pointer select-none">
              <input
                v-model="form.instrument_rules.normalize_suffixes"
                type="checkbox"
                class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
              />
              <div>
                <span class="font-semibold text-primary-text block">Normalize Symbol Suffixes</span>
                <span class="text-[10px] text-secondary-text">Strip broker symbol extensions (e.g. EURUSD.pro &rarr; EURUSD)</span>
              </div>
            </label>

            <!-- Rules List -->
            <div v-if="form.instrument_rules.rules && form.instrument_rules.rules.length > 0" class="space-y-2.5">
              <div
                v-for="(rule, index) in form.instrument_rules.rules"
                :key="index"
                class="p-3 bg-card-background border border-primary-border rounded-xl space-y-2 relative"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-primary-text text-[11px]">Symbol Rule #{{ index + 1 }}</span>
                  <button
                    type="button"
                    class="w-6 h-6 flex items-center justify-center rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    title="Remove Rule"
                    @click="removeInstrumentRule(index)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- <div class="grid grid-cols-1 sm:grid-cols-3 gap-2"> -->
                <div>
                  <div class="space-y-0.5 sm:col-span-2">
                    <label class="text-[10px] text-secondary-text font-medium">Symbols (Comma-separated)</label>
                    <input
                      v-model="rule.symbolsText"
                      type="text"
                      placeholder="e.g. EURUSD, XAUUSD, BTCUSD"
                      class="w-full px-2.5 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono text-xs"
                    />
                  </div>

                  <!-- <div class="space-y-0.5">
                    <label class="text-[10px] text-secondary-text font-medium">Match Type</label>
                    <BaseSelect
                      v-model="rule.match"
                      :options="matchTypeOptions"
                      placeholder="Match"
                    />
                  </div> -->
                </div>

                <div class="grid grid-cols-2 gap-2 pt-1 border-t border-primary-border/60">
                  <div class="space-y-0.5">
                    <label class="text-[10px] text-secondary-text font-medium">Base Pts / Lot</label>
                    <input
                      v-model.number="rule.base_points_per_lot"
                      type="number"
                      step="any"
                      placeholder="5"
                      class="w-full px-2.5 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono text-xs"
                    />
                  </div>

                  <div class="flex items-center pt-3.5">
                    <label class="flex items-center gap-1.5 text-xs text-primary-text cursor-pointer select-none">
                      <input
                        v-model="rule.eligible"
                        type="checkbox"
                        class="w-3.5 h-3.5 rounded text-primary border-primary-border cursor-pointer"
                      />
                      <span>Eligible for points</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="p-4 text-center text-secondary-text bg-background/30 rounded-lg border border-dashed border-primary-border text-[11px]">
              No custom symbol overrides. Standard base rate applies to all trades.
            </div>
          </div>
        </form>

        <!-- Sticky Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center gap-3 bg-card-background shrink-0">
          <button
            type="button"
            class="flex-1 px-4 py-2.5 rounded-xl border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background font-medium transition cursor-pointer text-xs"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-program-form"
            :disabled="store.actionLoading || (form.deposit_bonus_enabled && depositBonusErrors.hasError)"
            class="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>{{ store.actionLoading ? 'Saving...' : 'Save Configuration' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import {
  X,
  Loader2,
  SlidersHorizontal,
  FileText,
  Calendar,
  Award,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Plus,
  Trash2,
  Image as ImageIcon,
  Coins,
  Calculator,
  Info,
} from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  program: { type: Object, default: () => ({}) },
  initialSection: { type: String, default: "all" },
});

const emit = defineEmits(["close", "saved"]);
const store = useLoyaltyStore();
const snackbar = useSnackbarStore();

const activeSection = ref(props.initialSection || "all");

const sectionTabs = [
  { key: "all", label: "All Sections" },
  { key: "general", label: "General & Media" },
  { key: "lifecycle", label: "Lifecycle & Dates" },
  { key: "core_rules", label: "Rules & Thresholds" },
  { key: "eligibility", label: "Account Eligibility" },
  { key: "instruments", label: "Instrument Rules" },
];

const sectionMeta = computed(() => {
  switch (activeSection.value) {
    case "general":
      return {
        title: "Edit General Parameters",
        subtitle: "Update program name, status, account scope, and banners",
        icon: FileText,
      };
    case "lifecycle":
      return {
        title: "Edit Lifecycle & Schedule",
        subtitle: "Update program start and end timestamps",
        icon: Calendar,
      };
    case "core_rules":
      return {
        title: "Edit Core Rules & Thresholds",
        subtitle: "Configure base points, trade duration, dormancy, and tier windows",
        icon: ShieldCheck,
      };
    case "eligibility":
      return {
        title: "Edit Account Eligibility Rules",
        subtitle: "Configure KYC requirements, trading types, and category exclusions",
        icon: CheckCircle2,
      };
    case "instruments":
      return {
        title: "Edit Instrument Rules & Suffixes",
        subtitle: "Configure symbol-level point overrides and suffix normalization",
        icon: FileCode,
      };
    default:
      return {
        title: "Edit Program Configuration",
        subtitle: "Modify cycle duration, earn rates, eligibility, and custom instrument rules",
        icon: SlidersHorizontal,
      };
  }
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      activeSection.value = props.initialSection || "all";
    }
  },
);

watch(
  () => props.initialSection,
  (newSec) => {
    activeSection.value = newSec || "all";
  },
);

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Paused", value: "paused" },
  { label: "Ended", value: "ended" },
];

const scopeOptions = [
  { label: "One Account Per User", value: "one_per_user" },
  { label: "All Eligible Accounts", value: "all_eligible_accounts" },
];



const matchTypeOptions = [
  { label: "Exact Match", value: "exact" },
  { label: "Prefix Match", value: "prefix" },
  { label: "Suffix Match", value: "suffix" },
  { label: "Regex Match", value: "regex" },
];

const excludedCategoriesText = ref("cent, pamm");
const allowedGroupCodesText = ref("");
const imageUrlsList = ref([]);

const isVideoUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    cleanUrl.includes("/video/") ||
    cleanUrl.includes("format=mp4")
  );
};

const addImageUrl = () => {
  if (imageUrlsList.value.length < 4) {
    imageUrlsList.value.push("");
  }
};

const removeImageUrl = (index) => {
  imageUrlsList.value.splice(index, 1);
};

const form = reactive({
  code: "",
  name: "",
  description: "",
  status: "active",
  account_scope: "one_per_user",
  start_at: "",
  end_at: "",
  base_points_per_lot: 5,
  min_redemption_points: 100,
  min_trade_duration_seconds: 120,
  point_validity_days: 180,
  tier_window_days: 90,
  dormant_days: 90,
  grace_period_days: 14,
  terms_version: "1.0",
  carry_over_enrollments: false,
  allow_general_wallet_transfer: false,
  deposit_bonus_enabled: false,
  deposit_bonus_base_points: 10,
  deposit_bonus_band_usd: 500,
  deposit_bonus_max_points: null,
  eligibility_rules: {
    require_kyc: false,
    require_live: true,
    exclude_copy_accounts: true,
    earn_on_copy_fills: true,
    trading_types: ["real"],
    exclude_account_categories: ["cent", "pamm"],
    allowed_group_codes: null,
  },
  instrument_rules: {
    normalize_suffixes: true,
    rules: [],
  },
});

const dateRange = computed({
  get() {
    if (form.start_at || form.end_at) {
      return {
        start: form.start_at || null,
        end: form.end_at || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      form.start_at = "";
      form.end_at = "";
    } else if (Array.isArray(val)) {
      form.start_at = val[0] || "";
      form.end_at = val[1] || "";
    } else if (typeof val === "object") {
      form.start_at = val.start || val.from || "";
      form.end_at = val.end || val.to || "";
    }
  },
});

const addInstrumentRule = () => {
  form.instrument_rules.rules.push({
    symbolsText: "EURUSD, XAUUSD",
    match: "exact",
    base_points_per_lot: form.base_points_per_lot || 5,
    eligible: true,
  });
};

const removeInstrumentRule = (index) => {
  form.instrument_rules.rules.splice(index, 1);
};

watch(
  () => props.program,
  (p) => {
    if (p) {
      form.code = p.code ?? "";
      form.name = p.name ?? "";
      form.description = p.description ?? "";
      form.status = p.status ?? "active";
      form.account_scope = p.account_scope ?? "one_per_user";
      form.start_at = p.start_at ?? "";
      form.end_at = p.end_at ?? "";
      form.base_points_per_lot = p.base_points_per_lot !== undefined ? Number(p.base_points_per_lot) : 5;
      form.min_redemption_points = p.min_redemption_points !== undefined ? Number(p.min_redemption_points) : 100;
      form.min_trade_duration_seconds = p.min_trade_duration_seconds ?? 120;
      form.point_validity_days = p.point_validity_days ?? 180;
      form.tier_window_days = p.tier_window_days ?? 90;
      form.dormant_days = p.dormant_days ?? 90;
      form.grace_period_days = p.grace_period_days ?? 14;
      form.terms_version = p.terms_version ?? "1.0";
      form.carry_over_enrollments = Boolean(p.carry_over_enrollments);
      form.allow_general_wallet_transfer = Boolean(p.allow_general_wallet_transfer);
      form.deposit_bonus_enabled = Boolean(p.deposit_bonus_enabled);
      form.deposit_bonus_base_points = p.deposit_bonus_base_points != null ? Number(p.deposit_bonus_base_points) : 10;
      form.deposit_bonus_band_usd = p.deposit_bonus_band_usd != null ? Number(p.deposit_bonus_band_usd) : 500;
      form.deposit_bonus_max_points = p.deposit_bonus_max_points != null ? Number(p.deposit_bonus_max_points) : null;

      // Images
      if (Array.isArray(p.image_urls) && p.image_urls.length > 0) {
        imageUrlsList.value = [...p.image_urls];
      } else if (p.image_url) {
        imageUrlsList.value = [p.image_url];
      } else {
        imageUrlsList.value = [];
      }

      // Eligibility rules (supports eligibility_rules or eligibility alias)
      const el = p.eligibility_rules || p.eligibility || {};
      form.eligibility_rules = {
        require_kyc: Boolean(el.require_kyc),
        require_live: el.require_live !== undefined ? Boolean(el.require_live) : true,
        exclude_copy_accounts: el.exclude_copy_accounts !== undefined ? Boolean(el.exclude_copy_accounts) : true,
        earn_on_copy_fills: el.earn_on_copy_fills !== undefined ? Boolean(el.earn_on_copy_fills) : true,
        trading_types: Array.isArray(el.trading_types) ? el.trading_types : ["real"],
        exclude_account_categories: Array.isArray(el.exclude_account_categories) ? el.exclude_account_categories : ["cent", "pamm"],
        allowed_group_codes: Array.isArray(el.allowed_group_codes) ? el.allowed_group_codes : null,
      };
      excludedCategoriesText.value = form.eligibility_rules.exclude_account_categories.join(", ");
      allowedGroupCodesText.value = Array.isArray(el.allowed_group_codes) ? el.allowed_group_codes.join(", ") : "";

      // Instrument rules
      const inst = p.instrument_rules || {};
      form.instrument_rules = {
        normalize_suffixes: inst.normalize_suffixes !== undefined ? Boolean(inst.normalize_suffixes) : true,
        rules: Array.isArray(inst.rules)
          ? inst.rules.map((r) => ({
              symbolsText: Array.isArray(r.symbols) ? r.symbols.join(", ") : (r.symbols || ""),
              match: r.match || "exact",
              base_points_per_lot: r.base_points_per_lot ?? 5,
              eligible: r.eligible !== undefined ? Boolean(r.eligible) : true,
            }))
          : [],
      };
    }
  },
  { immediate: true },
);

const previewDepositAmount = ref(750);

const dynamicPreviewLevels = computed(() => {
  const step = Number(form.deposit_bonus_band_usd || 0);
  const pts = Number(form.deposit_bonus_base_points || 0);
  const max =
    form.deposit_bonus_max_points !== null &&
    form.deposit_bonus_max_points !== "" &&
    form.deposit_bonus_max_points !== undefined
      ? Number(form.deposit_bonus_max_points)
      : null;

  if (step <= 0 || pts <= 0) {
    return [];
  }

  return [1, 2, 3].map((lvl) => {
    const fromUsd = (lvl - 1) * step;
    const toUsd = lvl * step;
    const rawPts = pts * lvl;
    const isCapped = max !== null && rawPts > max;
    const finalPts = isCapped ? max : rawPts;
    return {
      level: lvl,
      range: `$${fromUsd.toLocaleString()} – $${toUsd.toLocaleString()}`,
      points: finalPts,
      isCapped,
    };
  });
});

const previewBonusResult = computed(() => {
  const base = Number(form.deposit_bonus_base_points || 0);
  const step = Number(form.deposit_bonus_band_usd || 0);
  const deposit = Number(previewDepositAmount.value || 0);
  const max =
    form.deposit_bonus_max_points !== null &&
    form.deposit_bonus_max_points !== "" &&
    form.deposit_bonus_max_points !== undefined
      ? Number(form.deposit_bonus_max_points)
      : null;

  if (base <= 0 || step <= 0 || deposit <= 0) {
    return {
      points: 0,
      levelLabel: "No deposit",
      description: "Enter positive base points, bracket size, and deposit amount.",
    };
  }

  const levelNum = Math.ceil(deposit / step);
  const rawPoints = base * levelNum;
  const isCapped = max !== null && rawPoints > max;
  const finalPoints = isCapped ? max : rawPoints;

  const fromUsd = ((levelNum - 1) * step).toFixed(2);
  const toUsd = (levelNum * step).toFixed(2);

  let desc = `Deposit $${deposit} falls into Level #${levelNum} ($${fromUsd}–$${toUsd}) = ${levelNum} × ${base} pts = ${rawPoints} pts.`;
  if (isCapped) {
    desc += ` Capped at maximum ${max} pts.`;
  }
  return {
    points: finalPoints,
    levelLabel: `Level #${levelNum}`,
    description: desc,
  };
});

const depositBonusErrors = computed(() => {
  const errors = { base: "", band: "", max: "", hasError: false };
  if (!form.deposit_bonus_enabled) return errors;

  const base = Number(form.deposit_bonus_base_points);
  const step = Number(form.deposit_bonus_band_usd);

  if (form.deposit_bonus_base_points === "" || isNaN(base) || base <= 0) {
    errors.base = "Points per bracket must be > 0";
    errors.hasError = true;
  }
  if (form.deposit_bonus_band_usd === "" || isNaN(step) || step <= 0) {
    errors.band = "Bracket size (USD) must be > 0";
    errors.hasError = true;
  }

  if (
    form.deposit_bonus_max_points !== null &&
    form.deposit_bonus_max_points !== "" &&
    form.deposit_bonus_max_points !== undefined
  ) {
    const max = Number(form.deposit_bonus_max_points);
    if (isNaN(max) || max < 0) {
      errors.max = "Max points cannot be negative";
      errors.hasError = true;
    } else if (base > 0 && max < base) {
      errors.max = "Max points must be ≥ points per bracket";
      errors.hasError = true;
    }
  }

  return errors;
});

const handleSubmit = async () => {
  if (!props.program?.id) return;

  if (form.deposit_bonus_enabled && depositBonusErrors.value.hasError) {
    snackbar.show(
      depositBonusErrors.value.base ||
        depositBonusErrors.value.band ||
        depositBonusErrors.value.max ||
        "Please fix deposit bonus configuration errors",
      "error",
    );
    return;
  }

  const p = props.program;
  const payload = {};

  // Formatted categories array
  const categories = excludedCategoriesText.value
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  const groupCodes = allowedGroupCodesText.value
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  const formattedGroupCodes = groupCodes.length > 0 ? groupCodes : null;

  // Formatted instrument rules
  const formattedInstrumentRules = form.instrument_rules.rules.map((r) => ({
    symbols: r.symbolsText.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
    match: r.match,
    base_points_per_lot: Number(r.base_points_per_lot),
    eligible: Boolean(r.eligible),
  }));

  // Compare each field against initial program values
  const newCode = form.code.trim().toUpperCase();
  if (newCode !== (p.code || "")) payload.code = newCode;

  const newName = form.name.trim();
  if (newName !== (p.name || "")) payload.name = newName;

  const newDesc = form.description ? form.description.trim() : null;
  const oldDesc = p.description ? p.description.trim() : null;
  if (newDesc !== oldDesc) payload.description = newDesc;

  if (form.status !== p.status) payload.status = form.status;
  if (form.account_scope !== p.account_scope) payload.account_scope = form.account_scope;

  const newStart = form.start_at || null;
  const oldStart = p.start_at || null;
  if (newStart !== oldStart) payload.start_at = newStart;

  const newEnd = form.end_at || null;
  const oldEnd = p.end_at || null;
  if (newEnd !== oldEnd) payload.end_at = newEnd;

  if (Number(form.base_points_per_lot) !== Number(p.base_points_per_lot)) {
    payload.base_points_per_lot = Number(form.base_points_per_lot);
  }
  if (Number(form.min_redemption_points) !== Number(p.min_redemption_points)) {
    payload.min_redemption_points = Number(form.min_redemption_points);
  }
  if (Number(form.min_trade_duration_seconds) !== Number(p.min_trade_duration_seconds)) {
    payload.min_trade_duration_seconds = Number(form.min_trade_duration_seconds);
  }
  if (Number(form.point_validity_days) !== Number(p.point_validity_days)) {
    payload.point_validity_days = Number(form.point_validity_days);
  }
  if (Number(form.tier_window_days) !== Number(p.tier_window_days)) {
    payload.tier_window_days = Number(form.tier_window_days);
  }
  if (Number(form.dormant_days) !== Number(p.dormant_days)) {
    payload.dormant_days = Number(form.dormant_days);
  }
  if (Number(form.grace_period_days) !== Number(p.grace_period_days)) {
    payload.grace_period_days = Number(form.grace_period_days);
  }
  if (form.terms_version !== (p.terms_version || "1.0")) {
    payload.terms_version = form.terms_version;
  }
  if (Boolean(form.carry_over_enrollments) !== Boolean(p.carry_over_enrollments)) {
    payload.carry_over_enrollments = Boolean(form.carry_over_enrollments);
  }
  if (Boolean(form.allow_general_wallet_transfer) !== Boolean(p.allow_general_wallet_transfer)) {
    payload.allow_general_wallet_transfer = Boolean(form.allow_general_wallet_transfer);
  }

  // Deposit bonus diff
  if (Boolean(form.deposit_bonus_enabled) !== Boolean(p.deposit_bonus_enabled)) {
    payload.deposit_bonus_enabled = Boolean(form.deposit_bonus_enabled);
  }
  if (form.deposit_bonus_enabled) {
    if (
      Boolean(form.deposit_bonus_enabled) !== Boolean(p.deposit_bonus_enabled) ||
      Number(form.deposit_bonus_base_points) !== Number(p.deposit_bonus_base_points || 0)
    ) {
      payload.deposit_bonus_base_points = Number(form.deposit_bonus_base_points);
    }
    if (
      Boolean(form.deposit_bonus_enabled) !== Boolean(p.deposit_bonus_enabled) ||
      Number(form.deposit_bonus_band_usd) !== Number(p.deposit_bonus_band_usd || 0)
    ) {
      payload.deposit_bonus_band_usd = Number(form.deposit_bonus_band_usd);
    }
    const currentMax =
      form.deposit_bonus_max_points !== null &&
      form.deposit_bonus_max_points !== "" &&
      form.deposit_bonus_max_points !== undefined
        ? Number(form.deposit_bonus_max_points)
        : null;
    const prevMax =
      p.deposit_bonus_max_points !== null &&
      p.deposit_bonus_max_points !== undefined &&
      p.deposit_bonus_max_points !== ""
        ? Number(p.deposit_bonus_max_points)
        : null;
    if (
      Boolean(form.deposit_bonus_enabled) !== Boolean(p.deposit_bonus_enabled) ||
      currentMax !== prevMax
    ) {
      payload.deposit_bonus_max_points = currentMax;
    }
  }

  // Check Eligibility Rules diff
  const newEligibility = {
    ...form.eligibility_rules,
    exclude_account_categories: categories,
    allowed_group_codes: formattedGroupCodes,
  };
  const oldEligibility = p.eligibility_rules || p.eligibility || {};
  const isEligibilityChanged =
    Boolean(newEligibility.require_kyc) !== Boolean(oldEligibility.require_kyc) ||
    Boolean(newEligibility.require_live) !== Boolean(oldEligibility.require_live !== false) ||
    Boolean(newEligibility.exclude_copy_accounts) !== Boolean(oldEligibility.exclude_copy_accounts) ||
    Boolean(newEligibility.earn_on_copy_fills) !== Boolean(oldEligibility.earn_on_copy_fills !== false) ||
    JSON.stringify(categories) !== JSON.stringify(oldEligibility.exclude_account_categories || []) ||
    JSON.stringify(formattedGroupCodes) !== JSON.stringify(oldEligibility.allowed_group_codes || null);

  if (isEligibilityChanged) {
    payload.eligibility_rules = newEligibility;
  }

  // Check Instrument Rules diff
  const newNormalize = Boolean(form.instrument_rules.normalize_suffixes);
  const oldNormalize = Boolean(p.instrument_rules?.normalize_suffixes);
  const oldRules = p.instrument_rules?.rules || [];
  const isInstrumentChanged =
    newNormalize !== oldNormalize ||
    JSON.stringify(formattedInstrumentRules) !== JSON.stringify(
      oldRules.map((r) => ({
        symbols: (r.symbols || []).map((s) => s.toUpperCase()),
        match: r.match || "exact",
        base_points_per_lot: Number(r.base_points_per_lot),
        eligible: r.eligible !== undefined ? Boolean(r.eligible) : true,
      }))
    );

  if (isInstrumentChanged) {
    payload.instrument_rules = {
      normalize_suffixes: newNormalize,
      rules: formattedInstrumentRules,
    };
  }

  // Check Images diff (max 4)
  const validImages = imageUrlsList.value
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter((u) => u.length > 0)
    .slice(0, 4);

  const oldImages = Array.isArray(p.image_urls)
    ? p.image_urls
    : (p.image_url ? [p.image_url] : []);

  if (JSON.stringify(validImages) !== JSON.stringify(oldImages)) {
    payload.image_urls = validImages;
    payload.image_url = validImages.length > 0 ? validImages[0] : null;
  }

  // If no fields were modified, close without making a redundant request
  if (Object.keys(payload).length === 0) {
    emit("close");
    return;
  }

  await store.updateProgram(props.program.id, payload);
  emit("saved");
  emit("close");
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
