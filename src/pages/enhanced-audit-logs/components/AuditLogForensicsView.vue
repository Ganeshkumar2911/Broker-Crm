<template>
  <div>
    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- 0. LOADING SKELETON (Renders smoothly during API call)        -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div v-if="isInitialLoading || store.detailLoading" class="space-y-4 pt-4 pb-12 font-sans animate-pulse select-none">
      <!-- HERO CARD SKELETON -->
      <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-4">
        <!-- Title row skeleton -->
        <div class="flex items-start gap-4">
          <div class="w-[64px] h-[64px] rounded-2xl bg-primary/10 border border-primary/20 shrink-0"></div>
          <div class="min-w-0 space-y-2.5 flex-1">
            <div class="h-7 w-72 max-w-[80%] bg-background/80 rounded-lg"></div>
            <div class="h-4 w-96 max-w-full bg-background/60 rounded"></div>
            <div class="flex items-center gap-3 pt-1 flex-wrap">
              <div class="h-5 w-20 rounded-full bg-primary-green/10"></div>
              <div class="h-4 w-36 rounded bg-background"></div>
              <div class="h-4 w-28 rounded bg-background"></div>
              <div class="h-5 w-16 rounded bg-primary/10"></div>
              <div class="h-4 w-24 rounded bg-background"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUMMARY STRIP SKELETON (4 columns) -->
      <div class="bg-card-background rounded-xl border border-primary-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-primary-border">
        <div v-for="i in 4" :key="i" class="px-5 py-4 flex items-center gap-4 min-w-0">
          <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 shrink-0"></div>
          <div class="space-y-1.5 flex-1 min-w-0">
            <div class="h-3 w-12 bg-background rounded"></div>
            <div class="h-4 w-28 bg-background/80 rounded"></div>
            <div class="h-3 w-20 bg-background/50 rounded"></div>
          </div>
        </div>
      </div>

      <!-- TOP GRID SKELETON -->
      <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-4 items-stretch">
        <!-- LEFT -->
        <div class="flex flex-col gap-4">
          <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20"></div>
                <div class="h-4 w-32 bg-background rounded"></div>
              </div>
              <div class="h-5 w-28 rounded-full bg-primary/10"></div>
            </div>
            <div class="rounded-lg border border-primary-border bg-background/30 p-4 space-y-3">
              <div class="h-4 w-full bg-background rounded"></div>
              <div class="h-8 w-full bg-background/60 rounded"></div>
              <div class="h-8 w-full bg-background/40 rounded"></div>
            </div>
            <div class="p-3.5 rounded-lg border border-primary/20 bg-primary/5 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary/10 shrink-0"></div>
              <div class="space-y-1.5 flex-1">
                <div class="h-3.5 w-48 bg-primary/10 rounded"></div>
                <div class="h-3 w-72 bg-primary/10 rounded"></div>
              </div>
            </div>
          </div>

          <!-- SOURCE & TARGET DETAILS SKELETON (2 columns) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20"></div>
                <div class="h-4 w-28 bg-background rounded"></div>
              </div>
              <div class="rounded-lg border border-primary-border px-3.5 divide-y divide-primary-border/60 bg-background/30 space-y-2 py-2">
                <div v-for="j in 4" :key="j" class="grid grid-cols-[40%_minmax(0,1fr)] gap-2 py-2">
                  <div class="h-3 w-20 bg-background rounded"></div>
                  <div class="h-3 w-28 bg-background/80 rounded"></div>
                </div>
              </div>
            </div>

            <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20"></div>
                <div class="h-4 w-28 bg-background rounded"></div>
              </div>
              <div class="rounded-lg border border-primary-border px-3.5 divide-y divide-primary-border/60 bg-background/30 space-y-2 py-2">
                <div v-for="j in 4" :key="j" class="grid grid-cols-[40%_minmax(0,1fr)] gap-2 py-2">
                  <div class="h-3 w-20 bg-background rounded"></div>
                  <div class="h-3 w-28 bg-background/80 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Map & Spec Boxes -->
        <div class="bg-card-background rounded-xl p-5 border border-primary-border flex flex-col justify-between space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-primary/20"></div>
              <div class="h-4 w-36 bg-background rounded"></div>
            </div>
            <div class="h-5 w-28 rounded-full bg-primary/10"></div>
          </div>
          <div class="flex-1 min-h-[320px] lg:min-h-[380px] bg-background/40 rounded-xl border border-primary-border flex items-center justify-center">
            <div class="flex flex-col items-center gap-2 text-secondary-text">
              <div class="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <span class="text-xs font-semibold">Loading network forensics...</span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2.5 pt-1">
            <div v-for="k in 6" :key="k" class="bg-background border border-primary-border rounded-lg p-2.5 space-y-1.5 min-h-[52px]">
              <div class="h-2.5 w-16 bg-card-background rounded"></div>
              <div class="h-3.5 w-24 bg-card-background rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM GRID SKELETON (Balanced 2 columns) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3 flex flex-col justify-between h-full">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20"></div>
              <div class="h-4 w-32 bg-background rounded"></div>
            </div>
            <div class="h-5 w-16 rounded bg-background"></div>
          </div>
          <div class="rounded-lg border border-primary-border px-3.5 divide-y divide-primary-border/60 bg-background/30 space-y-2 py-2 flex-1">
            <div v-for="m in 6" :key="m" class="grid grid-cols-[40%_minmax(0,1fr)] gap-2 py-2">
              <div class="h-3 w-24 bg-background rounded"></div>
              <div class="h-3 w-36 bg-background/80 rounded"></div>
            </div>
          </div>
        </div>

        <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3 flex flex-col justify-between h-full">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20"></div>
              <div class="h-4 w-28 bg-background rounded"></div>
            </div>
            <div class="h-6 w-16 rounded-lg bg-primary/10"></div>
          </div>
          <div class="rounded-lg border border-primary-border px-3.5 divide-y divide-primary-border/60 bg-background/30 space-y-2 py-2 flex-1">
            <div v-for="n in 6" :key="n" class="grid grid-cols-[40%_minmax(0,1fr)] gap-2 py-2">
              <div class="h-3 w-20 bg-background rounded"></div>
              <div class="h-3 w-48 bg-background/80 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- RAW PAYLOAD SKELETON -->
      <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <div :class="iconTile"><Code class="w-4 h-4 text-primary" /></div>
            <span>Raw Payload (JSON)</span>
          </div>
          <div class="h-6 w-32 bg-background rounded-lg"></div>
        </div>
        <div class="bg-[#0B132B]/70 rounded-xl p-6 h-40 border border-[#1C2541] flex flex-col justify-center gap-2">
          <div class="h-3 w-1/2 bg-[#1C2541] rounded"></div>
          <div class="h-3 w-3/4 bg-[#1C2541] rounded"></div>
          <div class="h-3 w-2/3 bg-[#1C2541] rounded"></div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- 0. ERROR / NOT FOUND STATE                                    -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div
      v-else-if="!hasRecord"
      class="bg-card-background rounded-xl p-12 border border-primary-border text-center space-y-4"
    >
      <div class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
        <span class="material-symbols-rounded text-3xl">error_outline</span>
      </div>
      <div class="space-y-1 max-w-md mx-auto">
        <h2 class="text-base font-bold text-primary-text">Audit Event #{{ computedEventId }} Not Found</h2>
        <p class="text-xs text-secondary-text leading-relaxed">
          The requested audit log could not be retrieved from the server.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-btn-text-primary text-xs font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
        @click="handleBack"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Back to Audit Logs</span>
      </button>
    </div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- ACTIVE DYNAMIC CONTENT (100% Dynamic - Zero Hardcoding)        -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div v-else class="space-y-4 pt-4 pb-12 font-sans text-primary-text">
      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- 1. HERO CARD                                                  -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="relative bg-card-background rounded-xl p-5 border border-primary-border space-y-4 overflow-hidden isolate">
        <!-- Dynamic primary gradient aura/wave (top-right) -->
        <div class="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none overflow-hidden select-none">
          <svg class="absolute right-0 top-0 h-full w-full" viewBox="0 0 600 220" fill="none" preserveAspectRatio="none">
            <path d="M150 0 C250 80, 400 30, 600 120 L600 0 Z" fill="url(#hero-wave-1)" />
            <path d="M300 0 C420 120, 480 60, 600 180 L600 0 Z" fill="url(#hero-wave-2)" />
            <defs>
              <linearGradient id="hero-wave-1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.03" />
                <stop offset="100%" stop-color="var(--color-primary-blue)" stop-opacity="0.12" />
              </linearGradient>
              <linearGradient id="hero-wave-2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.02" />
                <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.08" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- Title block -->
        <div class="relative z-10 flex items-start gap-4">
          <div class="w-[64px] h-[64px] rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <span class="material-symbols-rounded text-[32px] select-none">
              {{ googleHeroIcon }}
            </span>
          </div>

          <div class="min-w-0 space-y-1.5">
            <h1 class="text-2xl font-extrabold text-primary-text tracking-tight">
              {{ displayTitle }}
            </h1>

            <p class="text-sm text-primary-text font-semibold leading-relaxed">
              {{ displaySubtitle }}
            </p>

            <div class="flex items-center gap-3 pt-1 flex-wrap text-xs font-semibold">
              <span
                class="inline-flex items-center gap-1.5 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase"
                :class="statusBadgeClass"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass"></span>
                {{ statusValue }}
              </span>

              <span v-if="formattedDateTime !== '—'" class="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-primary-text">
                <Calendar class="w-3.5 h-3.5 font-semibold text-secondary-text" />
                <span>{{ formattedDateTime }}</span>
              </span>

              <span v-if="moduleDisplay !== '—'" class="inline-flex items-center gap-1.5 capitalize font-medium text-[11px] font-semibold text-primary-text">
                <Landmark class="w-3.5 h-3.5 font-semibold text-secondary-text" />
                <span>{{ moduleDisplay }}</span>
              </span>

              <span v-if="requestMethod !== '—'" class="inline-flex items-center gap-1.5 font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                <Link2 class="w-3 h-3" />
                <span>{{ requestMethod }}</span>
              </span>

              <span v-if="computedEventId !== '—'" class="inline-flex items-center gap-1.5 font-mono font-medium text-[11px] font-semibold text-primary-text">
                <ShieldCheck class="w-3.5 h-3.5 font-semibold text-secondary-text" />
                <span>Log ID: #{{ computedEventId }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- 2. SUMMARY STRIP (single card, 4 cells with dividers)         -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="bg-card-background rounded-xl border border-primary-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-primary-border">
        <!-- Actor -->
        <div class="px-5 py-4 flex items-center gap-4 min-w-0">
          <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0">
            {{ actorInitials }}
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase text-secondary-text tracking-wider block">Actor</span>
            <h4 class="text-xs font-bold text-primary-text truncate mt-0.5" :title="actorInfo.name">{{ actorInfo.name }}</h4>
            <span v-if="actorInfo.role" class="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
              {{ actorInfo.role }}
            </span>
            <span v-else class="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-background border border-primary-border text-secondary-text">
              {{ actorInfo.type }}
            </span>
          </div>
        </div>

        <!-- Action -->
        <div class="px-5 py-4 flex items-center gap-4 min-w-0">
          <div class="w-12 h-12 rounded-full bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green shrink-0">
            <Settings class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase text-secondary-text tracking-wider block">Action</span>
            <h4 class="text-xs font-bold text-primary-text truncate mt-0.5" :title="actionSummaryTitle">{{ actionSummaryTitle }}</h4>
            <p class="text-[11px] text-secondary-text truncate mt-0.5 font-normal">{{ actionSummarySub }}</p>
          </div>
        </div>

        <!-- Target -->
        <div class="px-5 py-4 flex items-center gap-4 min-w-0">
          <div class="w-12 h-12 rounded-full bg-primary-blue/10 border border-primary-blue/20 flex items-center justify-center text-primary-blue shrink-0">
            <Database class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase text-secondary-text tracking-wider block">Target</span>
            <h4 class="text-xs font-bold text-primary-text truncate mt-0.5" :title="targetInfo.displayName">{{ targetInfo.displayName }}</h4>
            <p class="text-[11px] text-secondary-text truncate mt-0.5 font-normal">
              {{ moduleDisplay }} <span v-if="targetInfo.subInfo" class="mx-1">•</span> <span v-if="targetInfo.subInfo" class="uppercase">{{ targetInfo.subInfo }}</span>
            </p>
          </div>
        </div>

        <!-- Change -->
        <div class="px-5 py-4 flex items-center gap-4 min-w-0">
          <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <ArrowRightLeft class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase text-secondary-text tracking-wider block">Change</span>
            <h4 v-if="mutationRows.length > 0" class="text-xs font-bold text-primary-text mt-0.5 flex items-center gap-1.5 min-w-0" :title="changeMetricTitle">
              <span class="truncate">{{ firstChange.oldDisplay }}</span>
              <ArrowRight class="w-3.5 h-3.5 shrink-0 text-secondary-text" />
              <span class="truncate">{{ firstChange.newDisplay }}</span>
            </h4>
            <h4 v-else class="text-xs font-bold text-primary-text mt-0.5 truncate">
              No Field Changes
            </h4>
            <p class="text-[11px] text-secondary-text truncate mt-0.5 font-normal">{{ changeMetricSub }}</p>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- 3. TOP GRID : (What Changed + Source & Target Details) | Map   -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-4 items-stretch">
        <!-- LEFT -->
        <div class="flex flex-col gap-4">
          <!-- What Changed? -->
          <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div :class="iconTile"><FileCode class="w-4 h-4 text-primary" /></div>
                <h3 class="text-xs font-bold text-primary-text uppercase tracking-wider">What Changed?</h3>
              </div>
              <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {{ mutationRows.length }} field{{ mutationRows.length !== 1 ? 's' : '' }} modified
              </span>
            </div>

            <!-- Table or Empty state -->
            <div v-if="mutationRows.length > 0" class="overflow-x-auto rounded-lg border border-primary-border bg-background/40">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="text-[10px] font-semibold text-secondary-text uppercase tracking-wider border-b border-primary-border bg-background/80">
                    <th class="py-2.5 px-3">Field</th>
                    <th class="py-2.5 px-2 text-center">Previous Value</th>
                    <th class="py-2.5 w-6 text-center"></th>
                    <th class="py-2.5 px-2 text-center">New Value</th>
                    <th class="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-primary-border/60">
                  <tr v-for="row in mutationRows" :key="row.field" class="hover:bg-card-background/60 transition-colors">
                    <td class="py-3 px-3 font-semibold text-primary-text whitespace-nowrap">
                      <div class="flex items-center gap-1.5">
                        <span>{{ row.label }}</span>
                        <Info class="w-3.5 h-3.5 text-secondary-text shrink-0 cursor-help" />
                      </div>
                    </td>
                    <td class="py-3 px-2 text-center">
                      <span class="inline-block font-mono text-xs font-semibold px-3 py-0.5 rounded-md bg-primary-red/10 text-primary-red border border-primary-red/20 max-w-[140px] truncate align-middle" :title="row.oldDisplay">
                        {{ row.oldDisplay }}
                      </span>
                    </td>
                    <td class="py-3 text-center">
                      <ArrowRight class="w-3.5 h-3.5 mx-auto text-secondary-text" />
                    </td>
                    <td class="py-3 px-2 text-center">
                      <span class="inline-block font-mono text-xs font-semibold px-3 py-0.5 rounded-md bg-primary-green/10 text-primary-green border border-primary-green/20 max-w-[140px] truncate align-middle" :title="row.newDisplay">
                        {{ row.newDisplay }}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-xs text-secondary-text leading-relaxed">{{ row.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="rounded-lg border border-primary-border bg-background/20 p-5 text-center space-y-1.5">
              <div class="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                <FileCode class="w-4 h-4" />
              </div>
              <p class="text-xs font-bold text-primary-text">No Direct Field Mutations</p>
              <p class="text-[11px] text-secondary-text max-w-sm mx-auto">This event executed without recording individual field differences.</p>
            </div>

            <!-- Highlight Narrative Box -->
            <div class="p-3.5 rounded-lg border border-primary/20 border-l-4 border-l-primary bg-primary/5 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <Pencil class="w-4 h-4" />
              </div>
              <div class="min-w-0 space-y-0.5">
                <h4 class="text-xs font-bold text-primary-text truncate">{{ narrativeHighlightTitle }}</h4>
                <p class="text-[11px] text-secondary-text leading-relaxed font-normal">{{ narrativeHighlightDesc }}</p>
              </div>
            </div>
          </div>

          <!-- SOURCE & TARGET DETAILS (2-Column Balanced Grid) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch flex-1">
            <!-- Source / Actor Details -->
            <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3 flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div :class="iconTile"><UserCheck class="w-4 h-4 text-primary" /></div>
                  <h3 class="text-xs font-bold text-primary-text uppercase tracking-wider">Source Details</h3>
                </div>
                <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  Actor
                </span>
              </div>
              <div class="rounded-lg border border-primary-border px-3.5 divide-y divide-primary-border/60 bg-background/30 text-xs flex-1 max-h-[220px] overflow-y-auto custom-scrollbar">
                <div v-for="row in sourceRows" :key="row.label" class="grid grid-cols-[42%_minmax(0,1fr)] gap-2 py-2.5 items-center">
                  <span class="text-secondary-text text-[11px] font-normal">{{ row.label }}</span>
                  <span class="text-primary-text font-semibold text-xs truncate" :class="row.mono ? 'font-mono' : ''" :title="row.value">{{ row.value }}</span>
                </div>
              </div>
            </div>

            <!-- Destination Details -->
            <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3 flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div :class="iconTile"><Database class="w-4 h-4 text-primary" /></div>
                  <h3 class="text-xs font-bold text-primary-text uppercase tracking-wider">Destination Details</h3>
                </div>
                <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
                  Destination
                </span>
              </div>
              <div class="rounded-lg border border-primary-border px-3.5 divide-y divide-primary-border/60 bg-background/30 text-xs flex-1 max-h-[220px] overflow-y-auto custom-scrollbar">
                <div v-for="row in destinationRows" :key="row.label" class="grid grid-cols-[42%_minmax(0,1fr)] gap-2 py-2.5 items-center">
                  <span class="text-secondary-text text-[11px] font-normal">{{ row.label }}</span>
                  <span class="text-primary-text font-semibold text-xs truncate" :class="row.mono ? 'font-mono' : ''" :title="row.value">{{ row.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT : Location & Network -->
        <div class="bg-card-background rounded-xl p-5 border border-primary-border flex flex-col justify-between space-y-4 h-full isolate relative z-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <ShieldCheck class="w-4 h-4" />
              <span>Location &amp; Network</span>
            </div>
            <span
              v-if="ipAddress && ipAddress !== '—'"
              class="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 flex items-center gap-1.5"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {{ ipAddress }}
            </span>
          </div>

          <AuditLogNetworkMap
            class="flex-1 min-h-[320px] lg:min-h-[380px]"
            :ip-address="ipAddress"
            @geo-resolved="onGeoResolved"
          />

          <div class="grid grid-cols-3 gap-2.5 text-xs pt-1">
            <div :class="specBox">
              <span :class="specLabel">IP Address</span>
              <span :class="specValue" class="font-bold font-mono truncate block">{{ ipAddress }}</span>
            </div>

            <div :class="specBox">
              <span :class="specLabel">Location</span>
              <span :class="specValue" class="font-semibold flex items-center gap-1.5 min-w-0" :title="originLocationDisplay">
                <span v-if="countryFlag" class="shrink-0 text-xs">{{ countryFlag }}</span>
                <Globe v-else class="w-3.5 h-3.5 text-secondary-text shrink-0" />
                <span class="truncate">{{ originLocationDisplay }}</span>
              </span>
            </div>

            <div :class="specBox" class="flex items-center gap-2">
              <svg v-if="parsedAgent.os.toLowerCase().includes('mac')" class="w-4 h-4 fill-current text-primary-text shrink-0" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.99-9.35-10.74-20.2-14.25-32.55-3.51-12.35-5.27-23.77-5.27-34.27 0-14.88 3.82-27.16 11.45-36.83 7.63-9.67 17.06-14.6 28.3-14.79 4.79 0 10.22 1.25 16.29 3.75 6.07 2.5 10.14 3.79 12.23 3.87 1.63 0 5.86-1.39 12.7-4.17 6.83-2.77 12.87-4.04 18.11-3.79 13.88.75 24.89 5.8 33.02 15.15-12.13 7.37-18.1 17.52-17.9 30.45.2 10.26 4.11 18.79 11.74 25.59 7.63 6.8 16.59 10.55 26.89 11.24-2.58 7.79-5.77 15.42-9.58 22.91zm-32.96-107.8c0-7.39 2.62-14.34 7.86-20.85 5.24-6.52 11.78-10.63 19.63-12.35.22 1.3.33 2.4.33 3.3 0 7.39-2.74 14.4-8.22 21.03-5.48 6.63-12.08 10.7-19.8 12.21-.22-1.09-.33-2.2-.33-3.34z" />
              </svg>
              <Monitor v-else class="w-4 h-4 text-secondary-text shrink-0" />
              <div class="min-w-0">
                <span :class="specLabel">Device</span>
                <span :class="specValue" class="font-semibold truncate block">{{ parsedAgent.device }}</span>
              </div>
            </div>

            <div :class="specBox">
              <span :class="specLabel">ISP / Network</span>
              <span :class="specValue" class="font-semibold truncate block" :title="ispDisplay">{{ ispDisplay }}</span>
            </div>

            <div :class="specBox" class="flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <circle cx="12" cy="12" r="4" fill="#4285F4" />
                <path fill="#EA4335" d="M12 4.5c2.2 0 4.18.98 5.53 2.53L12 12h-7.5C4.5 7.86 7.86 4.5 12 4.5z" />
                <path fill="#FBBC05" d="M4.5 12c0 2.2.98 4.18 2.53 5.53L12 12V4.5C7.86 4.5 4.5 7.86 4.5 12z" />
                <path fill="#34A853" d="M12 19.5c-2.2 0-4.18-.98-5.53-2.53L12 12h7.5c0 4.14-3.36 7.5-7.5 7.5z" />
              </svg>
              <div class="min-w-0">
                <span :class="specLabel">Client Browser</span>
                <span :class="specValue" class="font-semibold truncate block">{{ parsedAgent.browser }}</span>
              </div>
            </div>

            <div :class="specBox">
              <span :class="specLabel">Operating System</span>
              <span :class="specValue" class="font-semibold truncate block">{{ parsedAgent.os }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- 4. BOTTOM GRID : Business Context | Request Details (Balanced)-->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <!-- Business Context -->
        <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3 flex flex-col justify-between h-full">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <div :class="iconTile"><FileText class="w-4 h-4 text-primary" /></div>
              <span>Business Context</span>
            </div>
            <span class="text-[10px] font-mono text-secondary-text bg-background border border-primary-border px-2 py-0.5 rounded">
              {{ businessRows.length }} {{ businessRows.length === 1 ? 'Entry' : 'Entries' }}
            </span>
          </div>

          <div
            v-if="businessRows.length > 0"
            class="rounded-lg border border-primary-border px-3.5 divide-y divide-primary-border/60 bg-background/30 text-xs flex-1 max-h-[300px] overflow-y-auto custom-scrollbar"
          >
            <div v-for="row in businessRows" :key="row.label" class="grid grid-cols-[40%_minmax(0,1fr)] gap-2 py-2.5 items-center">
              <span class="text-secondary-text text-[11px] font-normal">{{ row.label }}</span>
              <span class="text-primary-text font-semibold text-xs truncate" :class="row.mono ? 'font-mono' : ''" :title="row.value">{{ row.value }}</span>
            </div>
          </div>

          <div
            v-else
            class="p-6 text-center text-xs text-secondary-text bg-background/20 rounded-lg border border-primary-border flex-1 flex items-center justify-center"
          >
            No specific business context recorded for this event.
          </div>
        </div>

        <!-- Request Details -->
        <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3 flex flex-col justify-between h-full">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <div :class="iconTile"><Link2 class="w-4 h-4 text-primary" /></div>
              <span>Request Details</span>
            </div>
            <button
              v-if="traceId && traceId !== '—'"
              type="button"
              class="text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-lg transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 border border-primary/20"
              @click="copyText(traceId, 'Trace ID')"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>

          <div class="rounded-lg border border-primary-border px-3.5 divide-y divide-primary-border/60 bg-background/30 text-xs flex-1 max-h-[300px] overflow-y-auto custom-scrollbar">
            <div :class="reqRow">
              <span :class="reqLabel">Endpoint</span>
              <span class="font-mono text-primary-text text-xs truncate" :title="requestEndpoint">{{ requestEndpoint }}</span>
            </div>
            <div :class="reqRow">
              <span :class="reqLabel">HTTP Method</span>
              <span><span class="inline-block text-[10px] font-bold font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase">{{ requestMethod }}</span></span>
            </div>
            <div :class="reqRow">
              <span :class="reqLabel">IP Address</span>
              <span class="font-mono text-primary-text text-xs font-semibold">{{ ipAddress }}</span>
            </div>
            <div :class="reqRow">
              <span :class="reqLabel">User Agent</span>
              <div class="flex items-start gap-2 min-w-0">
                <svg class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  <circle cx="12" cy="12" r="4" fill="#4285F4" />
                  <path fill="#EA4335" d="M12 4.5c2.2 0 4.18.98 5.53 2.53L12 12h-7.5C4.5 7.86 7.86 4.5 12 4.5z" />
                  <path fill="#FBBC05" d="M4.5 12c0 2.2.98 4.18 2.53 5.53L12 12V4.5C7.86 4.5 4.5 7.86 4.5 12z" />
                  <path fill="#34A853" d="M12 19.5c-2.2 0-4.18-.98-5.53-2.53L12 12h7.5c0 4.14-3.36 7.5-7.5 7.5z" />
                </svg>
                <div class="min-w-0">
                  <span class="text-primary-text font-semibold text-xs block">{{ parsedAgent.browser }}</span>
                  <span class="text-[10px] font-mono text-secondary-text block truncate" :title="userAgent">{{ userAgent }}</span>
                </div>
              </div>
            </div>
            <div :class="reqRow">
              <span :class="reqLabel">Request / Trace ID</span>
              <span class="font-mono font-bold text-primary text-xs truncate" :title="traceId">{{ traceId }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- 5. RAW PAYLOAD                                                -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="bg-card-background rounded-xl p-5 border border-primary-border space-y-3.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <div :class="iconTile"><Code class="w-4 h-4 text-primary" /></div>
            <span>Raw Payload (JSON)</span>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex items-center bg-background border border-primary-border rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                class="px-3.5 py-1 rounded-md transition cursor-pointer"
                :class="isJsonFormatted ? 'bg-primary text-btn-text-primary font-bold' : 'text-secondary-text hover:text-primary-text'"
                @click="isJsonFormatted = true"
              >
                Formatted
              </button>
              <button
                type="button"
                class="px-3.5 py-1 rounded-md transition cursor-pointer"
                :class="!isJsonFormatted ? 'bg-primary text-btn-text-primary font-bold' : 'text-secondary-text hover:text-primary-text'"
                @click="isJsonFormatted = false"
              >
                Raw
              </button>
            </div>

            <button
              type="button"
              class="text-secondary-text hover:text-primary p-1.5 rounded-lg border border-primary-border bg-background transition cursor-pointer"
              title="Copy Raw JSON"
              @click="copyText(JSON.stringify(rawRecord, null, 2), 'Raw Payload')"
            >
              <Copy class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="relative bg-[#0B132B] text-[#E0E7FF] rounded-xl p-4 border border-[#1C2541] max-h-80 overflow-y-auto font-mono text-[11px] leading-relaxed select-all shadow-inner custom-scrollbar">
          <button
            type="button"
            class="absolute top-3 right-3 text-[#94A3B8] hover:text-[#FFFFFF] transition p-1.5 rounded-md border border-[#334155]/60 bg-[#1C2541]/80 hover:bg-[#1C2541] cursor-pointer"
            title="Copy"
            @click="copyText(JSON.stringify(rawRecord, null, 2), 'Code')"
          >
            <Copy class="w-3.5 h-3.5" />
          </button>

          <div v-if="isJsonFormatted" class="pr-12 space-y-0.5">
            <div v-for="(line, idx) in formattedJsonLines" :key="idx" class="flex items-start gap-3">
              <span class="text-[#475569] text-[10px] w-6 text-right shrink-0 select-none leading-relaxed">{{ idx + 1 }}</span>
              <span class="whitespace-pre-wrap break-all" v-html="highlightJsonLine(line)"></span>
            </div>
          </div>
          <pre v-else class="whitespace-pre-wrap break-all pr-12">{{ JSON.stringify(rawRecord) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Settings,
  Database,
  ArrowRightLeft,
  FileCode,
  Info,
  ArrowRight,
  Pencil,
  Link2,
  ShieldCheck,
  Code,
  Copy,
  Calendar,
  Landmark,
  FileText,
  Monitor,
  Globe,
  UserCheck
} from 'lucide-vue-next'
import { formatDate } from '@/utils/timeFormatter'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { useEnhancedAuditLogsStore } from '@/stores/enhancedAuditLogs/enhancedAuditLogs'
import AuditLogNetworkMap from '@/pages/enhanced-audit-logs/components/AuditLogNetworkMap.vue'

const props = defineProps({
  logData: { type: [Object, Array], default: () => ({}) },
  eventId: { type: [String, Number], default: '—' }
})

const emit = defineEmits(['back'])

const route = useRoute()
const router = useRouter()
const store = useEnhancedAuditLogsStore()
const snackbar = useSnackbarStore()
const isJsonFormatted = ref(true)
const isInitialLoading = ref(true)
const resolvedGeo = ref({ city: '', region: '', country: '', country_code: '', isp: '', asn: '' })
const fetchedData = ref(null)

/* ── shared style tokens (100% theme-pure from style.css) ────────── */
const iconTile =
  'w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0'
const specBox =
  'bg-background border border-primary-border rounded-lg px-3 py-2.5 min-h-[52px] min-w-0'
const specLabel = 'text-[10px] uppercase font-bold text-secondary-text tracking-wider block leading-tight mb-1'
const specValue = 'text-xs text-primary-text'
const reqRow = 'grid grid-cols-[40%_minmax(0,1fr)] gap-2 py-2.5 items-center'
const reqLabel = 'text-secondary-text text-[11px] font-normal'

const handleBack = () => {
  emit('back')
  if (route?.name === 'client-details-audit-log-detail' || route?.path?.includes('/client/details/')) {
    const clientId = route.params.id
    if (clientId) {
      router.push(`/client/details/${clientId}?tab=audit-logs`)
    } else {
      router.back()
    }
  } else if (route?.name === 'enhanced-audit-log-details' || route?.path?.includes('/enhanced-audit-logs/')) {
    router.push('/enhanced-audit-logs')
  } else {
    router.back()
  }
}

const onGeoResolved = (geo) => {
  if (geo) resolvedGeo.value = geo
}

const copyText = (text, label = 'Content') => {
  if (!text) return
  navigator.clipboard.writeText(String(text))
  snackbar.show(`${label} copied to clipboard`, 'success')
}

/* ── formatting helpers ─────────────────────────────────────────── */
const formatInlineNumber = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '0.00'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}

const formatInlineValue = (val) => {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'number' && !isNaN(val)) return formatInlineNumber(val)
  if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val)) && (val.includes('e') || val.includes('E')))
    return formatInlineNumber(val)
  return String(val)
}

const titleCase = (s) =>
  String(s || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())

const unwrapRecord = (val) => {
  if (!val) return {}
  if (Array.isArray(val)) return val.length > 0 ? unwrapRecord(val[0]) : {}
  if (typeof val === 'object') {
    if (val.items && Array.isArray(val.items)) return val.items.length > 0 ? unwrapRecord(val.items[0]) : {}
    if (val.data !== undefined && val.data !== null && typeof val.data === 'object') {
      if (val.audit || val.action || val.audit_log_id || val.summary || val.changes || val.target || val.actor) {
        return val.data
      }
      return unwrapRecord(val.data)
    }
    return val
  }
  return {}
}

const computedEventId = computed(() => {
  if (props.eventId && props.eventId !== '—') return props.eventId
  if (route?.params?.logId) return route.params.logId
  if (route?.params?.id) return route.params.id
  const r = rawRecord.value
  return r.audit?.id || r.audit_log_id || r.id || r.reference_id || '—'
})

const currentRecord = computed(() => {
  if (
    props.logData &&
    ((Array.isArray(props.logData) && props.logData.length > 0) ||
      (typeof props.logData === 'object' && Object.keys(props.logData).length > 0))
  ) {
    return props.logData
  }
  if (fetchedData.value) return fetchedData.value
  if (store.data && store.data.length > 0) {
    const found = store.data.find((d) => String(d.id || d.audit_log_id) === String(computedEventId.value))
    if (found) return found
  }
  return {}
})

const rawRecord = computed(() => unwrapRecord(currentRecord.value))

const hasRecord = computed(() => {
  const r = rawRecord.value
  return Boolean(
    r &&
      (r.audit ||
        r.id ||
        r.action ||
        r.audit_log_id ||
        r.summary ||
        r.target ||
        r.actor ||
        r.business_context ||
        r.changes ||
        r.request_context)
  )
})

/* ── data loading for standalone page route ─────────────────────── */
const loadRecordDetails = async () => {
  const unwrappedProp = unwrapRecord(props.logData)
  if (Object.keys(unwrappedProp).length > 0) {
    isInitialLoading.value = false
    return
  }

  const id = computedEventId.value
  if (id && id !== '—') {
    isInitialLoading.value = true
    try {
      const res = await store.fetchAuditDetails(id)
      if (res) fetchedData.value = res
    } catch (err) {
      console.error('Failed to load audit forensic record:', err)
    } finally {
      isInitialLoading.value = false
    }
  } else {
    isInitialLoading.value = false
  }
}

onMounted(async () => {
  if (!store.data.length) {
    store.fetchAuditLogs(true).catch(() => {})
  }
  await loadRecordDetails()
})

watch(
  () => [route?.params?.logId, route?.params?.id],
  () => {
    loadRecordDetails()
  }
)

/* ── core identifiers ───────────────────────────────────────────── */
const actionValue = computed(() => {
  const r = rawRecord.value
  const raw =
    r.audit?.action ||
    r.action ||
    r.action_name ||
    r.action_type ||
    r.event ||
    r.activity ||
    r.type ||
    r.reference_type ||
    'AUDIT_EVENT'
  return String(raw).replace(/ /g, '_').toUpperCase()
})

const entityValue = computed(() => {
  const r = rawRecord.value
  if (r.audit?.entity) return String(r.audit.entity).toUpperCase()
  if (r.target?.type) return String(r.target.type).toUpperCase()
  if (typeof r.entity === 'object' && r.entity?.type) return String(r.entity.type).toUpperCase()
  if (typeof r.entity === 'string' && r.entity.trim()) return r.entity.toUpperCase()
  if (r.entity_type) return String(r.entity_type).toUpperCase()
  if (r.reference_type) return String(r.reference_type).toUpperCase()
  const parts = actionValue.value.split('_')
  return parts.length > 1 ? parts.slice(1).join('_') : 'RECORD'
})

const moduleValue = computed(() => {
  const r = rawRecord.value
  if (r.audit?.module) return String(r.audit.module).toUpperCase()
  if (r.module) return String(r.module).toUpperCase()
  const act = actionValue.value
  const ent = entityValue.value
  if (/(WITHDRAWAL|DEPOSIT|PAYMENT|FINANCE|WALLET|COMMISSION|IB)/.test(act) || /(PAYMENT|WALLET|TRANSACTION)/.test(ent))
    return 'FINANCE'
  if (/(ROLE|PERMISSION|RBAC)/.test(act) || /(ROLE|PERMISSION)/.test(ent)) return 'RBAC'
  if (/(CLIENT|USER|PROFILE|KYC|STAFF|LEAD)/.test(act) || /(LEAD|CLIENT|USER|STAFF)/.test(ent)) return 'LEAD_MANAGEMENT'
  if (/(TRADE|TRADING|ACCOUNT)/.test(act) || /(TRADE|ACCOUNT)/.test(ent)) return 'TRADING'
  return 'SYSTEM'
})

const moduleDisplay = computed(() => (moduleValue.value ? titleCase(moduleValue.value) : '—'))

const isSuccess = (status) => ['success', 'completed', 'approved'].includes(String(status || '').toLowerCase())
const isFailed = (status) => ['failed', 'error', 'failure', 'rejected'].includes(String(status || '').toLowerCase())

const statusValue = computed(() => {
  const r = rawRecord.value
  const s = r.result?.status || r.result_status || r.status || r.details?.result_details?.status || 'SUCCESS'
  return String(s).toUpperCase()
})

const statusBadgeClass = computed(() => {
  if (isSuccess(statusValue.value)) return 'bg-primary-green/10 text-primary-green border border-primary-green/20'
  if (isFailed(statusValue.value)) return 'bg-primary-red/10 text-primary-red border border-primary-red/20'
  return 'bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20'
})

const statusDotClass = computed(() => {
  if (isSuccess(statusValue.value)) return 'bg-primary-green'
  if (isFailed(statusValue.value)) return 'bg-primary-red'
  return 'bg-primary-yellow'
})

const createdAt = computed(() => rawRecord.value.audit?.created_at || rawRecord.value.created_at || '—')
const formattedDateTime = computed(() => (createdAt.value !== '—' ? formatDate(createdAt.value) : '—'))

/* ── actor ──────────────────────────────────────────────────────── */
const actorInfo = computed(() => {
  const r = rawRecord.value
  const act = r.actor || r.details?.actor || {}
  const src = r.source || r.details?.source || {}
  const usr = r.user || r.details?.user || {}

  const name = act.name || src.name || usr.name || (r.created_by ? `User #${r.created_by}` : null) || 'System'
  const email = act.email || src.email || usr.email || '—'
  const role = act.role || src.role || usr.role || ''
  const id = act.id || src.user_id || usr.id || r.created_by || '—'
  const type = act.type || src.type || ''
  return { id, name, email, role, type }
})

const actorInitials = computed(() => {
  const name = actorInfo.value.name || 'SY'
  const parts = String(name).trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
})

/* ── source / actor rows ─────────────────────────────────────────── */
const sourceRows = computed(() => {
  const r = rawRecord.value
  const act = r.actor || r.details?.actor || {}
  const src = r.source || r.details?.source || {}
  const rows = []

  if (actorInfo.value.name && actorInfo.value.name !== 'System') {
    rows.push({ label: 'Actor Name', value: actorInfo.value.name })
  }
  if (actorInfo.value.role) {
    rows.push({ label: 'Actor Role', value: titleCase(actorInfo.value.role) })
  }
  if (actorInfo.value.id && actorInfo.value.id !== '—') {
    rows.push({ label: 'User ID', value: `#${actorInfo.value.id}` })
  }
  if (actorInfo.value.email && actorInfo.value.email !== '—') {
    rows.push({ label: 'Email', value: actorInfo.value.email })
  }
  if (act.type || src.type) {
    rows.push({ label: 'Actor Type', value: String(act.type || src.type).toUpperCase() })
  }
  if (src.user_id && String(src.user_id) !== String(actorInfo.value.id)) {
    rows.push({ label: 'Source User ID', value: `#${src.user_id}` })
  }
  if (src.name && src.name !== actorInfo.value.name) {
    rows.push({ label: 'Source Name', value: src.name })
  }
  if (src.email && src.email !== actorInfo.value.email) {
    rows.push({ label: 'Source Email', value: src.email })
  }
  if (r.created_by && String(r.created_by) !== String(actorInfo.value.id)) {
    rows.push({ label: 'Created By', value: `User #${r.created_by}` })
  }

  return rows
})

/* ── target ─────────────────────────────────────────────────────── */
const targetInfo = computed(() => {
  const r = rawRecord.value
  const target = r.target || r.details?.target || r.destination || {}
  const entity = r.audit?.entity || r.entity || {}
  const entityId = r.audit?.entity_id || r.entity_id || (typeof entity === 'object' ? entity.id : null) || target.id
  const account = r.account || r.details?.account || {}
  const bc = r.business_context || r.details?.business_context || {}

  const displayName =
    target.display_name ||
    target.name ||
    (bc.name ? `${titleCase(entityValue.value)} '${bc.name}'` : null) ||
    (entityId ? `${titleCase(entityValue.value)} #${entityId}` : null) ||
    (account.account_number ? `Account #${account.account_number}` : null) ||
    (r.reference_type && r.reference_id ? `${titleCase(r.reference_type)} #${r.reference_id}` : null) ||
    (entityValue.value ? `${titleCase(entityValue.value)} #${computedEventId.value}` : `Record #${computedEventId.value}`)

  const id = target.id || entityId || bc.payment_id || bc.lead_id || r.reference_id || r.id || computedEventId.value

  const subInfo =
    bc.lead_code ||
    bc.gateway ||
    (bc.country ? `Country: ${bc.country}` : null) ||
    (id && id !== '—' ? `ID: #${id}` : '')

  return { displayName, id, subInfo }
})

/* ── titles & hero icon ─────────────────────────────────────────── */
const googleHeroIcon = computed(() => {
  const act = actionValue.value
  const mod = moduleValue.value
  const ent = entityValue.value
  if (act.includes('DELETE') || act.includes('REMOVE')) return 'delete_forever'
  if (act.includes('CREATE') || act.includes('ADD') || act.includes('INSERT')) return 'note_add'
  if (act.includes('PASSWORD') || act.includes('AUTH') || act.includes('LOGIN')) return 'lock_reset'
  if (act.includes('PERMISSION') || act.includes('ROLE') || mod === 'RBAC') return 'admin_panel_settings'
  if (
    mod === 'FINANCE' ||
    act.includes('PAYMENT') ||
    act.includes('WITHDRAWAL') ||
    act.includes('DEPOSIT') ||
    act.includes('COMMISSION')
  )
    return 'account_balance_wallet'
  if (mod === 'TRADING' || act.includes('TRADE') || ent.includes('TRADE')) return 'monitoring'
  if (mod === 'LEAD_MANAGEMENT' || ent.includes('LEAD') || ent.includes('CLIENT') || ent.includes('USER'))
    return 'person_search'
  if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MODIFY')) return 'edit_note'
  return 'manage_search'
})

const displayTitle = computed(() => {
  const r = rawRecord.value
  if (r.title) return r.title
  const entName = titleCase(entityValue.value || 'Record')
  const actName = titleCase(actionValue.value)
  if (actName.toLowerCase() === 'update') return `${entName} Updated`
  if (actName.toLowerCase() === 'create') return `${entName} Created`
  if (actName.toLowerCase() === 'delete') return `${entName} Deleted`
  if (actName.toLowerCase() === 'assign') return `${entName} Assigned`
  if (actName.toLowerCase() === 'approve' || actName.toLowerCase() === 'approved') return `${entName} Approved`
  if (actName.toLowerCase() === 'reject' || actName.toLowerCase() === 'rejected') return `${entName} Rejected`
  if (actName.toLowerCase().replace(/\s+/g, '').includes(entName.toLowerCase().replace(/\s+/g, ''))) {
    return actName
  }
  return `${entName} ${actName}`.trim()
})

const displaySubtitle = computed(() => {
  const r = rawRecord.value
  if (r.summary) return r.summary
  if (r.description) return r.description
  const rows = mutationRows.value
  if (rows.length > 0) {
    const first = rows[0]
    return `${actorInfo.value.name} changed ${first.label.toLowerCase()} for ${targetInfo.value.displayName} from ${first.oldDisplay} to ${first.newDisplay}.`
  }
  return `${actorInfo.value.name} performed ${actionSummaryTitle.value} on ${targetInfo.value.displayName}.`
})

const actionSummaryTitle = computed(() => {
  const entName = titleCase(entityValue.value)
  const actName = titleCase(actionValue.value)
  if (actName.toLowerCase().replace(/[\s_]+/g, '').includes(entName.toLowerCase().replace(/[\s_]+/g, ''))) {
    return actName
  }
  return `${actName} ${entName}`.trim()
})

const actionSummarySub = computed(() => {
  const r = rawRecord.value
  if (r.summary) return r.summary
  if (mutationRows.value.length > 0) {
    return `${mutationRows.value.length} field${mutationRows.value.length > 1 ? 's' : ''} modified`
  }
  return 'Audit action executed successfully'
})

/* ── mutation rows ──────────────────────────────────────────────── */
const mutationRows = computed(() => {
  const r = rawRecord.value
  const rows = []

  const changes = r.changes || r.details?.changes
  if (changes && typeof changes === 'object' && !Array.isArray(changes) && Object.keys(changes).length > 0) {
    Object.entries(changes).forEach(([field, ch]) => {
      const oldVal = ch?.old !== undefined ? ch.old : ch?.previous !== undefined ? ch.previous : '—'
      const newVal = ch?.new !== undefined ? ch.new : ch?.current !== undefined ? ch.current : '—'
      rows.push({
        field,
        label: titleCase(field),
        oldDisplay: formatInlineValue(oldVal),
        newDisplay: formatInlineValue(newVal),
        description: `Field ${titleCase(field)} updated from ${formatInlineValue(oldVal)} to ${formatInlineValue(newVal)}.`
      })
    })
    return rows
  }

  if (Array.isArray(changes) && changes.length > 0) {
    changes.forEach((ch, idx) => {
      const field = ch.field || ch.name || `field_${idx + 1}`
      const oldVal = ch.old !== undefined ? ch.old : ch.previous !== undefined ? ch.previous : '—'
      const newVal = ch.new !== undefined ? ch.new : ch.current !== undefined ? ch.current : '—'
      rows.push({
        field,
        label: titleCase(field),
        oldDisplay: formatInlineValue(oldVal),
        newDisplay: formatInlineValue(newVal),
        description: `Field ${titleCase(field)} updated from ${formatInlineValue(oldVal)} to ${formatInlineValue(newVal)}.`
      })
    })
    return rows
  }

  if (r.balance_before !== undefined && r.balance_after !== undefined) {
    rows.push({
      field: 'wallet_balance',
      label: 'Wallet Balance',
      oldDisplay: `$${formatInlineNumber(r.balance_before)}`,
      newDisplay: `$${formatInlineNumber(r.balance_after)}`,
      description: 'Account balance adjusted after transaction.'
    })
    if (r.amount !== undefined) {
      rows.push({
        field: 'amount',
        label: 'Transaction Amount',
        oldDisplay: '$0.00',
        newDisplay: `$${formatInlineNumber(r.amount)}`,
        description: 'Transaction amount processed.'
      })
    }
    return rows
  }

  return rows
})

const firstChange = computed(() => mutationRows.value[0] || { oldDisplay: '—', newDisplay: '—', label: '' })
const changeMetricTitle = computed(() => {
  if (!mutationRows.value.length) return 'No Changes'
  return `${firstChange.value.oldDisplay} → ${firstChange.value.newDisplay}`
})
const changeMetricSub = computed(() => {
  const n = mutationRows.value.length
  if (n === 0) return 'No fields modified'
  return `${n} field${n !== 1 ? 's' : ''} modified`
})

const narrativeHighlightTitle = computed(() => {
  const f = firstChange.value
  if (f.label && f.oldDisplay !== '—') {
    return `${f.label} was changed from ${f.oldDisplay} to ${f.newDisplay}.`
  }
  return `Record ${actionValue.value.toLowerCase()} executed on ${targetInfo.value.displayName}.`
})
const narrativeHighlightDesc = computed(() => {
  const f = firstChange.value
  if (f.label && f.oldDisplay !== '—') {
    return `The ${f.label.toLowerCase()} for this record was updated from "${f.oldDisplay}" to "${f.newDisplay}".`
  }
  return rawRecord.value.summary || 'The record state was updated successfully in the audit ledger.'
})

/* ── request context / network ──────────────────────────────────── */
const reqCtx = computed(() => rawRecord.value.request_context || rawRecord.value.details?.request_context || {})
const ipAddress = computed(
  () => reqCtx.value.ip_address || rawRecord.value.ip_address || rawRecord.value.ip || '—'
)
const requestMethod = computed(() => reqCtx.value.http_method || rawRecord.value.http_method || '—')
const requestEndpoint = computed(() => reqCtx.value.endpoint || rawRecord.value.endpoint || '—')
const traceId = computed(
  () =>
    reqCtx.value.request_id ||
    rawRecord.value.request_id ||
    rawRecord.value.details?.business_context?.txid ||
    rawRecord.value.details?.business_context?.reference_id ||
    rawRecord.value.reference_id ||
    '—'
)
const userAgent = computed(() => reqCtx.value.user_agent || rawRecord.value.user_agent || '—')

const countryCodeToFlag = (cc) => {
  if (!cc || typeof cc !== 'string' || cc.length !== 2) return null
  try {
    const codePoints = cc
      .toUpperCase()
      .split('')
      .map((c) => 127397 + c.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  } catch {
    return null
  }
}

const countryFlag = computed(() => {
  const bc = rawRecord.value.business_context || {}
  const cc = bc.country || resolvedGeo.value.country_code
  if (cc && cc.length === 2) {
    return countryCodeToFlag(cc)
  }
  return null
})

const originLocationDisplay = computed(() => {
  const parts = [resolvedGeo.value.city, resolvedGeo.value.region, resolvedGeo.value.country].filter(Boolean)
  if (parts.length) return parts.join(', ')
  const bc = rawRecord.value.business_context || {}
  if (bc.country) return `Country: ${String(bc.country).toUpperCase()}`
  if (ipAddress.value && ipAddress.value !== '—') return `IP: ${ipAddress.value}`
  return '—'
})

const ispDisplay = computed(() => {
  if (resolvedGeo.value.isp) {
    return `${resolvedGeo.value.asn ? `${resolvedGeo.value.asn} ` : ''}${resolvedGeo.value.isp}`
  }
  if (resolvedGeo.value.asn) return resolvedGeo.value.asn
  return '—'
})

const parsedAgent = computed(() => {
  const ua = userAgent.value
  if (!ua || ua === '—') return { os: '—', device: '—', browser: '—' }

  const lowercase = ua.toLowerCase()
  let os = 'Unknown OS'
  let device = 'Desktop'

  if (lowercase.includes('windows nt 10.0') || lowercase.includes('windows 11')) {
    os = 'Windows 11 / 10'
    device = 'Windows PC'
  } else if (lowercase.includes('windows')) {
    os = 'Windows'
    device = 'Windows PC'
  } else if (lowercase.includes('macintosh') || lowercase.includes('mac os')) {
    os = 'macOS'
    device = 'Mac'
  } else if (lowercase.includes('android')) {
    os = 'Android'
    device = 'Mobile Device'
  } else if (lowercase.includes('iphone') || lowercase.includes('ipad')) {
    os = 'iOS'
    device = lowercase.includes('ipad') ? 'iPad' : 'iPhone'
  } else if (lowercase.includes('linux')) {
    os = 'Linux'
    device = 'Linux Station'
  }

  let browser = 'Unknown Browser'
  if (lowercase.includes('edg/')) browser = 'Microsoft Edge'
  else if (lowercase.includes('opr/') || lowercase.includes('opera')) browser = 'Opera'
  else if (lowercase.includes('chrome') && !lowercase.includes('edg')) browser = 'Google Chrome'
  else if (lowercase.includes('safari') && !lowercase.includes('chrome')) browser = 'Apple Safari'
  else if (lowercase.includes('firefox')) browser = 'Mozilla Firefox'

  return { os, device, browser }
})

/* ── destination rows (100% dynamic from data.destination & data.target) ─ */
const destinationRows = computed(() => {
  const r = rawRecord.value
  const dest = r.destination || r.details?.destination || {}
  const target = r.target || r.details?.target || {}
  const account = r.account || r.details?.account || {}
  const rows = []

  // 1. If data.destination exists with properties
  if (dest && typeof dest === 'object' && Object.keys(dest).length > 0) {
    if (dest.name) {
      rows.push({ label: 'Destination Name', value: dest.name })
    }
    if (dest.role) {
      rows.push({ label: 'Role', value: titleCase(dest.role) })
    }
    if (dest.user_id || dest.id) {
      rows.push({ label: 'User ID', value: `#${dest.user_id || dest.id}` })
    }
    if (dest.email) {
      rows.push({ label: 'Email', value: dest.email })
    }
    if (dest.type) {
      rows.push({ label: 'Type', value: String(dest.type).toUpperCase() })
    }
    if (dest.account_number || dest.account) {
      rows.push({ label: 'Account Number', value: String(dest.account_number || dest.account) })
    }
    if (dest.wallet_id || dest.wallet) {
      rows.push({ label: 'Wallet', value: String(dest.wallet_id || dest.wallet) })
    }

    // Dynamic keys from destination
    Object.entries(dest).forEach(([key, val]) => {
      if (val !== null && val !== undefined && typeof val !== 'object' && String(val).trim() !== '') {
        const isStandard = ['name', 'role', 'user_id', 'id', 'email', 'type', 'account_number', 'account', 'wallet_id', 'wallet'].includes(key.toLowerCase())
        if (!isStandard) {
          const label = titleCase(key)
          if (!rows.some((existing) => existing.label.toLowerCase() === label.toLowerCase() || existing.label.toLowerCase() === `destination ${label.toLowerCase()}`)) {
            rows.push({
              label,
              value: String(val),
              mono: /id|code|ip|txid|hash|token/i.test(key)
            })
          }
        }
      }
    })
  }

  // 2. If data.destination was empty / null, fallback to target entity info
  if (rows.length === 0) {
    if (targetInfo.value.displayName) {
      rows.push({ label: 'Target Name', value: targetInfo.value.displayName })
    }
    if (entityValue.value && entityValue.value !== '—') {
      rows.push({ label: 'Entity Type', value: entityValue.value })
    }
    if (moduleDisplay.value && moduleDisplay.value !== '—') {
      rows.push({ label: 'Module', value: moduleDisplay.value })
    }
    if (targetInfo.value.id && targetInfo.value.id !== '—') {
      rows.push({ label: 'Internal ID', value: `#${targetInfo.value.id}` })
    }
    if (target.type && target.type.toUpperCase() !== entityValue.value) {
      rows.push({ label: 'Target Type', value: String(target.type).toUpperCase() })
    }
    if (account.account_number) {
      rows.push({ label: 'Account Number', value: String(account.account_number) })
    }
  }

  return rows
})

/* ── business rows (100% strictly mirrors data.business_context) ─── */
const businessRows = computed(() => {
  const r = rawRecord.value
  const bc = r.business_context || r.details?.business_context || {}
  const rows = []

  if (bc && typeof bc === 'object') {
    Object.entries(bc).forEach(([key, val]) => {
      if (val === null || val === undefined) return
      if (typeof val === 'object') {
        if (Array.isArray(val) && val.length > 0) {
          rows.push({
            label: titleCase(key),
            value: val.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', '),
            mono: true
          })
        } else if (!Array.isArray(val) && Object.keys(val).length > 0) {
          const entries = Object.entries(val).filter(
            ([, v]) => v !== null && v !== undefined && typeof v !== 'object' && String(v).trim() !== ''
          )
          if (entries.length > 0) {
            const str = entries.map(([k, v]) => `${titleCase(k)}: ${v}`).join(' | ')
            rows.push({
              label: titleCase(key),
              value: str,
              mono: false
            })
          }
        }
      } else if (String(val).trim() !== '') {
        rows.push({
          label: titleCase(key),
          value: String(val),
          mono: /id|code|ip|txid|hash|token/i.test(key)
        })
      }
    })
  }

  return rows
})

/* ── JSON viewer ────────────────────────────────────────────────── */
const formattedJsonLines = computed(() => {
  try {
    const str = JSON.stringify(rawRecord.value, null, 2)
    return str ? str.split('\n') : []
  } catch {
    return []
  }
})

const highlightJsonLine = (line) => {
  if (!line) return ''
  const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (m, str, colon, lit, num) => {
      if (str) return colon ? `<span class="text-[#93C5FD]">${str}</span>${colon}` : `<span class="text-[#FB923C]">${str}</span>`
      if (lit) return `<span class="text-[#FBBF24]">${lit}</span>`
      if (num) return `<span class="text-[#34D399]">${num}</span>`
      return m
    }
  )
}
</script>

<style scoped>
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Sleek custom scrollbars */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary-border, rgba(148, 163, 184, 0.4)) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-primary-border, rgba(148, 163, 184, 0.4));
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary, #3b82f6);
}
</style>
