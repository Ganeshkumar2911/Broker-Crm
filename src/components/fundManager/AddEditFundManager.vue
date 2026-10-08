<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="closeDialog"
      />
    </Transition>

    <!-- Slide-over Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-xl sm:max-w-2xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/60"
        >
          <div class="flex items-center gap-3">
            <div
              class="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary"
            >
              <Sliders v-if="mode === 'edit'" class="w-5 h-5" />
              <Plus v-else class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-primary-text text-base font-bold">
                {{ getTitle() }}
              </h2>
              <p class="text-secondary-text text-xs mt-0.5">
                {{
                  mode === "add"
                    ? "Create a new fund manager leaderboard account and MT5 trading setup"
                    : `Update configuration & profile for ID: #${item?.id}`
                }}
              </p>
            </div>
          </div>
          <button
            @click="closeDialog"
            class="p-2 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-all cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <div class="px-6 py-5 flex flex-col gap-6 overflow-y-auto flex-1">
          <!-- SECTION 1: GENERAL IDENTITY & AUTH -->
          <div
            class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4"
          >
            <h3
              class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary-border/60 pb-2"
            >
              <User class="w-3.5 h-3.5" />
              Fund Manager Identity & Login
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- User Full Name (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Full Name <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. John Doe"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="
                    errors.name
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span v-if="errors.name" class="text-xs text-primary-red">{{
                  errors.name
                }}</span>
              </div>

              <!-- User Email (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Email Address <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="e.g. fm@example.com"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="
                    errors.email
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span v-if="errors.email" class="text-xs text-primary-red">{{
                  errors.email
                }}</span>
              </div>

              <!-- Label Name (Optional, defaults to Name) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Label / Display Name
                  <span class="text-[11px] font-normal text-secondary-text"
                    >(defaults to Full Name)</span
                  >
                </label>
                <input
                  v-model="form.label_name"
                  type="text"
                  placeholder="e.g. Growth Alpha Strategy"
                  class="bg-background border border-primary-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                />
              </div>

              <!-- Password (Required for add, optional for edit) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Password
                  <span v-if="mode === 'add'" class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.password"
                  type="password"
                  :placeholder="
                    mode === 'add'
                      ? 'Enter Account Password'
                      : 'Leave blank to keep unchanged'
                  "
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="
                    errors.password
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span v-if="errors.password" class="text-xs text-primary-red">{{
                  errors.password
                }}</span>
              </div>

              <!-- Visibility Type -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Visibility Type</label
                >
                <BaseSelect
                  :modelValue="form.visibility_type"
                  :options="visibilityOptions"
                  placeholder="Select visibility"
                  @update:modelValue="form.visibility_type = $event"
                />
              </div>

              <!-- Follower Account Type -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Follower Account Type</label
                >
                <BaseSelect
                  :modelValue="form.follower_account_type"
                  :options="followerAccountTypeOptions"
                  placeholder="Select follower account type"
                  @update:modelValue="form.follower_account_type = Number($event)"
                />
              </div>

              <!-- Follower Account Type Action (Only when changed in Edit mode) -->
              <div
                v-if="props.mode === 'edit' && isFollowerAccountTypeChanged"
                class="flex flex-col gap-2 sm:col-span-2 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl"
              >
                <div class="flex items-center gap-1.5">
                  <AlertTriangle class="w-4 h-4 text-amber-500 shrink-0" />
                  <label class="text-xs font-bold text-primary-text"
                    >Follower Account Type Action</label
                  >
                </div>
                <p class="text-[11px] text-secondary-text leading-relaxed">
                  You changed the follower account type. Choose how to handle existing followers:
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-0.5">
                  <label
                    class="flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors"
                    :class="
                      form.follower_account_type_action === 'keep'
                        ? 'bg-primary/10 border-primary text-primary-text'
                        : 'bg-background border-primary-border text-secondary-text'
                    "
                  >
                    <input
                      type="radio"
                      value="keep"
                      v-model="form.follower_account_type_action"
                      class="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                    />
                    <div>
                      <span class="text-xs font-semibold block text-primary-text"
                        >Keep</span
                      >
                      <span class="text-[11px] block text-secondary-text"
                        >Update type only</span
                      >
                    </div>
                  </label>

                  <label
                    class="flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors"
                    :class="
                      form.follower_account_type_action === 'unfollow_and_settle'
                        ? 'bg-rose-500/10 border-rose-500 text-primary-text'
                        : 'bg-background border-primary-border text-secondary-text'
                    "
                  >
                    <input
                      type="radio"
                      value="unfollow_and_settle"
                      v-model="form.follower_account_type_action"
                      class="mt-0.5 text-rose-500 focus:ring-rose-500 h-4 w-4"
                    />
                    <div>
                      <span class="text-xs font-semibold block text-primary-text"
                        >Unfollow &amp; Settle</span
                      >
                      <span class="text-[11px] block text-secondary-text"
                        >Same client unfollow per affected account, then update type</span
                      >
                    </div>
                  </label>
                </div>
              </div>

              <!-- Account Status Switcher (Active/Inactive) -->
              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-secondary-text"
                  >Account Status</label
                >
                <div
                  class="flex items-center gap-4 bg-background border border-primary-border rounded-xl px-4 py-2.5 h-9.5"
                >
                  <label
                    class="flex items-center gap-2 cursor-pointer text-xs font-medium text-primary-text"
                  >
                    <input
                      type="radio"
                      :value="true"
                      v-model="form.is_active"
                      class="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span class="text-emerald-500 font-bold">Active</span>
                  </label>
                  <label
                    class="flex items-center gap-2 cursor-pointer text-xs font-medium text-primary-text"
                  >
                    <input
                      type="radio"
                      :value="false"
                      v-model="form.is_active"
                      class="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span class="text-zinc-500 font-semibold">Inactive</span>
                  </label>
                </div>
              </div>

              <!-- Allow FM PF Share Mode -->
              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-secondary-text"
                  >Allow FM PF Share Mode</label
                >
                <div
                  class="flex items-center justify-between bg-background border border-primary-border rounded-xl px-4 py-2.5"
                >
                  <p class="text-[11px] text-secondary-text leading-relaxed max-w-md">
                    When enabled, this FM can create offers with FM-mode PF share distribution (broker cut + custom recipients). Disabling only blocks new FM-mode creates.
                  </p>
                  <label class="inline-flex items-center gap-2 cursor-pointer shrink-0 ml-4 select-none">
                    <input
                      type="checkbox"
                      role="switch"
                      v-model="form.allow_fm_pf_share_mode"
                      class="peer sr-only"
                    />
                    <span
                      class="relative block h-[22px] w-10 rounded-full bg-zinc-300 transition-colors duration-200 dark:bg-zinc-600 peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/40 peer-checked:[&>span]:translate-x-[18px]"
                    >
                      <span
                        class="absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                      ></span>
                    </span>
                    <span
                      class="text-xs font-bold"
                      :class="form.allow_fm_pf_share_mode ? 'text-emerald-500' : 'text-zinc-500'"
                    >
                      {{ form.allow_fm_pf_share_mode ? 'Enabled' : 'Disabled' }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: BROKER & MT5 ACCOUNT CONFIGURATION -->
          <div
            class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4"
          >
            <div
              class="flex items-center justify-between border-b border-primary-border/60 pb-2"
            >
              <h3
                class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"
              >
                <Server class="w-3.5 h-3.5" />
                Broker Group & MT5 Trading Account
              </h3>
              <span
                v-if="groupsLoading"
                class="text-[11px] text-secondary-text flex items-center gap-1"
              >
                <Loader2 class="w-3 h-3 animate-spin text-primary" /> Loading
                groups...
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Group Preset Selector / Quick Auto-fill -->
              <div
                class="sm:col-span-2 flex flex-col gap-1.5"
                v-if="groupOptions.length > 0"
              >
                <label
                  class="text-xs font-semibold text-secondary-text flex items-center justify-between"
                >
                  <span>Select Group Template</span>
                  <span class="text-[11px] font-normal text-secondary-text"
                    >Auto-populates group, currency & leverage</span
                  >
                </label>
                <BaseSelect
                  :modelValue="selectedGroupValue"
                  :options="groupOptions"
                  placeholder="Choose an existing MT5 group configuration..."
                  searchable
                  @update:modelValue="onGroupPresetSelect"
                />
              </div>

              <!-- Broker Group (Required for MT5 account) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Broker Group <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.broker_group"
                  type="text"
                  disabled
                  placeholder="e.g. real\FM or PCL\RAW"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                  :class="
                    errors.broker_group
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span
                  v-if="errors.broker_group"
                  class="text-xs text-primary-red"
                  >{{ errors.broker_group }}</span
                >
              </div>

              <!-- Broker Currency (Disabled / Auto-selected from Group) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Broker Currency <span class="text-primary-red">*</span>
                </label>
                <BaseSelect
                  :modelValue="form.broker_currency"
                  :options="currencyOptions"
                  :disabled="true"
                  placeholder="Select currency"
                  @update:modelValue="form.broker_currency = $event"
                />
                <span
                  v-if="errors.broker_currency"
                  class="text-xs text-primary-red"
                  >{{ errors.broker_currency }}</span
                >
              </div>

              <!-- Broker Leverage (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Broker Leverage <span class="text-primary-red">*</span>
                </label>
                <BaseSelect
                  :modelValue="form.broker_leverage"
                  :options="leverageOptions"
                  :disabled="true"
                  placeholder="Select leverage"
                  @update:modelValue="form.broker_leverage = $event"
                />
                <span
                  v-if="errors.broker_leverage"
                  class="text-xs text-primary-red"
                  >{{ errors.broker_leverage }}</span
                >
              </div>

              <!-- Group Config ID (Optional) -->
              <!-- <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Group Config ID
                  <span class="text-[11px] font-normal text-secondary-text"
                    >(Optional)</span
                  >
                </label>
                <input
                  v-model="form.group_config_id"
                  type="number"
                  placeholder="e.g. 1"
                  class="bg-background border border-primary-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                />
              </div> -->
            </div>
          </div>

          <!-- SECTION 3: FINANCIALS, FEES & REVENUE SHARE -->
          <div
            class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4"
          >
            <h3
              class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary-border/60 pb-2"
            >
              <DollarSign class="w-3.5 h-3.5" />
              Financials, Fees & Revenue Share
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Min Investment Capital (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Min Investment Capital ({{ form.broker_currency === 'USC' ? 'USC' : '$' }})
                  <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.min_capital"
                  type="number"
                  placeholder="e.g. 1000"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                  :class="
                    errors.min_capital
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span
                  v-if="errors.min_capital"
                  class="text-xs text-primary-red"
                  >{{ errors.min_capital }}</span
                >
              </div>

              <!-- Performance Fee (Required, Max 50) -->
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-xs font-semibold text-secondary-text flex items-center justify-between"
                >
                  <span
                    >Performance Fee (%)
                    <span class="text-primary-red">*</span></span
                  >
                  <span
                    class="text-[10px] text-secondary-text font-bold uppercase"
                    >Max 50%</span
                  >
                </label>
                <input
                  v-model="form.performance_fee"
                  type="number"
                  max="50"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 20"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                  :class="
                    errors.performance_fee
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span
                  v-if="errors.performance_fee"
                  class="text-xs text-primary-red"
                  >{{ errors.performance_fee }}</span
                >
              </div>

              <!-- Performance Fee Share Mode Toggle -->
              <div v-if="form.allow_fm_pf_share_mode" class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-secondary-text">Performance Fee Share Mode</label>
                <div class="flex items-center gap-4 bg-background border border-primary-border rounded-xl px-4 py-2.5 h-9.5">
                  <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-primary-text" :class="{ 'opacity-50 cursor-not-allowed': mode === 'edit' }">
                    <input type="radio" value="broker" v-model="form.pf_share_mode" class="text-primary focus:ring-primary h-4 w-4" :disabled="mode === 'edit'" />
                    <span>Broker Mode</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-primary-text" :class="{ 'opacity-50 cursor-not-allowed': mode === 'edit' }">
                    <input type="radio" value="fm" v-model="form.pf_share_mode" class="text-primary focus:ring-primary h-4 w-4" :disabled="mode === 'edit'" />
                    <span>FM Mode</span>
                  </label>
                </div>
              </div>

              <!-- Broker Mode Fields (Existing) -->
              <template v-if="form.pf_share_mode === 'broker'">
                <!-- Broker Share (%) (Required) -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-secondary-text">
                    Broker Share (%) <span class="text-primary-red">*</span>
                  </label>
                  <input
                    v-model="form.broker_share"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 30"
                    class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                    :class="
                      errors.broker_share
                        ? 'border-primary-red'
                        : 'border-primary-border focus:border-primary'
                    "
                    @input="onBrokerShareInput"
                  />
                  <span
                    v-if="errors.broker_share"
                    class="text-xs text-primary-red"
                    >{{ errors.broker_share }}</span
                  >
                </div>

                <!-- FM Share (%) (Required) -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-secondary-text">
                    FM Share (%) <span class="text-primary-red">*</span>
                  </label>
                  <input
                    v-model="form.fm_share"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 70"
                    class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                    :class="
                      errors.fm_share
                        ? 'border-primary-red'
                        : 'border-primary-border focus:border-primary'
                    "
                    @input="onFmShareInput"
                  />
                  <span v-if="errors.fm_share" class="text-xs text-primary-red">{{
                    errors.fm_share
                  }}</span>
                </div>

                <!-- Share Distribution Live Sum Hint -->
                <div
                  class="sm:col-span-2 bg-background border border-primary-border/60 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <span class="text-secondary-text font-medium"
                    >FM Share + Broker Share (Must sum to 100%):</span
                  >
                  <span
                    class="font-mono font-bold"
                    :class="
                      Math.abs(
                        (parseFloat(form.fm_share) || 0) +
                          (parseFloat(form.broker_share) || 0) -
                          100,
                      ) <= 0.01
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    "
                  >
                    {{
                      (
                        (parseFloat(form.fm_share) || 0) +
                          (parseFloat(form.broker_share) || 0)
                      ).toFixed(1)
                    }}% / 100%
                  </span>
                </div>
                <span
                  v-if="errors.share_distribution"
                  class="text-xs text-primary-red sm:col-span-2"
                  >{{ errors.share_distribution }}</span
                >

                <!-- IB Pool Percentage (Required, Max 100) -->
                <div class="flex flex-col gap-1.5">
                  <label
                    class="text-xs font-semibold text-secondary-text flex items-center justify-between"
                  >
                    <span
                      >IB Pool Percentage (%)
                      <span class="text-primary-red">*</span></span
                    >
                    <span
                      class="text-[10px] text-secondary-text font-bold uppercase"
                      >Max 100%</span
                    >
                  </label>
                  <input
                    v-model="form.ib_pool_percentage"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 10"
                    class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors"
                    :class="
                      errors.ib_pool_percentage
                        ? 'border-primary-red'
                        : 'border-primary-border focus:border-primary'
                    "
                  />
                  <span
                    v-if="errors.ib_pool_percentage"
                    class="text-xs text-primary-red"
                    >{{ errors.ib_pool_percentage }}</span
                  >
                </div>
              </template>

              <!-- FM Mode Fields -->
              <template v-else>
                <div class="sm:col-span-2 flex flex-col gap-3 p-4 bg-background border border-primary-border rounded-xl">
                  <div class="flex items-center justify-between border-b border-primary-border/60 pb-2">
                    <h4 class="text-xs font-bold text-primary-text">FM Mode Share Distribution</h4>
                    <button type="button" @click="addRecipient" class="text-[11px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                      <Plus class="w-3 h-3" /> Add Recipient
                    </button>
                  </div>
                  
                  <!-- Distribution Header -->
                  <div class="grid grid-cols-[1fr_1fr_80px_32px] gap-2 px-2 text-[10px] font-bold text-secondary-text uppercase tracking-wider">
                    <div>Destination</div>
                    <div>Target</div>
                    <div>% of Total PF</div>
                    <div></div>
                  </div>

                  <!-- Broker Row (Static) -->
                  <div class="grid grid-cols-[1fr_1fr_80px_32px] gap-2 items-center">
                    <input disabled value="Broker" class="bg-background/50 border border-primary-border rounded-lg px-2.5 py-2 text-xs text-secondary-text outline-none" />
                    <input disabled value="Platform" class="bg-background/50 border border-primary-border rounded-lg px-2.5 py-2 text-xs text-secondary-text outline-none" />
                    <input v-model="form.pf_broker_share" type="number" min="0" max="100" class="bg-card-background border border-primary-border focus:border-primary rounded-lg px-2.5 py-2 text-xs text-primary-text outline-none font-mono" />
                    <div class="w-8"></div>
                  </div>

                  <!-- Dynamic Recipients -->
                  <div v-for="(rec, idx) in form.pf_share_recipients" :key="idx" class="grid grid-cols-[1fr_1fr_80px_32px] gap-2 items-start">
                    <select v-model="rec.destination_type" class="bg-card-background border border-primary-border focus:border-primary rounded-lg px-2.5 py-2 text-xs text-primary-text outline-none appearance-none">
                      <option value="wallet">Wallet</option>
                      <option value="trading_account">Trading Account</option>
                    </select>
                    <div>
                      <input v-model="rec.target" :placeholder="rec.destination_type === 'wallet' ? 'Wallet ID' : 'Account Number'" class="w-full bg-card-background border border-primary-border focus:border-primary rounded-lg px-2.5 py-2 text-xs text-primary-text outline-none font-mono" />
                      <span v-if="errors[`recipient_target_${idx}`]" class="text-[10px] text-primary-red mt-0.5 block">{{ errors[`recipient_target_${idx}`] }}</span>
                    </div>
                    <div>
                      <input v-model="rec.share_percentage" type="number" min="0" max="100" class="w-full bg-card-background border border-primary-border focus:border-primary rounded-lg px-2.5 py-2 text-xs text-primary-text outline-none font-mono" />
                      <span v-if="errors[`recipient_share_${idx}`]" class="text-[10px] text-primary-red mt-0.5 block">{{ errors[`recipient_share_${idx}`] }}</span>
                    </div>
                    <button type="button" @click="removeRecipient(idx)" class="w-8 h-[34px] flex items-center justify-center text-secondary-text hover:text-primary-red hover:bg-rose-500/10 rounded-lg transition-colors">
                      <X class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Totals Footer -->
                  <div class="mt-2 pt-3 border-t border-primary-border/60 flex items-center justify-between text-xs">
                    <span class="text-secondary-text font-medium">Allocated: <span class="font-bold text-primary-text">{{ totalAllocated }}%</span> &middot; To FM Wallet: <span class="font-bold text-primary-text">{{ Math.max(0, 100 - totalAllocated) }}%</span></span>
                    <span v-if="errors.share_distribution" class="text-primary-red font-semibold">{{ errors.share_distribution }}</span>
                  </div>
                </div>
              </template>

              <!-- Registration Fee -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Registration Fee ({{ form.broker_currency === 'USC' ? 'USC' : '$' }})</label
                >
                <input
                  v-model="form.registration_fee"
                  type="number"
                  placeholder="e.g. 0"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Management Fee (%) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Management Fee (%)</label
                >
                <input
                  v-model="form.management_fee"
                  type="number"
                  placeholder="e.g. 2"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text font-mono outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Management Fee Interval -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Management Interval</label
                >
                <BaseSelect
                  :modelValue="form.management_fee_interval"
                  :options="intervalOptions"
                  placeholder="Select interval"
                  @update:modelValue="form.management_fee_interval = $event"
                />
              </div>

              <!-- Settlement Type (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Settlement Schedule <span class="text-primary-red">*</span>
                </label>
                <BaseSelect
                  :modelValue="form.settlement_type"
                  :options="settlementOptions"
                  placeholder="Select schedule"
                  @update:modelValue="form.settlement_type = $event"
                />
                <span
                  v-if="errors.settlement_type"
                  class="text-xs text-primary-red"
                  >{{ errors.settlement_type }}</span
                >
              </div>

              <!-- Settlement Time (Required) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text">
                  Settlement Time <span class="text-primary-red">*</span>
                </label>
                <input
                  v-model="form.settlement_time"
                  type="time"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                  :class="
                    errors.settlement_time
                      ? 'border-primary-red'
                      : 'border-primary-border focus:border-primary'
                  "
                />
                <span
                  v-if="errors.settlement_time"
                  class="text-xs text-primary-red"
                  >{{ errors.settlement_time }}</span
                >
              </div>
            </div>
          </div>

          <!-- SECTION 4: CONTACT & ADDRESS (OPTIONAL) -->
          <div
            class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4"
          >
            <h3
              class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary-border/60 pb-2"
            >
              <MapPin class="w-3.5 h-3.5" />
              Contact & Address Information (Optional)
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Phone Number -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Phone Number</label
                >
                <input
                  v-model="form.phone_number"
                  type="text"
                  placeholder="e.g. +10000000000"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary font-mono"
                />
              </div>

              <!-- Date of Birth -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Date of Birth</label
                >
                <BaseDatePicker
                  v-model="form.date_of_birth"
                  mode="single"
                  valueFormat="YYYY-MM-DD"
                  placeholder="Select date of birth"
                  variant="surface"
                />
                <span
                  v-if="errors.date_of_birth"
                  class="text-xs text-primary-red"
                  >{{ errors.date_of_birth }}</span
                >
              </div>

              <!-- Country -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Country</label
                >
                <BaseSelect
                  :modelValue="form.country"
                  :options="countryOptions"
                  placeholder="Select country"
                  searchable
                  @update:modelValue="form.country = $event"
                />
              </div>

              <!-- State -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >State / Province</label
                >
                <input
                  v-model="form.state"
                  type="text"
                  placeholder="e.g. NY"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- City -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >City</label
                >
                <input
                  v-model="form.city"
                  type="text"
                  placeholder="e.g. New York"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>

              <!-- Zip Code -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Zip / Postal Code</label
                >
                <input
                  v-model="form.zip_code"
                  type="text"
                  placeholder="e.g. 10001"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary font-mono"
                />
              </div>

              <!-- Full Address -->
              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-secondary-text"
                  >Full Street Address</label
                >
                <input
                  v-model="form.address"
                  type="text"
                  placeholder="e.g. 123 Main St, Suite 400"
                  class="bg-background border rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors border-primary-border focus:border-primary"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 5: KYC & VERIFICATION STATUS (Optional / Edit Support) -->
          <div
            class="space-y-3.5 bg-background/40 border border-primary-border/60 rounded-xl p-4"
          >
            <h3
              class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary-border/60 pb-2"
            >
              <ShieldCheck class="w-3.5 h-3.5" />
              KYC & Verification Status
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Verification Channel -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Verification Channel</label
                >
                <BaseSelect
                  :modelValue="form.verification_channel"
                  :options="channelOptions"
                  placeholder="Select channel"
                  @update:modelValue="form.verification_channel = $event"
                />
              </div>

              <!-- KYC Status -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >KYC Status</label
                >
                <BaseSelect
                  :modelValue="form.kyc_status"
                  :options="kycStatusOptions"
                  placeholder="Select KYC status"
                  @update:modelValue="form.kyc_status = $event"
                />
              </div>

              <!-- Docs Uploaded -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Docs Uploaded</label
                >
                <BaseSelect
                  :modelValue="form.docs_uploaded"
                  :options="yesNoOptions"
                  placeholder="Select..."
                  @update:modelValue="form.docs_uploaded = $event"
                />
              </div>

              <!-- Doc Approved -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-secondary-text"
                  >Doc Approved</label
                >
                <BaseSelect
                  :modelValue="form.doc_approved"
                  :options="yesNoOptions"
                  placeholder="Select..."
                  @update:modelValue="form.doc_approved = $event"
                />
              </div>

              <!-- KYC Reject Reason (if rejected) -->
              <div
                v-if="form.kyc_status === 'rejected'"
                class="flex flex-col gap-1.5 sm:col-span-2"
              >
                <label class="text-xs font-semibold text-primary-red"
                  >KYC Rejection Reason</label
                >
                <input
                  v-model="form.kyc_reject_reason"
                  type="text"
                  placeholder="Provide reason for KYC rejection..."
                  class="bg-background border border-primary-red rounded-xl px-3.5 py-2.5 text-xs text-primary-text outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="px-6 py-4 border-t border-primary-border bg-background/60 flex items-center gap-3 shrink-0"
        >
          <button
            @click="closeDialog"
            :disabled="store.isSubmitting"
            class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:text-primary-text hover:bg-background transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="store.isSubmitting"
            class="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-hover transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="store.isSubmitting" class="w-4 h-4 animate-spin" />
            <span v-else>{{
              mode === "add" ? "Create Fund Manager" : "Update Fund Manager"
            }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import {
  Loader2,
  X,
  Plus,
  Sliders,
  User,
  DollarSign,
  Server,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from "lucide-vue-next";
import { useFmLeaderboardStore } from "@/stores/fmLeaderboard/fmLeaderboard";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import { countries } from "@/utils/countries";
import apiRequest from "@/api/request";
import urls from "@/api/urls";

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: "add" },
  item: { type: Object, default: null },
});

const emit = defineEmits(["close", "success"]);
const store = useFmLeaderboardStore();

const rawGroups = ref([]);
const groupsLoading = ref(false);
const selectedGroupValue = ref("");

const settlementOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const intervalOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

const visibilityOptions = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
];

const followerAccountTypeOptions = [
  { label: "Copy trading only (default)", value: 1 },
  { label: "Real account only", value: 2 },
  { label: "Both options", value: 3 },
];

const currencyOptions = [
  { label: "USD", value: "USD" },
  { label: "USC", value: "USC" },
];

const leverageOptions = [
  { label: "1:50", value: 50 },
  { label: "1:100", value: 100 },
  { label: "1:200", value: 200 },
  { label: "1:400", value: 400 },
  { label: "1:500", value: 500 },
  { label: "1:1000", value: 1000 },
];

const kycStatusOptions = [
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
];

const yesNoOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const channelOptions = [
  { label: "Manual", value: "Manual" },
  { label: "Sumsub", value: "Sumsub" },
  { label: "ShuftiPro", value: "ShuftiPro" },
  { label: "Other", value: "Other" },
];

const countryOptions = computed(() => {
  return countries.map((c) => ({
    label: c.label,
    value: c.value,
  }));
});

const groupOptions = computed(() => {
  return rawGroups.value
    .filter((g) => g.is_added === true)
    .map((g) => ({
      label: `${g.label || g.badge || g.group} (${g.currency || "USD"} · 1:${g.leverage || 100})`,
      value: g.group || g.config_id || g.label,
      data: g,
    }));
});

const originalForm = ref(null);

const form = ref({
  // Required identity / login
  email: "",
  name: "",
  password: "",
  label_name: "",
  visibility_type: "public",
  follower_account_type: 1,
  follower_account_type_action: "keep",
  is_active: true,
  allow_fm_pf_share_mode: false,

  // Broker / MT5
  broker_group: "",
  broker_currency: "USD",
  broker_leverage: 100,
  group_config_id: null,

  // Financials & Fees
  min_capital: "",
  performance_fee: "",
  fm_share: 70,
  broker_share: 30,
  ib_pool_percentage: 10,
  pf_share_mode: "broker",
  pf_broker_share: 0,
  pf_share_recipients: [],
  settlement_type: "monthly",
  settlement_time: "00:00",
  management_fee: 2,
  management_fee_interval: "monthly",
  registration_fee: 0,

  // Contact / Address
  phone_number: "",
  date_of_birth: "",
  country: "",
  state: "",
  city: "",
  address: "",
  zip_code: "",

  // KYC
  verification_channel: "Manual",
  docs_uploaded: "Yes",
  doc_approved: "Yes",
  kyc_status: "approved",
  kyc_reject_reason: "",
});

const errors = ref({});

const formatDateForInput = (d) => {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  try {
    const date = new Date(d);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  } catch {
    // ignore
  }
  return String(d).slice(0, 10);
};

const onBrokerShareInput = () => {
  const b = parseFloat(form.value.broker_share);
  if (!isNaN(b) && b >= 0 && b <= 100) {
    form.value.fm_share = Math.max(0, 100 - b);
  }
};


const addRecipient = () => {
  form.value.pf_share_recipients.push({ destination_type: 'wallet', target: '', share_percentage: 0 });
};

const removeRecipient = (index) => {
  form.value.pf_share_recipients.splice(index, 1);
};

const totalAllocated = computed(() => {
  let total = parseFloat(form.value.pf_broker_share) || 0;
  form.value.pf_share_recipients.forEach(r => {
    total += parseFloat(r.share_percentage) || 0;
  });
  return total;
});

const onFmShareInput = () => {
  const fm = parseFloat(form.value.fm_share);
  if (!isNaN(fm) && fm >= 0 && fm <= 100) {
    form.value.broker_share = Math.max(0, 100 - fm);
  }
};

const fetchAvailableGroups = async () => {
  groupsLoading.value = true;
  try {
    const endpoint =
      urls.groupConfig?.groups || urls.groupConfig?.list || "/mt5/groups";
    apiRequest(urls.KEYS.GET, endpoint, {
      isTokenRequired: true,
      params: {
        page: 1,
        per_page: 100,
        status: "all",
        account_type: "live",
      },
      onSuccess: (res) => {
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res)
              ? res
              : [];
        rawGroups.value = items;
        groupsLoading.value = false;
      },
      onFailure: () => {
        groupsLoading.value = false;
      },
    });
  } catch {
    groupsLoading.value = false;
  }
};

const onGroupPresetSelect = (groupValue) => {
  selectedGroupValue.value = groupValue;
  const match = rawGroups.value.find(
    (g) =>
      g.group === groupValue ||
      String(g.config_id) === String(groupValue) ||
      g.label === groupValue,
  );
  if (match) {
    form.value.broker_group = match.group || groupValue;
    if (match.currency) form.value.broker_currency = match.currency;
    if (match.leverage) form.value.broker_leverage = Number(match.leverage);
    form.value.group_config_id =
      match.config_id || match.group_config_id || match.id || null;
  } else {
    form.value.broker_group = groupValue;
  }
};

// Reset & Auto-fill form fields when drawer opens
const originalFollowerAccountType = ref(null);

const isFollowerAccountTypeChanged = computed(() => {
  if (props.mode !== "edit" || originalFollowerAccountType.value == null) return false;
  return (
    Number(form.value.follower_account_type) === 2 &&
    Number(originalFollowerAccountType.value) !== 2
  );
});

const resetForm = () => {
  selectedGroupValue.value = "";
  if (props.mode === "edit" && props.item) {
    const initialFollowerType =
      props.item.follower_account_type != null
        ? Number(props.item.follower_account_type)
        : 1;
    originalFollowerAccountType.value = initialFollowerType;

    const u = props.item.user || {};
    form.value = {
      email: u.email ?? props.item.email ?? "",
      name: u.name ?? props.item.name ?? "",
      password: "",
      label_name: props.item.label_name ?? u.name ?? props.item.name ?? "",
      visibility_type: props.item.visibility_type ?? "public",
      follower_account_type: initialFollowerType,
      follower_account_type_action: "keep",
      is_active: props.item.is_active ?? u.is_active ?? true,
      allow_fm_pf_share_mode: props.item.allow_fm_pf_share_mode ?? false,

      broker_group:
        props.item.broker_group ??
        props.item.coverage_account?.broker_group ??
        "",
      broker_currency:
        props.item.broker_currency ??
        props.item.coverage_account?.broker_currency ??
        "USD",
      broker_leverage:
        props.item.broker_leverage ??
        props.item.coverage_account?.broker_leverage ??
        100,
      group_config_id:
        props.item.group_config_id ??
        props.item.coverage_account?.group_config_id ??
        null,

      min_capital: props.item.min_capital ?? 1000,
      performance_fee: props.item.performance_fee ?? 20,
      fm_share: props.item.fm_share ?? 70,
      broker_share: props.item.broker_share ?? 30,
      ib_pool_percentage: props.item.ib_pool_percentage ?? 10,
      pf_share_mode: props.item.pf_share_mode || "broker",
      pf_broker_share: props.item.pf_broker_share ?? 0,
      pf_share_recipients: Array.isArray(props.item.pf_share_recipients) ? props.item.pf_share_recipients.map(r => ({
        destination_type: r.destination_type,
        target: r.destination_type === 'wallet' ? r.wallet_id : r.account_number,
        share_percentage: r.share_percentage
      })) : [],
      settlement_type:
        props.item.settlement_type ?? props.item.settlement ?? "monthly",
      settlement_time: props.item.settlement_time ?? "00:00",
      management_fee: props.item.management_fee ?? 2,
      management_fee_interval: props.item.management_fee_interval ?? "monthly",
      registration_fee: props.item.registration_fee ?? 0,

      phone_number: u.phone_number ?? props.item.phone_number ?? "",
      date_of_birth: u.date_of_birth ? formatDateForInput(u.date_of_birth) : "",
      country: u.country ?? props.item.country ?? "",
      state: u.state ?? props.item.state ?? "",
      city: u.city ?? props.item.city ?? "",
      address: u.address ?? props.item.address ?? "",
      zip_code: u.zip_code ?? props.item.zip_code ?? "",

      verification_channel:
        u.verification_channel ?? props.item.verification_channel ?? "Manual",
      docs_uploaded: u.docs_uploaded ?? props.item.docs_uploaded ?? "Yes",
      doc_approved: u.doc_approved ?? props.item.doc_approved ?? "Yes",
      kyc_status: u.kyc_status ?? props.item.kyc_status ?? "approved",
      kyc_reject_reason:
        u.kyc_reject_reason ?? props.item.kyc_reject_reason ?? "",
    };
  } else {
    originalFollowerAccountType.value = null;
    // Add mode initial defaults matching new payload schema
    form.value = {
      email: "",
      name: "",
      password: "",
      label_name: "",
      visibility_type: "public",
      follower_account_type: 1,
      follower_account_type_action: "keep",
      is_active: true,
      allow_fm_pf_share_mode: false,

      broker_group: "real\\FM",
      broker_currency: "USD",
      broker_leverage: 100,
      group_config_id: null,

      min_capital: 1000,
      performance_fee: 20,
      fm_share: 70,
      broker_share: 30,
      ib_pool_percentage: 10,
  pf_share_mode: "broker",
  pf_broker_share: 0,
  pf_share_recipients: [],
      settlement_type: "monthly",
      settlement_time: "00:00",
      management_fee: 2,
      management_fee_interval: "monthly",
      registration_fee: 0,

      phone_number: "",
      date_of_birth: "",
      country: "",
      state: "",
      city: "",
      address: "",
      zip_code: "",

      verification_channel: "Manual",
      docs_uploaded: "Yes",
      doc_approved: "Yes",
      kyc_status: "approved",
      kyc_reject_reason: "",
    };
  }
  originalForm.value = JSON.parse(JSON.stringify(form.value));
  errors.value = {};
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm();
      fetchAvailableGroups();
    }
  },
  { immediate: true },
);

const closeDialog = () => {
  errors.value = {};
  emit("close");
};

const validateForm = () => {
  const newErrors = {};

  // Email (Required)
  const email = form.value.email?.trim();
  if (!email) {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = "Invalid email format";
  }

  // Name (Required)
  if (!form.value.name?.trim()) {
    newErrors.name = "Full Name is required";
  }

  // Password (Required for create)
  if (props.mode === "add" && !form.value.password) {
    newErrors.password = "Password is required";
  }

  // Broker Group (Required)
  if (props.mode === "add" && !form.value.broker_group?.trim()) {
    newErrors.broker_group = "Broker group is required for MT5 account";
  }

  // Broker Currency & Leverage
  if (props.mode === "add" && !form.value.broker_currency) {
    newErrors.broker_currency = "Currency is required";
  }
  if (props.mode === "add" && !form.value.broker_leverage) {
    newErrors.broker_leverage = "Leverage is required";
  }

  // Min Capital (Required)
  if (form.value.min_capital === "" || form.value.min_capital == null) {
    newErrors.min_capital = "Min capital is required";
  }

  // Performance Fee (Required, Max 50)
  if (form.value.performance_fee === "" || form.value.performance_fee == null) {
    newErrors.performance_fee = "Performance fee is required";
  } else {
    const pf = parseFloat(form.value.performance_fee);
    if (isNaN(pf) || pf < 0) {
      newErrors.performance_fee = "Must be a valid positive number";
    } else if (pf > 50) {
      newErrors.performance_fee = "Max performance fee allowed is 50%";
    }
  }

  if (form.value.pf_share_mode === 'broker') {
    // Broker Share & FM Share (Required, Must sum to 100)
    if (form.value.broker_share === "" || form.value.broker_share == null) {
      newErrors.broker_share = "Broker share is required";
    }
    if (form.value.fm_share === "" || form.value.fm_share == null) {
      newErrors.fm_share = "FM share is required";
    }
    const fm = parseFloat(form.value.fm_share) || 0;
    const broker = parseFloat(form.value.broker_share) || 0;
    if (Math.abs(fm + broker - 100) > 0.01) {
      if (props.mode === "add" || fm !== (parseFloat(originalForm.value?.fm_share) || 0) || broker !== (parseFloat(originalForm.value?.broker_share) || 0)) {
        newErrors.share_distribution =
          "FM Share and Broker Share must sum to exactly 100%";
      }
    }

    // IB Pool Percentage (Required, Max 100)
    if (
      form.value.ib_pool_percentage === "" ||
      form.value.ib_pool_percentage == null
    ) {
      newErrors.ib_pool_percentage = "IB pool percentage is required";
    } else if (parseFloat(form.value.ib_pool_percentage) > 100) {
      newErrors.ib_pool_percentage = "Max 100%";
    }
  } else {
    // FM mode
    if (totalAllocated.value > 100) {
      newErrors.share_distribution = "Total allocated share cannot exceed 100%";
    }
    form.value.pf_share_recipients.forEach((rec, idx) => {
      if (!rec.target) newErrors[`recipient_target_${idx}`] = "Target required";
      if (rec.share_percentage <= 0) newErrors[`recipient_share_${idx}`] = "Share must be > 0";
    });
  }

  // Settlement
  if (!form.value.settlement_type)
    newErrors.settlement_type = "Settlement schedule is required";
  if (!form.value.settlement_time)
    newErrors.settlement_time = "Settlement time is required";

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    console.log("Validation Failed:", errors.value);
    const useSnackbarStore = (await import("@/stores/snackbar/snackbar")).useSnackbarStore;
    useSnackbarStore().show("Validation failed. Check the form for errors.", "error");
    return;
  }

  if (props.mode === "add") {
    const createPayload = {
      email: form.value.email.trim(),
      name: form.value.name.trim(),
      password: form.value.password,
      label_name: form.value.label_name?.trim() || form.value.name.trim(),
      visibility_type: form.value.visibility_type || "public",
      follower_account_type: Number(form.value.follower_account_type) || 1,
      is_active: Boolean(form.value.is_active),
      allow_fm_pf_share_mode: Boolean(form.value.allow_fm_pf_share_mode),

      broker_group: form.value.broker_group.trim(),
      broker_currency: form.value.broker_currency || "USD",
      broker_leverage: Number(form.value.broker_leverage) || 100,

      min_capital: Number(form.value.min_capital) || 0,
      performance_fee: Number(form.value.performance_fee) || 0,
      fm_share: Number(form.value.fm_share) || 0,
      broker_share: Number(form.value.broker_share) || 0,
      ib_pool_percentage: Number(form.value.ib_pool_percentage) || 0,
      
      pf_share_mode: form.value.pf_share_mode,
      pf_broker_share: form.value.pf_share_mode === 'fm' ? (Number(form.value.pf_broker_share) || 0) : 0,
      pf_share_recipients: form.value.pf_share_mode === 'fm' ? form.value.pf_share_recipients.map(r => ({
        destination_type: r.destination_type,
        [r.destination_type === 'wallet' ? 'wallet_id' : 'account_number']: r.destination_type === 'wallet' ? Number(r.target) : r.target,
        share_percentage: Number(r.share_percentage) || 0
      })) : [],
      settlement_type: form.value.settlement_type || "monthly",
      settlement_time: form.value.settlement_time || "00:00",
      management_fee: Number(form.value.management_fee) || 0,
      management_fee_interval: form.value.management_fee_interval || "monthly",
      registration_fee: Number(form.value.registration_fee) || 0,
    };

    if (
      form.value.group_config_id != null &&
      form.value.group_config_id !== ""
    ) {
      createPayload.group_config_id = Number(form.value.group_config_id);
    }
    if (form.value.phone_number?.trim())
      createPayload.phone_number = form.value.phone_number.trim();
    if (form.value.country?.trim())
      createPayload.country = form.value.country.trim();
    if (form.value.state?.trim()) createPayload.state = form.value.state.trim();
    if (form.value.city?.trim()) createPayload.city = form.value.city.trim();
    if (form.value.address?.trim())
      createPayload.address = form.value.address.trim();
    if (form.value.zip_code?.trim())
      createPayload.zip_code = form.value.zip_code.trim();

    const success = await store.createFundManager(createPayload);
    if (success) {
      closeDialog();
      emit("success");
    }
  } else {
    // Edit Mode Payload
    const buildEditPayload = (srcForm) => {
      const payload = {
        label_name: srcForm.label_name?.trim() || srcForm.name.trim(),
        is_active: Boolean(srcForm.is_active),
        allow_fm_pf_share_mode: Boolean(srcForm.allow_fm_pf_share_mode),
        follower_account_type: Number(srcForm.follower_account_type) || 1,
        min_capital: Number(srcForm.min_capital) || 0,
        performance_fee: Number(srcForm.performance_fee) || 0,
        fm_share: Number(srcForm.fm_share) || 0,
        broker_share: Number(srcForm.broker_share) || 0,
        ib_pool_percentage: Number(srcForm.ib_pool_percentage) || 0,
        
        pf_share_mode: srcForm.pf_share_mode,
        pf_broker_share: srcForm.pf_share_mode === 'fm' ? (Number(srcForm.pf_broker_share) || 0) : 0,
        pf_share_recipients: srcForm.pf_share_mode === 'fm' ? srcForm.pf_share_recipients.map(r => ({
          destination_type: r.destination_type,
          [r.destination_type === 'wallet' ? 'wallet_id' : 'account_number']: r.destination_type === 'wallet' ? Number(r.target) : r.target,
          share_percentage: Number(r.share_percentage) || 0
        })) : [],
        settlement_type: srcForm.settlement_type || "monthly",
        settlement_time: srcForm.settlement_time || "00:00",
        management_fee: Number(srcForm.management_fee) || 0,
        management_fee_interval: srcForm.management_fee_interval || "monthly",
        registration_fee: Number(srcForm.registration_fee) || 0,
        visibility_type: srcForm.visibility_type || "public",
        broker_group: srcForm.broker_group.trim(),
        broker_leverage: Number(srcForm.broker_leverage) || 100,
        broker_currency: srcForm.broker_currency || "USD",

        name: srcForm.name.trim(),
        email: srcForm.email.trim(),
        phone_number: srcForm.phone_number?.trim() || "",
        date_of_birth: srcForm.date_of_birth || null,
        country: srcForm.country?.trim() || "",
        state: srcForm.state?.trim() || "",
        city: srcForm.city?.trim() || "",
        address: srcForm.address?.trim() || "",
        zip_code: srcForm.zip_code?.trim() || "",
        verification_channel: srcForm.verification_channel || "Manual",
        docs_uploaded: srcForm.docs_uploaded || "Yes",
        doc_approved: srcForm.doc_approved || "Yes",
        kyc_status: srcForm.kyc_status || "approved",
        kyc_reject_reason:
          srcForm.kyc_status === "rejected"
            ? srcForm.kyc_reject_reason || null
            : null,

        user: {
          is_active: Boolean(srcForm.is_active),
        },
      };

      if (
        srcForm.group_config_id != null &&
        srcForm.group_config_id !== ""
      ) {
        payload.group_config_id = Number(srcForm.group_config_id);
      }

      if (srcForm.password && srcForm.password.trim() !== "") {
        payload.password = srcForm.password.trim();
      }

      if (isFollowerAccountTypeChanged.value) {
        payload.follower_account_type_action =
          srcForm.follower_account_type_action || "keep";
      }

      return payload;
    };

    const currentPayload = buildEditPayload(form.value);
    const originalPayload = buildEditPayload(originalForm.value);

    const editPayload = {};
    for (const key in currentPayload) {
      if (JSON.stringify(currentPayload[key]) !== JSON.stringify(originalPayload[key])) {
        editPayload[key] = currentPayload[key];
      }
    }

    if (Object.keys(editPayload).length === 0) {
      console.log("No changes detected. editPayload is empty.");
      const useSnackbarStore = (await import("@/stores/snackbar/snackbar")).useSnackbarStore;
      useSnackbarStore().show("No fields were changed.", "info");
      closeDialog();
      return;
    }

    const success = await store.editFundManager(props.item.id, editPayload);
    if (success) {
      closeDialog();
      emit("success");
    }
  }
};

const getTitle = () =>
  props.mode === "add" ? "Create Fund Manager" : "Edit Fund Manager";
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
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
