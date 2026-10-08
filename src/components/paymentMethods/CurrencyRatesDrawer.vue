<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="handleClose"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div
          class="px-6 py-4.5 border-b border-primary-border bg-card-background/90 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-10"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs"
            >
              <Coins class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-primary-text">
                  Currency Exchange Rates
                </h3>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20"
                >
                  Base: USD ($)
                </span>
              </div>
              <p class="text-[11px] text-secondary-text mt-0.5">
                Manage fiat conversion rates relative to USD (1 USD = X Units)
              </p>
            </div>
          </div>

          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            title="Close Drawer"
            @click="handleClose"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <!-- ════════════════════════════════════════════════════════════════════════════ -->
          <!-- MODE 1: LIST VIEW -->
          <!-- ════════════════════════════════════════════════════════════════════════════ -->
          <template v-if="mode === 'list'">
            <!-- Top Summary / Stats Banner -->
            <div
              class="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-background border border-primary-border/70 text-xs"
            >
              <div
                class="flex flex-col items-center justify-center p-2 rounded-lg bg-card-background border border-primary-border/40 text-center"
              >
                <span
                  class="text-[10px] uppercase font-semibold text-secondary-text tracking-wider"
                  >Total Rates</span
                >
                <span class="text-base font-bold text-primary-text mt-0.5">{{
                  currencyStore.records.length
                }}</span>
              </div>
              <div
                class="flex flex-col items-center justify-center p-2 rounded-lg bg-card-background border border-primary-border/40 text-center"
              >
                <span
                  class="text-[10px] uppercase font-semibold text-primary-green tracking-wider"
                  >Active</span
                >
                <span class="text-base font-bold text-primary-green mt-0.5">{{
                  activeRatesCount
                }}</span>
              </div>
              <div
                class="flex flex-col items-center justify-center p-2 rounded-lg bg-card-background border border-primary-border/40 text-center"
              >
                <span
                  class="text-[10px] uppercase font-semibold text-secondary-text tracking-wider"
                  >Inactive</span
                >
                <span class="text-base font-bold text-secondary-text mt-0.5">{{
                  inactiveRatesCount
                }}</span>
              </div>
            </div>

            <!-- Quick Rate Calculator Toggle Bar -->
            <div
              class="rounded-xl border border-primary-border/60 bg-background/50 overflow-hidden transition-all"
            >
              <button
                class="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-primary-text hover:bg-background transition cursor-pointer"
                @click="showCalculator = !showCalculator"
              >
                <div class="flex items-center gap-2">
                  <ArrowRightLeft class="w-3.5 h-3.5 text-primary" />
                  <span class="font-semibold text-xs"
                    >Quick Rate Converter</span
                  >
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono"
                    >Test Conversions</span
                  >
                </div>
                <span
                  class="text-[11px] text-primary font-medium hover:underline"
                >
                  {{ showCalculator ? "Hide Converter" : "Open Converter" }}
                </span>
              </button>

              <!-- Calculator Box -->
              <div
                v-if="showCalculator"
                class="p-3.5 pt-1 border-t border-primary-border/40 space-y-3 bg-card-background/60"
              >
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      class="block text-[10px] font-semibold uppercase text-secondary-text mb-1"
                    >
                      USD Amount ($)
                    </label>
                    <div class="relative">
                      <span
                        class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary-text"
                        >$</span
                      >
                      <input
                        v-model.number="calcUsdAmount"
                        type="number"
                        min="0"
                        step="any"
                        placeholder="100"
                        class="w-full pl-6 pr-2.5 py-1.5 bg-background border border-primary-border rounded-lg text-xs font-mono font-medium text-primary-text outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-[10px] font-semibold uppercase text-secondary-text mb-1"
                    >
                      Target Currency
                    </label>
                    <BaseSelect
                      v-model="calcTargetCurrency"
                      :options="currencySelectOptions"
                      placeholder="Select currency..."
                      variant="surface"
                      searchable
                    />
                  </div>
                </div>

                <!-- Calculator Result Card -->
                <div
                  v-if="calculatorResult"
                  class="p-2.5 rounded-lg bg-primary/5 border border-primary/15 flex items-center justify-between text-xs"
                >
                  <div class="space-y-0.5">
                    <p class="text-[10px] text-secondary-text">
                      Converted Value:
                    </p>
                    <p class="font-bold text-sm text-primary">
                      {{ formatNumber(calcUsdAmount || 0) }} USD =
                      {{ formatNumber(calculatorResult.convertedAmount) }}
                      {{ calcTargetCurrency }}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] font-mono text-secondary-text">
                      Deposit Rate: 1 USD =
                      {{ formatNumber(calculatorResult.depositUnits) }}
                      {{ calcTargetCurrency }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Controls: Search, Tabs & Add Action -->
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <!-- Search Input -->
              <div class="relative flex-1 min-w-[160px]">
                <Search
                  class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
                />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search currency, code or notes..."
                  class="w-full pl-8 pr-7 py-1.5 bg-background border border-primary-border rounded-lg text-xs text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition-all"
                />
                <button
                  v-if="searchQuery"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
                  @click="searchQuery = ''"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>

              <!-- Filter Tabs -->
              <div
                class="flex items-center p-0.5 bg-background border border-primary-border rounded-lg text-[11px] shrink-0"
              >
                <button
                  v-for="tab in filterTabs"
                  :key="tab.value"
                  class="px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer select-none"
                  :class="
                    activeTab === tab.value
                      ? 'bg-card-background text-primary font-semibold shadow-2xs border border-primary-border/60'
                      : 'text-secondary-text hover:text-primary-text'
                  "
                  @click="activeTab = tab.value"
                >
                  {{ tab.label }}
                  <span class="text-[9px] opacity-70 ml-0.5"
                    >({{ tab.count }})</span
                  >
                </button>
              </div>

              <!-- Add Rate CTA -->
              <button
                v-if="hasPermission('payment_methods.create')"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                @click="openCreateForm"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add Currency</span>
              </button>
            </div>

            <!-- Rates List -->
            <!-- Loading Skeletons -->
            <div v-if="currencyStore.loading" class="space-y-2.5 pt-1">
              <div
                v-for="n in 3"
                :key="n"
                class="bg-background border border-primary-border rounded-xl p-4 animate-pulse space-y-3"
              >
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-card-background rounded-xl" />
                    <div class="space-y-1.5">
                      <div class="h-3.5 w-28 bg-card-background rounded" />
                      <div class="h-2.5 w-16 bg-card-background rounded" />
                    </div>
                  </div>
                  <div class="h-5 w-14 bg-card-background rounded-full" />
                </div>
                <div class="h-10 bg-card-background/60 rounded-lg" />
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="filteredRecords.length === 0"
              class="py-12 text-center bg-background/40 border border-dashed border-primary-border rounded-xl p-6 space-y-3"
            >
              <div
                class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary"
              >
                <Coins class="w-6 h-6" />
              </div>
              <div>
                <p class="text-xs font-bold text-primary-text">
                  No currency rates found
                </p>
                <p
                  class="text-[11px] text-secondary-text max-w-xs mx-auto mt-0.5"
                >
                  {{
                    searchQuery
                      ? "No rates match your search query."
                      : "Add your first currency exchange rate relative to USD."
                  }}
                </p>
              </div>
              <button
                v-if="hasPermission('payment_methods.create') && !searchQuery"
                class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition cursor-pointer shadow-xs"
                @click="openCreateForm"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add Currency Rate</span>
              </button>
              <button
                v-else-if="searchQuery"
                class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-background border border-primary-border text-xs text-secondary-text hover:text-primary-text transition cursor-pointer"
                @click="searchQuery = ''"
              >
                <span>Clear Search</span>
              </button>
            </div>

            <!-- Currency Rate Cards -->
            <div v-else class="space-y-3 pt-1">
              <div
                v-for="rate in filteredRecords"
                :key="rate.id"
                class="rounded-xl p-4 bg-background border border-primary-border hover:border-primary/40 transition-all duration-200 group relative shadow-2xs"
              >
                <!-- Top Row: Currency Badge, Label, Status, Quick Actions -->
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <!-- Flag / Symbol Avatar -->
                    <div
                      class="w-11 h-11 rounded-xl bg-card-background border border-primary-border flex flex-col items-center justify-center shrink-0 shadow-2xs"
                    >
                      <span class="text-sm leading-none">{{
                        getCurrencyFlag(rate.currency)
                      }}</span>
                      <span
                        class="text-[10px] font-mono font-bold text-primary mt-0.5 leading-none"
                        >{{ rate.currency }}</span
                      >
                    </div>

                    <!-- Title & Details -->
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span
                          class="text-xs font-bold text-primary-text truncate"
                        >
                          {{ rate.label || getCurrencyName(rate.currency) }}
                        </span>

                        <!-- Status Pill -->
                        <span
                          class="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                          :class="
                            rate.is_active
                              ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                              : 'bg-secondary-text/10 text-secondary-text border-primary-border'
                          "
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            :class="
                              rate.is_active
                                ? 'bg-primary-green animate-pulse'
                                : 'bg-secondary-text'
                            "
                          />
                          {{ rate.is_active ? "Active" : "Inactive" }}
                        </span>
                      </div>

                      <p
                        class="text-[10px] font-mono text-secondary-text mt-0.5"
                      >
                        ISO:
                        <span class="font-semibold text-primary-text">{{
                          rate.currency
                        }}</span>
                        <span
                          v-if="getCurrencySymbol(rate.currency)"
                          class="ml-1 opacity-70"
                        >
                          ({{ getCurrencySymbol(rate.currency) }})
                        </span>
                      </p>
                    </div>
                  </div>

                  <!-- Quick Action Buttons -->
                  <div class="flex items-center gap-1.5 shrink-0">
                    <!-- Active Switch / Toggle -->
                    <button
                      v-if="hasPermission('payment_methods.update')"
                      type="button"
                      :disabled="currencyStore.togglingId === rate.id"
                      class="relative w-9 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
                      :class="
                        rate.is_active
                          ? 'bg-primary-green'
                          : 'bg-primary-border'
                      "
                      :title="
                        rate.is_active
                          ? 'Click to deactivate'
                          : 'Click to activate'
                      "
                      @click="handleToggleActive(rate)"
                    >
                      <span
                        v-if="currencyStore.togglingId !== rate.id"
                        class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs"
                        :class="
                          rate.is_active ? 'translate-x-4' : 'translate-x-0'
                        "
                      />
                      <Loader2
                        v-else
                        class="absolute inset-0 m-auto w-3 h-3 text-white animate-spin"
                      />
                    </button>

                    <!-- Edit Button -->
                    <button
                      v-if="hasPermission('payment_methods.update')"
                      class="w-7 h-7 flex items-center justify-center rounded-lg bg-card-background border border-primary-border hover:border-primary/40 text-secondary-text hover:text-primary transition cursor-pointer shadow-2xs"
                      title="Edit Currency Rate"
                      @click="openEditForm(rate)"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>

                    <!-- Delete Button -->
                    <button
                      v-if="hasPermission('payment_methods.delete')"
                      class="w-7 h-7 flex items-center justify-center rounded-lg bg-card-background border border-primary-border hover:border-primary-red/40 text-secondary-text hover:text-primary-red transition cursor-pointer shadow-2xs disabled:opacity-50"
                      :disabled="currencyStore.deletingId === rate.id"
                      title="Delete Currency Rate"
                      @click="confirmDelete(rate)"
                    >
                      <Loader2
                        v-if="currencyStore.deletingId === rate.id"
                        class="w-3.5 h-3.5 animate-spin text-primary-red"
                      />
                      <Trash2 v-else class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- Middle Exchange Rate Banner -->
                <div
                  class="mt-3 p-3 rounded-lg bg-card-background border border-primary-border/60 grid grid-cols-2 gap-4"
                >
                  <!-- Deposit Rate -->
                  <div class="space-y-0.5">
                    <span
                      class="text-[9px] uppercase font-semibold text-secondary-text tracking-wider"
                      >Deposit Rate</span
                    >
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-primary font-mono">
                        1 USD = {{ formatNumber(rate.deposit_units_per_usd || rate.units_per_usd) }}
                        {{ rate.currency }}
                      </span>
                      <span class="text-[10px] font-mono text-secondary-text">
                        1 {{ rate.currency }} = ${{ formatInverseRate(rate.deposit_units_per_usd || rate.units_per_usd) }} USD
                      </span>
                    </div>
                  </div>

                  <!-- Withdrawal Rate -->
                  <div class="space-y-0.5 text-right">
                    <span
                      class="text-[9px] uppercase font-semibold text-secondary-text tracking-wider"
                      >Withdrawal Rate</span
                    >
                    <div class="flex flex-col items-end">
                      <span class="text-sm font-bold text-primary-text font-mono">
                        1 USD = {{ formatNumber(rate.withdrawal_units_per_usd || rate.units_per_usd) }}
                        {{ rate.currency }}
                      </span>
                      <span class="text-[10px] font-mono text-secondary-text">
                        1 {{ rate.currency }} = ${{ formatInverseRate(rate.withdrawal_units_per_usd || rate.units_per_usd) }} USD
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Description / Admin Notes (if present) -->
                <div
                  v-if="rate.description"
                  class="mt-2.5 flex items-start gap-1.5 text-[11px] text-secondary-text/90"
                >
                  <Info
                    class="w-3.5 h-3.5 shrink-0 mt-0.5 text-secondary-text/60"
                  />
                  <p class="line-clamp-2 leading-relaxed">
                    {{ rate.description }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <!-- ════════════════════════════════════════════════════════════════════════════ -->
          <!-- MODE 2: CREATE / EDIT FORM VIEW -->
          <!-- ════════════════════════════════════════════════════════════════════════════ -->
          <template v-else-if="mode === 'create' || mode === 'edit'">
            <div class="space-y-4">
              <!-- Form Header & Back Button -->
              <div
                class="flex items-center justify-between pb-3 border-b border-primary-border"
              >
                <button
                  class="flex items-center gap-1.5 text-xs font-semibold text-secondary-text hover:text-primary-text transition cursor-pointer"
                  @click="mode = 'list'"
                >
                  <ArrowLeft class="w-3.5 h-3.5" />
                  <span>Back to Rates</span>
                </button>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-primary">
                    {{
                      mode === "create"
                        ? "Add New Currency Rate"
                        : `Edit ${formData.currency} Rate`
                    }}
                  </span>
                  <span
                    v-if="formData.currency"
                    class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary"
                  >
                    {{ formData.currency }}
                  </span>
                </div>
              </div>

              <!-- Quick Currency Presets (in create mode) -->
              <div
                v-if="mode === 'create'"
                class="p-3 rounded-xl bg-background border border-primary-border/70 space-y-2"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-[10px] uppercase font-semibold text-secondary-text tracking-wider"
                  >
                    Quick Presets
                  </span>
                  <span class="text-[10px] text-secondary-text"
                    >Click to autofill</span
                  >
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="preset in popularCurrencies"
                    :key="preset.code"
                    type="button"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer flex items-center gap-1"
                    :class="
                      formData.currency === preset.code
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card-background border-primary-border text-primary-text hover:border-primary/40'
                    "
                    @click="applyPreset(preset)"
                  >
                    <span>{{ preset.flag }}</span>
                    <span class="font-bold font-mono">{{ preset.code }}</span>
                  </button>
                </div>
              </div>

              <!-- Form Inputs -->
              <div class="space-y-4">
                <!-- Currency ISO Code -->
                <div>
                  <label
                    class="block text-xs font-semibold text-primary-text mb-1"
                  >
                    Currency ISO Code <span class="text-primary-red">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="formData.currency"
                      type="text"
                      maxlength="5"
                      placeholder="e.g. INR, PKR, EUR, AED"
                      class="w-full px-3 py-2 rounded-lg bg-background border text-xs font-mono font-bold uppercase text-primary-text outline-none focus:border-primary transition"
                      :class="
                        formErrors.currency
                          ? 'border-primary-red'
                          : 'border-primary-border'
                      "
                      @input="handleCurrencyInput"
                    />
                    <div
                      v-if="formData.currency"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                    >
                      {{ getCurrencyFlag(formData.currency) }}
                    </div>
                  </div>
                  <p
                    v-if="formErrors.currency"
                    class="text-[10px] text-primary-red mt-1"
                  >
                    {{ formErrors.currency }}
                  </p>
                  <p v-else class="text-[10px] text-secondary-text mt-1">
                    Standard 3-letter currency code (e.g. INR, PKR, AED, EUR,
                    USD).
                  </p>
                </div>

                <!-- Display Label -->
                <div>
                  <label
                    class="block text-xs font-semibold text-primary-text mb-1"
                  >
                    Currency Display Label
                  </label>
                  <input
                    v-model="formData.label"
                    type="text"
                    placeholder="e.g. Indian Rupee, Pakistani Rupee, UAE Dirham"
                    class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary transition"
                  />
                  <p class="text-[10px] text-secondary-text mt-1">
                    Human-readable name shown to clients & administrators.
                  </p>
                </div>

                <!-- Deposit Units Per USD -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="text-xs font-semibold text-primary-text">
                        Deposit Rate
                        <span class="text-primary-red">*</span>
                      </label>
                    </div>

                    <div class="relative">
                      <input
                        v-model.number="formData.deposit_units_per_usd"
                        type="number"
                        step="any"
                        min="0.00000001"
                        placeholder="e.g. 100.0"
                        class="w-full px-3 py-2 rounded-lg bg-background border text-xs font-mono font-bold text-primary-text outline-none focus:border-primary transition"
                        :class="
                          formErrors.deposit_units_per_usd
                            ? 'border-primary-red'
                            : 'border-primary-border'
                        "
                      />
                    </div>
                    <p class="text-[10px] text-secondary-text mt-1 font-mono">
                      1 USD = {{ formData.deposit_units_per_usd || "?" }} {{ formData.currency || "Units" }} (deposit)
                    </p>
                    <p
                      v-if="formErrors.deposit_units_per_usd"
                      class="text-[10px] text-primary-red mt-1"
                    >
                      {{ formErrors.deposit_units_per_usd }}
                    </p>
                  </div>

                  <!-- Withdrawal Units Per USD -->
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="text-xs font-semibold text-primary-text">
                        Withdrawal Rate
                      </label>
                    </div>

                    <div class="relative">
                      <input
                        v-model.number="formData.withdrawal_units_per_usd"
                        type="number"
                        step="any"
                        min="0.00000001"
                        placeholder="Optional, e.g. 105.0"
                        class="w-full px-3 py-2 rounded-lg bg-background border text-xs font-mono font-bold text-primary-text outline-none focus:border-primary transition"
                        :class="
                          formErrors.withdrawal_units_per_usd
                            ? 'border-primary-red'
                            : 'border-primary-border'
                        "
                      />
                    </div>
                    <p class="text-[10px] text-secondary-text mt-1 font-mono">
                      1 USD = {{ formData.withdrawal_units_per_usd || formData.deposit_units_per_usd || "?" }} {{ formData.currency || "Units" }} (withdrawal)
                    </p>
                    <p
                      v-if="formErrors.withdrawal_units_per_usd"
                      class="text-[10px] text-primary-red mt-1"
                    >
                      {{ formErrors.withdrawal_units_per_usd }}
                    </p>
                  </div>
                </div>

                <!-- Live Rate Visualizer & Conversion Preview -->
                <div
                  v-if="ratePreview.isValid"
                  class="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2"
                >
                  <div
                    class="flex items-center gap-1.5 text-xs font-bold text-primary"
                  >
                    <Sparkles class="w-3.5 h-3.5" />
                    <span>Live Rate Calculation Preview (Deposit)</span>
                  </div>

                  <div
                    class="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-primary/10"
                  >
                    <div
                      class="p-2 rounded-lg bg-card-background border border-primary-border/60"
                    >
                      <span
                        class="text-[9px] uppercase text-secondary-text block"
                        >Base Rate:</span
                      >
                      <span class="font-bold text-primary-text">
                        1 USD = {{ ratePreview.unitsFormatted }}
                        {{ formData.currency }}
                      </span>
                    </div>
                    <div
                      class="p-2 rounded-lg bg-card-background border border-primary-border/60"
                    >
                      <span
                        class="text-[9px] uppercase text-secondary-text block"
                        >USD Inverted Value:</span
                      >
                      <span class="font-bold text-primary-text">
                        1 {{ formData.currency }} = ${{
                          ratePreview.rateUsdFormatted
                        }}
                        USD
                      </span>
                    </div>
                  </div>

                  <!-- Example Conversion Breakdown -->
                  <div
                    class="p-2 rounded-lg bg-card-background/70 border border-primary-border/40 text-[10px] text-secondary-text space-y-1"
                  >
                    <p>
                      • $100.00 USD Deposit =
                      <strong class="text-primary font-mono"
                        >{{ ratePreview.example100Usd }}
                        {{ formData.currency }}</strong
                      >
                    </p>
                    <p>
                      • 1,000 {{ formData.currency }} (Deposit) =
                      <strong class="text-primary font-mono"
                        >${{ ratePreview.example1000Local }} USD</strong
                      >
                    </p>
                  </div>
                </div>

                <!-- Description / Notes -->
                <div>
                  <label
                    class="block text-xs font-semibold text-primary-text mb-1"
                  >
                    Description / Usage Notes
                  </label>
                  <textarea
                    v-model="formData.description"
                    rows="2"
                    placeholder="e.g. UPI deposits convert to USD at this rate"
                    class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary transition resize-none"
                  />
                  <p class="text-[10px] text-secondary-text mt-1">
                    Internal notes explaining which gateways or deposit flows
                    use this rate.
                  </p>
                </div>

                <!-- Active Status Toggle -->
                <div
                  class="flex items-center justify-between p-3 rounded-xl bg-background border border-primary-border"
                >
                  <div>
                    <p class="text-xs font-semibold text-primary-text">
                      Active Status
                    </p>
                    <p class="text-[10px] text-secondary-text">
                      Enable or disable exchange calculations for this currency
                    </p>
                  </div>
                  <button
                    type="button"
                    class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer"
                    :class="
                      formData.is_active
                        ? 'bg-primary-green'
                        : 'bg-primary-border'
                    "
                    @click="formData.is_active = !formData.is_active"
                  >
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-xs"
                      :class="
                        formData.is_active ? 'translate-x-5' : 'translate-x-0'
                      "
                    />
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div
          class="px-6 py-4 border-t border-primary-border bg-card-background flex items-center justify-end gap-3 shrink-0"
        >
          <template v-if="mode === 'list'">
            <button
              class="w-full px-4 py-2 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition cursor-pointer"
              @click="handleClose"
            >
              Close
            </button>
          </template>

          <template v-else>
            <button
              class="px-4 py-2 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition cursor-pointer"
              :disabled="currencyStore.submitting"
              @click="mode = 'list'"
            >
              Cancel
            </button>

            <button
              class="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
              :disabled="currencyStore.submitting"
              @click="handleSubmit"
            >
              <Loader2
                v-if="currencyStore.submitting"
                class="w-3.5 h-3.5 animate-spin"
              />
              <span>{{
                currencyStore.submitting
                  ? "Saving..."
                  : mode === "create"
                    ? "Create Currency Rate"
                    : "Save Changes"
              }}</span>
            </button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="backdrop">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        @click.self="showDeleteModal = false"
      >
        <div
          class="w-full max-w-sm bg-card-background border border-primary-border rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary-red/10 border border-primary-red/20 flex items-center justify-center text-primary-red shrink-0"
            >
              <Trash2 class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-primary-text">
                Delete Currency Rate
              </h4>
              <p class="text-xs text-secondary-text mt-0.5">
                Are you sure you want to delete
                <strong class="text-primary-text">{{
                  rateToDelete?.currency
                }}</strong
                >?
              </p>
            </div>
          </div>

          <div
            class="p-3 rounded-lg bg-background border border-primary-border/60 text-xs font-mono space-y-1"
          >
            <div class="flex justify-between">
              <span class="text-secondary-text">Currency:</span>
              <span class="font-bold text-primary-text"
                >{{ rateToDelete?.currency }} ({{
                  rateToDelete?.label || "—"
                }})</span
              >
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex justify-between">
                <span class="text-secondary-text">Deposit Rate:</span>
                <span class="text-primary font-bold"
                  >1 USD = {{ rateToDelete?.deposit_units_per_usd || rateToDelete?.units_per_usd }}
                  {{ rateToDelete?.currency }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-text">Withdrawal Rate:</span>
                <span class="text-primary font-bold"
                  >1 USD = {{ rateToDelete?.withdrawal_units_per_usd || rateToDelete?.units_per_usd }}
                  {{ rateToDelete?.currency }}</span
                >
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background transition cursor-pointer"
              :disabled="currencyStore.deletingId !== null"
              @click="showDeleteModal = false"
            >
              Cancel
            </button>
            <button
              class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-red hover:bg-primary-red/90 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-60"
              :disabled="currencyStore.deletingId !== null"
              @click="executeDelete"
            >
              <Loader2
                v-if="currencyStore.deletingId !== null"
                class="w-3.5 h-3.5 animate-spin"
              />
              <span>{{
                currencyStore.deletingId !== null
                  ? "Deleting..."
                  : "Confirm Delete"
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Loader2,
  Coins,
  ArrowRightLeft,
  Clock,
  User,
  Info,
  Sparkles,
} from "lucide-vue-next";
import { useCurrencyRatesStore } from "@/stores/paymentMethods/currencyRates";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

const currencyStore = useCurrencyRatesStore();
const { hasPermission } = usePermissionCheck();

// ── State ──
const mode = ref("list"); // 'list' | 'create' | 'edit'
const searchQuery = ref("");
const activeTab = ref("all"); // 'all' | 'active' | 'inactive'
const editingId = ref(null);

// ── Rate Calculator State ──
const showCalculator = ref(false);
const calcUsdAmount = ref(100);
const calcTargetCurrency = ref("INR");

// ── Delete Modal State ──
const showDeleteModal = ref(false);
const rateToDelete = ref(null);

// ── Form State ──
const formData = ref({
  currency: "",
  deposit_units_per_usd: null,
  withdrawal_units_per_usd: null,
  label: "",
  description: "",
  is_active: true,
});

const formErrors = ref({});

// ── Popular Currency Presets ──
const popularCurrencies = [
  { code: "INR", label: "Indian Rupee", flag: "🇮🇳", defaultUnits: 87.0 },
  { code: "PKR", label: "Pakistani Rupee", flag: "🇵🇰", defaultUnits: 278.0 },
  { code: "AED", label: "UAE Dirham", flag: "🇦🇪", defaultUnits: 3.67 },
  { code: "EUR", label: "Euro", flag: "🇪🇺", defaultUnits: 0.92 },
  { code: "GBP", label: "British Pound", flag: "🇬🇧", defaultUnits: 0.79 },
  { code: "SAR", label: "Saudi Riyal", flag: "🇸🇦", defaultUnits: 3.75 },
  { code: "TRY", label: "Turkish Lira", flag: "🇹🇷", defaultUnits: 34.0 },
  { code: "BDT", label: "Bangladeshi Taka", flag: "🇧🇩", defaultUnits: 120.0 },
  { code: "NGN", label: "Nigerian Naira", flag: "🇳🇬", defaultUnits: 1550.0 },
  { code: "USD", label: "US Dollar", flag: "🇺🇸", defaultUnits: 1.0 },
];

// ── Currency Metadata Dictionary ──
const currencyMeta = {
  USD: { flag: "🇺🇸", symbol: "$", name: "US Dollar" },
  INR: { flag: "🇮🇳", symbol: "₹", name: "Indian Rupee" },
  PKR: { flag: "🇵🇰", symbol: "₨", name: "Pakistani Rupee" },
  AED: { flag: "🇦🇪", symbol: "د.إ", name: "UAE Dirham" },
  EUR: { flag: "🇪🇺", symbol: "€", name: "Euro" },
  GBP: { flag: "🇬🇧", symbol: "£", name: "British Pound" },
  SAR: { flag: "🇸🇦", symbol: "﷼", name: "Saudi Riyal" },
  TRY: { flag: "🇹🇷", symbol: "₺", name: "Turkish Lira" },
  BDT: { flag: "🇧🇩", symbol: "৳", name: "Bangladeshi Taka" },
  NGN: { flag: "🇳🇬", symbol: "₦", name: "Nigerian Naira" },
  BRL: { flag: "🇧🇷", symbol: "R$", name: "Brazilian Real" },
  CAD: { flag: "🇨🇦", symbol: "CA$", name: "Canadian Dollar" },
  AUD: { flag: "🇦🇺", symbol: "AU$", name: "Australian Dollar" },
  JPY: { flag: "🇯🇵", symbol: "¥", name: "Japanese Yen" },
  CNY: { flag: "🇨🇳", symbol: "¥", name: "Chinese Yuan" },
  VND: { flag: "🇻🇳", symbol: "₫", name: "Vietnamese Dong" },
  THB: { flag: "🇹🇭", symbol: "฿", name: "Thai Baht" },
  IDR: { flag: "🇮🇩", symbol: "Rp", name: "Indonesian Rupiah" },
  MYR: { flag: "🇲🇾", symbol: "RM", name: "Malaysian Ringgit" },
  PHP: { flag: "🇵🇭", symbol: "₱", name: "Philippine Peso" },
  KWD: { flag: "🇰🇼", symbol: "KD", name: "Kuwaiti Dinar" },
  QAR: { flag: "🇶🇦", symbol: "QR", name: "Qatari Riyal" },
  OMR: { flag: "🇴🇲", symbol: "OMR", name: "Omani Rial" },
  BHD: { flag: "🇧🇭", symbol: "BD", name: "Bahraini Dinar" },
  EGP: { flag: "🇪🇬", symbol: "E£", name: "Egyptian Pound" },
  ZAR: { flag: "🇿🇦", symbol: "R", name: "South African Rand" },
  RUB: { flag: "🇷🇺", symbol: "₽", name: "Russian Ruble" },
};

// ── Fetch on open ──
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      mode.value = "list";
      searchQuery.value = "";
      activeTab.value = "all";
      currencyStore.fetchCurrencyRates(null, true).then((records) => {
        if (
          records?.length > 0 &&
          !records.some((r) => r.currency === calcTargetCurrency.value)
        ) {
          calcTargetCurrency.value = records[0].currency;
        }
      });
    }
  },
  { immediate: true },
);

// ── Filter Tabs Config ──
const activeRatesCount = computed(
  () => currencyStore.records.filter((r) => r.is_active).length,
);
const inactiveRatesCount = computed(
  () => currencyStore.records.filter((r) => !r.is_active).length,
);

const filterTabs = computed(() => [
  { label: "All", value: "all", count: currencyStore.records.length },
  { label: "Active", value: "active", count: activeRatesCount.value },
  { label: "Inactive", value: "inactive", count: inactiveRatesCount.value },
]);

// ── Computed Filtered Records ──
const filteredRecords = computed(() => {
  let list = currencyStore.records || [];

  if (activeTab.value === "active") {
    list = list.filter((r) => r.is_active);
  } else if (activeTab.value === "inactive") {
    list = list.filter((r) => !r.is_active);
  }

  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        (r.currency && r.currency.toLowerCase().includes(q)) ||
        (r.label && r.label.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)),
    );
  }

  return list;
});

// ── Live Rate Preview in Form ──
const ratePreview = computed(() => {
  const units = Number(formData.value.deposit_units_per_usd);
  if (!units || isNaN(units) || units <= 0) {
    return { isValid: false };
  }

  const rateUsd = 1 / units;
  const unitsFormatted = units.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
  const rateUsdFormatted = rateUsd.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
  const example100Usd = (100 * units).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const example1000Local = (1000 / units).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    isValid: true,
    unitsFormatted,
    rateUsdFormatted,
    example100Usd,
    example1000Local,
  };
});

// ── Currency Select Options for BaseSelect ──
const currencySelectOptions = computed(() => {
  return (currencyStore.records || []).map((rate) => ({
    label: `${getCurrencyFlag(rate.currency)} ${rate.currency} - ${rate.label || rate.currency} (${formatNumber(rate.deposit_units_per_usd || rate.units_per_usd)}/USD deposit)`,
    value: rate.currency,
  }));
});

// ── Calculator Computed Result ──
const calculatorResult = computed(() => {
  const targetRate = currencyStore.records.find(
    (r) => r.currency === calcTargetCurrency.value,
  );
  if (!targetRate) return null;

  const units = Number(targetRate.deposit_units_per_usd || targetRate.units_per_usd) || 1;
  const amount = Number(calcUsdAmount.value) || 0;
  const converted = amount * units;

  return {
    depositUnits: units,
    convertedAmount: converted,
  };
});

// ── Helpers for currency display ──
const getCurrencyFlag = (currency) => {
  if (!currency) return "🌐";
  const code = currency.toUpperCase();
  return currencyMeta[code]?.flag || "💱";
};

const getCurrencySymbol = (currency) => {
  if (!currency) return "";
  const code = currency.toUpperCase();
  return currencyMeta[code]?.symbol || "";
};

const getCurrencyName = (currency) => {
  if (!currency) return "";
  const code = currency.toUpperCase();
  return currencyMeta[code]?.name || currency;
};

const formatNumber = (val, decimals = 2) => {
  if (val === undefined || val === null || isNaN(Number(val))) return "0.00";
  return Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

const formatInverseRate = (unitsVal) => {
  const units = Number(unitsVal);
  if (!units || isNaN(units) || units <= 0) return "0.000000";
  const inv = 1 / units;
  return inv.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Action Handlers ──
const handleClose = () => {
  mode.value = "list";
  showDeleteModal.value = false;
  emit("close");
};

const applyPreset = (preset) => {
  formData.value.currency = preset.code;
  formData.value.label = preset.label;
  if (!formData.value.deposit_units_per_usd) {
    formData.value.deposit_units_per_usd = preset.defaultUnits;
  }
};

const handleCurrencyInput = () => {
  formData.value.currency = (formData.value.currency || "").toUpperCase();
  const code = formData.value.currency;
  if (currencyMeta[code] && !formData.value.label) {
    formData.value.label = currencyMeta[code].name;
  }
};

const openCreateForm = () => {
  mode.value = "create";
  editingId.value = null;
  formErrors.value = {};
  formData.value = {
    currency: "",
    deposit_units_per_usd: null,
    withdrawal_units_per_usd: null,
    label: "",
    description: "",
    is_active: true,
  };
};

const openEditForm = (rateRecord) => {
  mode.value = "edit";
  editingId.value = rateRecord.id;
  formErrors.value = {};
  formData.value = {
    currency: rateRecord.currency || "",
    deposit_units_per_usd: rateRecord.deposit_units_per_usd ?? rateRecord.units_per_usd ?? null,
    withdrawal_units_per_usd: rateRecord.withdrawal_units_per_usd ?? rateRecord.units_per_usd ?? null,
    label: rateRecord.label || "",
    description: rateRecord.description || "",
    is_active: rateRecord.is_active ?? true,
  };
};

const handleToggleActive = async (rate) => {
  try {
    await currencyStore.toggleCurrencyRate(rate);
  } catch (err) {
    // Handled in store
  }
};

const confirmDelete = (rate) => {
  rateToDelete.value = rate;
  showDeleteModal.value = true;
};

const executeDelete = async () => {
  if (!rateToDelete.value) return;
  try {
    await currencyStore.deleteCurrencyRate(rateToDelete.value.id);
    showDeleteModal.value = false;
    rateToDelete.value = null;
  } catch (err) {
    // Handled in store
  }
};

const validateForm = () => {
  const errors = {};

  if (!formData.value.currency || !formData.value.currency.trim()) {
    errors.currency = "Currency ISO code is required (e.g. INR)";
  } else if (
    formData.value.currency.trim().length < 2 ||
    formData.value.currency.trim().length > 5
  ) {
    errors.currency =
      "Currency code must be 2 to 5 characters (e.g. INR, USD, USDT)";
  }

  if (
    formData.value.deposit_units_per_usd === null ||
    formData.value.deposit_units_per_usd === undefined ||
    formData.value.deposit_units_per_usd === ""
  ) {
    errors.deposit_units_per_usd = "Deposit rate is required";
  } else if (Number(formData.value.deposit_units_per_usd) <= 0) {
    errors.deposit_units_per_usd = "Rate must be greater than 0";
  }

  if (
    formData.value.withdrawal_units_per_usd !== null &&
    formData.value.withdrawal_units_per_usd !== undefined &&
    formData.value.withdrawal_units_per_usd !== ""
  ) {
    if (Number(formData.value.withdrawal_units_per_usd) <= 0) {
      errors.withdrawal_units_per_usd = "Rate must be greater than 0";
    }
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload = {
    currency: formData.value.currency.trim().toUpperCase(),
    deposit_units_per_usd: Number(formData.value.deposit_units_per_usd),
    label: formData.value.label ? formData.value.label.trim() : "",
    description: formData.value.description
      ? formData.value.description.trim()
      : "",
    is_active: Boolean(formData.value.is_active),
  };

  if (formData.value.withdrawal_units_per_usd) {
    payload.withdrawal_units_per_usd = Number(formData.value.withdrawal_units_per_usd);
  }

  try {
    if (mode.value === "create") {
      await currencyStore.createCurrencyRate(payload);
    } else if (mode.value === "edit" && editingId.value) {
      await currencyStore.updateCurrencyRate(editingId.value, payload);
    }
    mode.value = "list";
  } catch (err) {
    if (err?.message) {
      const msg = err.message.toLowerCase();
      if (msg.includes("currency")) {
        formErrors.value.currency = err.message;
      } else if (msg.includes("deposit")) {
        formErrors.value.deposit_units_per_usd = err.message;
      } else if (msg.includes("withdrawal")) {
        formErrors.value.withdrawal_units_per_usd = err.message;
      } else if (msg.includes("units") || msg.includes("rate")) {
        formErrors.value.deposit_units_per_usd = err.message;
      }
    }
  }
};
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Panel slide-out-from-right transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
