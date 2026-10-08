<template>
  <div class="space-y-6 pb-12">
    <!-- Breadcrumb & Top Action Header -->
    <div class="bg-card-background rounded-lg p-6 space-y-4">
      <!-- Main Event Title & Dynamic Badges Bar -->
      <div class="">
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <span class="font-mono text-primary font-bold text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            #LOG-{{ eventId }}
          </span>
          <span class="text-xs font-bold text-secondary-text uppercase tracking-wider">
            {{ moduleValue }} <span v-if="entityValue">/ {{ entityValue }}</span>
          </span>
          <span
            class="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase"
            :class="getStatusClass(statusValue)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(statusValue)"></span>
            {{ statusValue }}
          </span>
          <span v-if="currentData.audit_log_id" class="inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text">
            Audit ID: #{{ currentData.audit_log_id }}
          </span>
          <span v-if="requestContext.http_method" class="inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text uppercase">
            {{ requestContext.http_method }}
          </span>
          <span v-if="actorUser.role" class="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text capitalize">
            Role: {{ actorUser.role }}
          </span>
        </div>

        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 class="text-2xl lg:text-3xl font-extrabold text-primary-text tracking-tight uppercase">
              {{ formatAction(actionValue) }}
            </h1>
            <p class="text-xs text-secondary-text mt-1 max-w-3xl leading-relaxed">
              {{ summaryText || `Action ${formatAction(actionValue)} logged for ${targetSpecs.displayName}` }}
            </p>
          </div>
        </div>

        <!-- Date & TXID Info Bar -->
        <div class="flex items-center gap-3 text-xs text-secondary-text mt-3 flex-wrap font-mono">
          <span class="flex items-center gap-1.5">
            <Clock class="w-3.5 h-3.5 text-secondary-text" />
            {{ formatDate(createdAt) }}
          </span>
          <span>•</span>
          <span class="text-primary font-semibold">{{ relativeTimeText }}</span>
          <span v-if="txidOrRequestId">•</span>
          <span v-if="txidOrRequestId" class="flex items-center gap-1.5 text-secondary-text">
            <span>Trace ID:</span>
            <span class="text-primary-text font-bold select-all">{{ txidOrRequestId }}</span>
            <button
              type="button"
              class="text-secondary-text hover:text-primary transition p-0.5 cursor-pointer ml-0.5"
              title="Copy Trace ID"
              @click="copyText(txidOrRequestId, 'Trace ID')"
            >
              <Copy class="w-3 h-3" />
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.detailLoading && !currentData.action && !currentData.summary" class="space-y-6 animate-pulse">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-6 h-36 bg-card-background rounded-lg"></div>
        <div class="lg:col-span-6 h-36 bg-card-background rounded-lg"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-4 h-96 bg-card-background rounded-lg"></div>
        <div class="lg:col-span-5 h-96 bg-card-background rounded-lg"></div>
        <div class="lg:col-span-3 h-96 bg-card-background rounded-lg"></div>
      </div>
    </div>

    <template v-else>
      <!-- SECTION 1: EXECUTIVE SYNOPSIS & 4 TOP METRIC CARDS -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Executive Synopsis (6 cols) -->
        <div class="lg:col-span-6 bg-card-background rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <FileText class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Executive Synopsis</span>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text">
                {{ requestContext.endpoint ? `Endpoint: ${requestContext.endpoint}` : `Module: ${moduleValue}` }}
              </span>
            </div>

            <p class="text-xs text-primary-text font-medium leading-relaxed">
              <template v-if="summaryText">
                {{ summaryText }}
              </template>
              <template v-else>
                Actor <span class="font-bold text-primary">{{ actorUser.name }}</span>
                <span v-if="actorUser.id" class="text-secondary-text font-mono"> (ID #{{ actorUser.id }})</span>
                {{ synopsisActionVerb }}
                <span class="font-bold text-primary-text">{{ targetSpecs.displayName || entityValue }}</span>
                <span v-if="targetSpecs.id" class="font-mono text-secondary-text"> (#{{ targetSpecs.id }})</span>
                <template v-if="ipAddress">
                  originating from IP <span class="font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/20">{{ ipAddress }}</span>
                  <span v-if="resolvedLocationText" class="text-secondary-text font-semibold"> ({{ resolvedLocationText }})</span>
                </template>
                <span v-if="actorUser.role"> under <span class="font-semibold text-primary capitalize">{{ actorUser.role }}</span> role</span>.
              </template>
            </p>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-primary-border/70 text-xs">
            <div>
              <span class="text-[9px] font-bold text-secondary-text uppercase block">HTTP Method</span>
              <span class="text-[11px] font-semibold text-primary-text font-mono block">
                {{ requestContext.http_method || 'API / DIRECT' }}
              </span>
            </div>
            <div>
              <span class="text-[9px] font-bold text-secondary-text uppercase block">Actor Role</span>
              <span class="text-[11px] font-semibold text-primary capitalize truncate block">
                {{ actorUser.role || actorUser.type || 'Authenticated User' }}
              </span>
            </div>
            <div>
              <span class="text-[9px] font-bold text-secondary-text uppercase block">Result Status</span>
              <span
                class="text-[11px] font-semibold flex items-center gap-1 uppercase"
                :class="isSuccess(statusValue) ? 'text-primary-green' : isFailed(statusValue) ? 'text-primary-red' : 'text-primary-yellow'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(statusValue)"></span>
                {{ statusValue }}
              </span>
            </div>
          </div>
        </div>

        <!-- 4 KPI Metrics Grid (6 cols -> 2x2 grid) -->
        <div class="lg:col-span-6 grid grid-cols-2 gap-3">
          <!-- Card 1: Dynamic Primary Payload Value / Scope -->
          <div class="bg-card-background rounded-lg p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">{{ kpiMetric1.label }}</span>
              <Layers class="w-3.5 h-3.5 text-primary" />
            </div>
            <div class="my-1">
              <h3 class="text-xl font-extrabold text-primary-text tracking-tight truncate" :title="kpiMetric1.value">
                {{ kpiMetric1.value }}
              </h3>
              <p class="text-[10px] text-secondary-text truncate mt-0.5" :title="kpiMetric1.subtext">
                {{ kpiMetric1.subtext }}
              </p>
            </div>
            <span class="text-[9px] font-semibold text-primary-green flex items-center gap-1">
              <Check class="w-3 h-3" /> {{ kpiMetric1.footer }}
            </span>
          </div>

          <!-- Card 2: Execution Status & Health -->
          <div class="bg-card-background rounded-lg p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Execution Status</span>
              <span
                class="text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase"
                :class="getStatusClass(statusValue)"
              >
                {{ statusValue }}
              </span>
            </div>
            <div class="my-1">
              <h3
                class="text-xl font-extrabold tracking-tight uppercase"
                :class="isSuccess(statusValue) ? 'text-primary-green' : isFailed(statusValue) ? 'text-primary-red' : 'text-primary-yellow'"
              >
                {{ isSuccess(statusValue) ? 'SUCCESS' : statusValue }}
              </h3>
              <p class="text-[10px] text-secondary-text truncate mt-0.5">
                {{ requestContext.endpoint ? `${requestContext.http_method || 'GET'} • ${requestContext.endpoint}` : `Module: ${moduleValue}` }}
              </p>
            </div>
            <span class="text-[9px] text-secondary-text">
              {{ isSuccess(statusValue) ? 'Action processed successfully' : 'Action flagged / pending' }}
            </span>
          </div>

          <!-- Card 3: Actor & Authentication -->
          <div class="bg-card-background rounded-lg p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Actor Identity</span>
              <KeyRound class="w-3.5 h-3.5 text-primary" />
            </div>
            <div class="my-1">
              <h3 class="text-sm font-bold text-primary-text truncate" :title="actorUser.name">
                {{ actorUser.name }}
              </h3>
              <p class="text-[10px] text-secondary-text truncate mt-0.5">
                {{ actorUser.role ? `Role: ${actorUser.role}` : (actorUser.id ? `UID #${actorUser.id}` : 'Authenticated Actor') }}
              </p>
            </div>
            <span class="text-[9px] font-semibold text-primary flex items-center gap-1 truncate" :title="actorUser.email || `Actor ID #${actorUser.id}`">
              <ShieldCheck class="w-3 h-3 text-primary shrink-0" />
              <span class="truncate">{{ actorUser.email || (actorUser.id ? `Actor ID #${actorUser.id}` : 'Internal System') }}</span>
            </span>
          </div>

          <!-- Card 4: Audit Tracking & Request ID -->
          <div class="bg-card-background rounded-lg p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Trace ID</span>
              <button
                v-if="txidOrRequestId"
                type="button"
                class="text-secondary-text hover:text-primary transition p-0.5 cursor-pointer"
                title="Copy Trace ID"
                @click="copyText(txidOrRequestId, 'Trace ID')"
              >
                <Copy class="w-3 h-3" />
              </button>
            </div>
            <div class="my-1">
              <h3 class="text-xs font-mono font-bold text-primary-text truncate" :title="txidOrRequestId || `#LOG-${eventId}`">
                {{ txidOrRequestId ? truncateMiddle(txidOrRequestId, 10, 6) : `#LOG-${eventId}` }}
              </h3>
              <p class="text-[10px] text-secondary-text truncate mt-0.5">
                Audit Log #{{ currentData.audit_log_id || eventId }}
              </p>
            </div>
            <span class="text-[9px] font-semibold text-primary-blue flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-blue"></span>
              {{ moduleValue }} • {{ entityValue }}
            </span>
          </div>
        </div>
      </div>

      <!-- SECTION 2: 3-COLUMN MAIN WORKSPACE (Full Screen Width) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- ================= COLUMN 1: Actor Identity, Destination & Network (4 cols) ================= -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- Actor Identity Profile Card -->
          <div class="bg-card-background rounded-lg p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-base shrink-0">
                  {{ userInitial }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <h4 class="text-sm font-bold text-primary-text truncate">
                      {{ actorUser.name }}
                    </h4>
                    <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 uppercase">
                      {{ actorUser.role || actorUser.type || 'ACTOR' }}
                    </span>
                  </div>
                  <p class="text-xs text-secondary-text truncate font-mono mt-0.5">
                    {{ actorUser.email || (actorUser.id ? `Actor ID #${actorUser.id}` : 'Authenticated Actor') }}
                  </p>
                </div>
              </div>
            </div>

            <div class="divide-y divide-primary-border/60 text-xs pt-1">
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Actor UID</span>
                <span class="font-mono font-bold text-primary-text text-[11px]">UID-{{ actorUser.id || 'N/A' }}</span>
              </div>
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Account Role</span>
                <span class="font-semibold text-primary capitalize text-[11px]">{{ actorUser.role || 'Authorized Agent' }}</span>
              </div>
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Actor Type</span>
                <span class="font-mono font-semibold text-primary-text text-[11px] uppercase">{{ actorUser.type || 'USER' }}</span>
              </div>
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Event Time</span>
                <span class="text-primary-text text-[11px] font-medium">{{ formatDate(createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Destination Target Profile Card (When present in API) -->
          <div v-if="destinationFlow" class="bg-card-background rounded-lg p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Hash class="w-4 h-4 text-primary" />
                <span>Destination Target</span>
              </div>
              <span v-if="destinationFlow.role" class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 uppercase">
                {{ destinationFlow.role }}
              </span>
            </div>

            <div class="divide-y divide-primary-border/60 text-xs">
              <div class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Target Name</span>
                <span class="font-bold text-primary-text text-[11px]">{{ destinationFlow.title }}</span>
              </div>
              <div v-if="destinationFlow.subtitle" class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Email / Account</span>
                <span class="font-mono text-primary-text text-[11px] select-all">{{ destinationFlow.subtitle }}</span>
              </div>
              <div v-if="destinationFlow.userId" class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Target UID</span>
                <span class="font-mono font-bold text-primary text-[11px]">#{{ destinationFlow.userId }}</span>
              </div>
              <div v-if="destinationFlow.accountName" class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Account Name</span>
                <span class="text-primary-text text-[11px] font-medium">{{ destinationFlow.accountName }}</span>
              </div>
            </div>
          </div>

          <!-- Network Origin & Interactive Leaflet Map (if IP available) -->
          <div class="bg-card-background rounded-lg p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Globe class="w-4 h-4 text-primary" />
                <span>Network Origin</span>
              </div>
              <span v-if="ipAddress" class="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {{ ipAddress }}
              </span>
              <span v-else class="text-[10px] text-secondary-text font-mono">
                No IP Logged
              </span>
            </div>

            <!-- Leaflet Map Container -->
            <AuditLogNetworkMap
              :ip-address="ipAddress"
              @geo-resolved="onGeoResolved"
            />

            <!-- Network Details Grid -->
            <div class="grid grid-cols-2 gap-2 text-xs pt-1">
              <div class="bg-background/60 p-2.5 rounded-lg border border-primary-border/60">
                <span class="text-[9px] font-bold text-secondary-text uppercase block">Origin Location</span>
                <span class="font-semibold text-primary-text text-[11px] truncate block" :title="resolvedLocationText || 'Resolving...'">
                  {{ resolvedLocationText || (ipAddress ? 'Resolving...' : 'Not Recorded') }}
                </span>
              </div>
              <div class="bg-background/60 p-2.5 rounded-lg border border-primary-border/60">
                <span class="text-[9px] font-bold text-secondary-text uppercase block">HTTP Method</span>
                <span class="font-semibold text-primary-text text-[11px] font-mono block">
                  {{ requestContext.http_method || 'API / DIRECT' }}
                </span>
              </div>
              <div class="bg-background/60 p-2.5 rounded-lg border border-primary-border/60 sm:col-span-2">
                <span class="text-[9px] font-bold text-secondary-text uppercase block">ISP / Network Host</span>
                <span class="font-semibold text-primary-text text-[11px] truncate block" :title="autonomousSystemText">
                  {{ autonomousSystemText }}
                </span>
              </div>
            </div>
          </div>

          <!-- Client Hardware & Environment -->
          <div v-if="userAgent" class="bg-card-background rounded-lg p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Laptop class="w-4 h-4 text-primary" />
                <span>Client Environment</span>
              </div>
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                Parsed Agent
              </span>
            </div>

            <div class="divide-y divide-primary-border/60 text-xs">
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Device Model</span>
                <span class="font-semibold text-primary-text text-[11px] text-right">{{ parsedUserAgent.device }}</span>
              </div>
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Operating System</span>
                <span class="font-semibold text-primary-text text-[11px] text-right">{{ parsedUserAgent.os }}</span>
              </div>
              <div class="py-2.5 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Client Browser</span>
                <span class="font-semibold text-primary-text text-[11px] text-right">{{ parsedUserAgent.browser }}</span>
              </div>
              <div v-if="requestContext.request_id" class="py-2.5 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase">Request ID</span>
                <span class="font-mono text-primary-text text-[11px] text-right">{{ truncateMiddle(requestContext.request_id, 8, 6) }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- ================= COLUMN 2: Execution Lifecycle & Dynamic Specs (5 cols) ================= -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Event Execution Flow Timeline -->
          <div class="bg-card-background rounded-lg p-6 space-y-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Activity class="w-4 h-4 text-primary" />
                <span>Execution Lifecycle</span>
              </div>
              <span
                class="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase"
                :class="getStatusClass(statusValue)"
              >
                {{ statusValue }}
              </span>
            </div>

            <!-- Step Timeline List -->
            <div class="relative pl-6 space-y-6 border-l-2 border-primary/20 ml-2">
              
              <!-- Step 1: Actor Initiation -->
              <div class="relative">
                <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[9px] shadow-sm">
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <div class="flex items-baseline justify-between">
                  <h5 class="text-xs font-bold text-primary-text">1. Actor Initiation</h5>
                  <span class="text-[10px] font-mono text-secondary-text">{{ formatTime(createdAt) }}</span>
                </div>
                <p class="text-[11px] text-secondary-text mt-0.5 leading-snug">
                  {{ actorUser.name }} triggered {{ formatAction(actionValue) }} for {{ targetSpecs.displayName }}.
                </p>
                <div v-if="actorUser.role || actorUser.id" class="mt-1.5">
                  <span class="text-[10px] font-mono text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20 inline-flex items-center gap-1">
                    <Key class="w-3 h-3" /> Actor Role: {{ actorUser.role || 'USER' }} (ID #{{ actorUser.id || 'N/A' }})
                  </span>
                </div>
              </div>

              <!-- Step 2: Ingress & Endpoint Execution -->
              <div class="relative">
                <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[9px] shadow-sm">
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <div class="flex items-baseline justify-between">
                  <h5 class="text-xs font-bold text-primary-text">2. Endpoint Dispatch</h5>
                  <span class="text-[10px] font-mono text-secondary-text">{{ formatTime(createdAt, 1) }}</span>
                </div>
                <p class="text-[11px] text-secondary-text mt-0.5 leading-snug">
                  {{ flowStep2Text }}
                </p>
                <div v-if="requestContext.endpoint" class="mt-1.5 flex items-center gap-2">
                  <span class="text-[10px] font-mono text-secondary-text bg-background px-2 py-0.5 rounded border border-primary-border flex items-center gap-1">
                    <span class="font-bold text-primary">{{ requestContext.http_method || 'CALL' }}</span> {{ requestContext.endpoint }}
                  </span>
                </div>
              </div>

              <!-- Step 3: Target Mutation / State Application -->
              <div class="relative">
                <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[9px] shadow-sm">
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <div class="flex items-baseline justify-between">
                  <h5 class="text-xs font-bold text-primary-text">3. State Mutation & Routing</h5>
                  <span class="text-[10px] font-mono text-secondary-text">{{ formatTime(createdAt, 2) }}</span>
                </div>
                <p class="text-[11px] text-secondary-text mt-0.5 leading-snug">
                  {{ flowStep3Text }}
                </p>
                <div v-if="accountBrokerGroup || businessContext.gateway || businessContext.network" class="mt-1.5">
                  <span class="text-[10px] font-mono text-secondary-text bg-background px-2 py-0.5 rounded border border-primary-border inline-flex items-center gap-1">
                    <Layers class="w-3 h-3" /> Channel: {{ accountBrokerGroup || businessContext.gateway || businessContext.network }}
                  </span>
                </div>
              </div>

              <!-- Step 4: Result Confirmation -->
              <div class="relative">
                <div class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm" :class="isSuccess(statusValue) ? 'bg-primary-green' : 'bg-primary-yellow'">
                  <Check class="w-2.5 h-2.5 text-white" />
                </div>
                <div class="flex items-baseline justify-between">
                  <h5 class="text-xs font-bold" :class="isSuccess(statusValue) ? 'text-primary-green' : 'text-primary-yellow'">
                    4. Result Confirmation
                  </h5>
                  <span class="text-[10px] font-mono text-secondary-text">{{ formatTime(createdAt, 3) }}</span>
                </div>
                <p class="text-[11px] text-secondary-text mt-0.5 leading-snug">
                  Audit action recorded under Log #{{ currentData.audit_log_id || eventId }} with result: <strong class="text-primary-text uppercase">{{ statusValue }}</strong>.
                </p>
                <div class="mt-1.5">
                  <span
                    class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase inline-block"
                    :class="getStatusClass(statusValue)"
                  >
                    Status: {{ statusValue }}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <!-- Target Specifications Card -->
          <div class="bg-card-background rounded-lg p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Hash class="w-4 h-4 text-primary" />
                <span>Target Specifications</span>
              </div>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase">
                {{ targetSpecs.type || entityValue }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-background/60 p-3.5 rounded-lg border border-primary-border/60">
                <span class="text-[9px] font-bold text-secondary-text uppercase block">Target Display Name</span>
                <h4 class="text-sm font-bold text-primary-text mt-0.5 truncate" :title="targetSpecs.displayName">
                  {{ targetSpecs.displayName }}
                </h4>
                <p class="text-[10px] text-secondary-text mt-0.5">
                  {{ entityValue }} Record
                </p>
              </div>

              <div class="bg-background/60 p-3.5 rounded-lg border border-primary-border/60">
                <span class="text-[9px] font-bold text-secondary-text uppercase block">Target / Entity ID</span>
                <h4 class="text-sm font-mono font-bold text-primary mt-0.5">
                  #{{ targetSpecs.id || entityIdValue || eventId }}
                </h4>
                <p class="text-[10px] text-secondary-text mt-0.5">
                  Internal Identifier
                </p>
              </div>
            </div>

            <!-- Execution / Routing Group Box (if available) -->
            <div v-if="accountBrokerGroup || businessContext.gateway" class="bg-background/40 p-3.5 rounded-lg border border-primary-border/60 space-y-1">
              <span class="text-[9px] font-bold text-secondary-text uppercase block">Execution / Broker Group</span>
              <p class="text-xs font-mono font-bold text-primary break-all">
                {{ accountBrokerGroup || businessContext.gateway }}
              </p>
            </div>
          </div>

          <!-- Dynamic RBAC Permission Codes (if present in API) -->
          <div v-if="permissionCodes.length > 0" class="bg-card-background rounded-lg p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Key class="w-4 h-4 text-primary" />
                <span>Role Permissions Assigned</span>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {{ permissionCodes.length }} Permissions
              </span>
            </div>

            <div class="relative">
              <input
                v-model="permissionSearch"
                type="text"
                placeholder="Search permission codes (e.g. withdrawal.approve)..."
                class="w-full bg-background border border-primary-border rounded-lg px-3 py-1.5 text-xs text-primary-text placeholder-secondary-text/50 outline-none focus:border-primary"
              />
            </div>

            <div class="max-h-60 overflow-y-auto flex flex-wrap gap-1.5 p-1">
              <span
                v-for="code in filteredPermissionCodes"
                :key="code"
                class="text-[10px] font-mono font-medium px-2 py-0.8 rounded-md bg-background border border-primary-border/80 text-primary-text hover:border-primary transition select-all"
              >
                {{ code }}
              </span>
            </div>
          </div>

          <!-- Dynamic Context Items -->
          <div v-if="dynamicContextItems.length > 0" class="bg-card-background rounded-lg p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Layers class="w-4 h-4 text-primary" />
                <span>Business Context Parameters</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div
                v-for="item in dynamicContextItems"
                :key="item.label"
                class="bg-background/60 p-2.5 rounded-lg border border-primary-border/60 space-y-1"
                :class="item.fullWidth ? 'sm:col-span-2' : ''"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-bold text-secondary-text uppercase">{{ item.label }}</span>
                  <button
                    v-if="item.isCopyable"
                    type="button"
                    class="text-secondary-text hover:text-primary transition p-0.5 cursor-pointer"
                    title="Copy"
                    @click="copyText(item.value, item.label)"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
                <p class="font-semibold text-primary-text text-[11px] break-all select-all font-mono">
                  {{ item.value }}
                </p>
              </div>
            </div>
          </div>

          <!-- Dynamic Changes Diff (Before / After) -->
          <div v-if="changedFields && changedFields.length > 0" class="bg-card-background rounded-lg p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <FileCode class="w-4 h-4 text-primary" />
                <span>Database State Mutation Diff</span>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {{ changedFields.length }} fields modified
              </span>
            </div>

            <div class="space-y-3">
              <div
                v-for="field in changedFields"
                :key="field.key"
                class="border border-primary-border rounded-lg p-3 bg-background/50 space-y-2 text-xs"
              >
                <div class="font-mono font-bold text-primary text-[11px] flex items-center justify-between">
                  <span>{{ field.key }}</span>
                  <span class="text-[9px] text-secondary-text uppercase">Field Diff</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-[11px]">
                  <div class="bg-primary-red/5 border border-primary-red/20 rounded-lg p-2">
                    <span class="text-[9px] font-bold text-primary-red uppercase block">Previous Value</span>
                    <span class="font-mono text-secondary-text break-all block mt-0.5">{{ formatValue(field.oldValue) }}</span>
                  </div>
                  <div class="bg-primary-green/5 border border-primary-green/20 rounded-lg p-2">
                    <span class="text-[9px] font-bold text-primary-green uppercase block">New Value</span>
                    <span class="font-mono text-primary-text font-bold break-all block mt-0.5">{{ formatValue(field.newValue) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ================= COLUMN 3: Raw Payload & Audit Record Metadata (3 cols) ================= -->
        <div class="lg:col-span-3 space-y-6">
          
          <!-- Raw Payload & Action Trace Box -->
          <div class="bg-card-background rounded-lg p-5 space-y-4">
            <!-- Tab Headers -->
            <div class="flex items-center justify-between border-b border-primary-border pb-3">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="text-xs font-bold transition pb-1 border-b-2 cursor-pointer"
                  :class="payloadTab === 'json' ? 'border-primary text-primary' : 'border-transparent text-secondary-text hover:text-primary-text'"
                  @click="payloadTab = 'json'"
                >
                  Raw Payload (JSON)
                </button>
                <button
                  type="button"
                  class="text-xs font-bold transition pb-1 border-b-2 cursor-pointer"
                  :class="payloadTab === 'cascade' ? 'border-primary text-primary' : 'border-transparent text-secondary-text hover:text-primary-text'"
                  @click="payloadTab = 'cascade'"
                >
                  Action Trace
                </button>
              </div>

              <button
                type="button"
                class="text-secondary-text hover:text-primary transition p-1 cursor-pointer"
                title="Copy Raw JSON"
                @click="copyText(JSON.stringify(currentData, null, 2), 'Raw Payload')"
              >
                <Copy class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Tab 1: Code / JSON Preview -->
            <div v-if="payloadTab === 'json'" class="space-y-3">
              <div class="flex items-center justify-between text-[10px] font-mono text-secondary-text">
                <span>payload.event.json</span>
                <span>{{ actionValue }}</span>
              </div>

              <div class="bg-background rounded-lg p-3 border border-primary-border max-h-96 overflow-y-auto font-mono text-[11px] leading-relaxed select-all">
                <pre class="text-primary-text whitespace-pre-wrap break-all">{{ JSON.stringify(currentData, null, 2) }}</pre>
              </div>

              <!-- Audit Record Status -->
              <div class="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-primary shrink-0" />
                <div class="min-w-0">
                  <p class="text-[11px] font-bold text-primary-text leading-tight">
                    Audit Record Logged
                  </p>
                  <p class="text-[9px] font-mono text-secondary-text truncate mt-0.5">
                    Module: {{ moduleValue }} • Action: {{ actionValue }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Tab 2: Action Trace Tree View -->
            <div v-else class="space-y-3">
              <div class="text-[10px] font-mono text-secondary-text">
                Hierarchical Action Trace
              </div>

              <div class="space-y-2 text-xs">
                <div class="p-2.5 rounded-lg bg-background border border-primary-border">
                  <span class="text-[9px] font-bold text-primary uppercase block">Actor (Source)</span>
                  <p class="font-mono text-primary-text font-semibold text-[11px] mt-0.5">
                    {{ actorUser.name }} (#{{ actorUser.id || 'N/A' }})
                  </p>
                  <span class="text-[10px] text-secondary-text">{{ actorUser.email || actorUser.role }}</span>
                </div>

                <div class="p-2.5 rounded-lg bg-background border border-primary-border">
                  <span class="text-[9px] font-bold text-primary uppercase block">Action</span>
                  <p class="font-mono text-primary-text font-bold text-[11px] mt-0.5">
                    {{ formatAction(actionValue) }}
                  </p>
                  <span class="text-[10px] text-secondary-text">Module: {{ moduleValue }}</span>
                </div>

                <div v-if="destinationFlow" class="p-2.5 rounded-lg bg-background border border-primary-border">
                  <span class="text-[9px] font-bold text-primary uppercase block">Destination Target</span>
                  <p class="font-mono text-primary-text font-semibold text-[11px] mt-0.5">
                    {{ destinationFlow.title }} (#{{ destinationFlow.userId || 'N/A' }})
                  </p>
                  <span class="text-[10px] text-secondary-text">{{ destinationFlow.subtitle }}</span>
                </div>

                <div class="p-2.5 rounded-lg bg-background border border-primary-border">
                  <span class="text-[9px] font-bold text-primary uppercase block">Target Entity</span>
                  <p class="font-mono text-primary-text font-semibold text-[11px] mt-0.5">
                    {{ targetSpecs.displayName }}
                  </p>
                  <span class="text-[10px] text-secondary-text">Entity ID: #{{ targetSpecs.id }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Audit Record Metadata Box -->
          <div class="bg-card-background rounded-lg p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <ShieldCheck class="w-4 h-4 text-primary" />
                <span>Audit Metadata</span>
              </div>
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 uppercase">
                {{ statusValue }}
              </span>
            </div>

            <div class="divide-y divide-primary-border/60 text-xs font-mono">
              <div class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase font-sans">Audit Log ID</span>
                <span class="font-bold text-primary-text text-[11px]">#{{ currentData.audit_log_id || eventId }}</span>
              </div>
              <div class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase font-sans">Module</span>
                <span class="font-semibold text-primary text-[11px]">{{ moduleValue }}</span>
              </div>
              <div class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase font-sans">Entity Type</span>
                <span class="text-primary-text text-[11px]">{{ entityValue }}</span>
              </div>
              <div v-if="requestContext.endpoint" class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase font-sans">Endpoint</span>
                <span class="text-primary-text text-[11px] truncate max-w-[150px]" :title="requestContext.endpoint">{{ requestContext.endpoint }}</span>
              </div>
              <div v-if="requestContext.request_id" class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase font-sans">Request ID</span>
                <span class="text-primary-text text-[11px]">{{ truncateMiddle(requestContext.request_id, 6, 4) }}</span>
              </div>
              <div v-if="ipAddress" class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase font-sans">IP Address</span>
                <span class="text-primary-text text-[11px]">{{ ipAddress }}</span>
              </div>
              <div class="py-2 flex items-center justify-between">
                <span class="text-secondary-text text-[10px] font-bold uppercase font-sans">Logged At</span>
                <span class="text-primary-text text-[10px] font-sans">{{ formatDate(createdAt) }}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Bottom Verification Bar & Navigation -->
      <div class="bg-card-background rounded-lg p-5 flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3 text-xs text-secondary-text font-mono">
          <span>Audit Trail Record: <strong class="text-primary-text">#{{ eventId }}</strong></span>
          <span>•</span>
          <span
            class="font-semibold flex items-center gap-1.5 uppercase"
            :class="isSuccess(statusValue) ? 'text-primary-green' : isFailed(statusValue) ? 'text-primary-red' : 'text-primary-yellow'"
          >
            <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(statusValue)"></span>
            Status: {{ statusValue }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-xs font-semibold text-secondary-text hover:text-primary-text border border-primary-border hover:bg-background transition cursor-pointer"
            @click="copyText(JSON.stringify(currentData, null, 2), 'Audit Record')"
          >
            Copy Raw JSON
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronLeft,
  FileText,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Copy,
  Check,
  Globe,
  Clock,
  Laptop,
  Layers,
  Hash,
  Key,
  KeyRound,
  FileJson,
  Download,
  Flag
} from 'lucide-vue-next'
import { formatDate } from '@/utils/timeFormatter'
import moment from 'moment-timezone'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { useEnhancedAuditLogsStore } from '@/stores/enhancedAuditLogs/enhancedAuditLogs'
import AuditLogNetworkMap from './components/AuditLogNetworkMap.vue'

const route = useRoute()
const router = useRouter()
const store = useEnhancedAuditLogsStore()
const snackbar = useSnackbarStore()

const detailData = ref(null)
const payloadTab = ref('json')
const permissionSearch = ref('')
const resolvedGeo = ref({ city: '', region: '', country: '', isp: '', asn: '' })

const onGeoResolved = (geo) => {
  if (geo) {
    resolvedGeo.value = geo
  }
}

// Copy text utility
const copyText = (text, label = 'Content') => {
  if (!text) return
  navigator.clipboard.writeText(String(text))
  snackbar.show(`${label} copied to clipboard`, 'success')
}

// Download JSON payload
const downloadPayload = () => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentData.value, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `audit_log_${eventId.value}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
  snackbar.show('Audit JSON downloaded', 'success')
}

// Export Summary trigger
const triggerExportDossier = () => {
  window.print()
}

const triggerFlag = () => {
  snackbar.show(`Audit Event #${eventId.value} flagged for security review`, 'info')
}

const isClientDepth = computed(() => {
  return Boolean(route.params.logId && route.params.id) || route.path.includes('/client/details/')
})

const backButtonLabel = computed(() => {
  return isClientDepth.value ? 'Client Audit Logs' : 'Audit Trail'
})

const handleBack = () => {
  if (isClientDepth.value && route.params.id) {
    router.push(`/client/details/${route.params.id}/audit-logs`)
  } else {
    router.push('/enhanced-audit-logs')
  }
}

// Helper to reliably unwrap arrays or nested data wrappers
const unwrapAuditRecord = (val) => {
  if (!val) return null
  if (Array.isArray(val)) {
    return val.length > 0 ? unwrapAuditRecord(val[0]) : null
  }
  if (typeof val === 'object') {
    if (val.data !== undefined && val.data !== null && typeof val.data === 'object') {
      if (val.action || val.audit_log_id || val.id || val.summary) return val
      return unwrapAuditRecord(val.data)
    }
    return val
  }
  return null
}

// Current combined data source (Prioritizes deep detail response, falls back to store.data record)
const currentData = computed(() => {
  const unwrappedDetail = unwrapAuditRecord(detailData.value)
  if (
    unwrappedDetail &&
    Object.keys(unwrappedDetail).length > 0 &&
    (unwrappedDetail.action || unwrappedDetail.audit_log_id || unwrappedDetail.summary || unwrappedDetail.id)
  ) {
    return unwrappedDetail
  }

  const targetId = String(route.params.logId || route.params.id)
  const found = (store.data || []).find(
    (d) => String(d.audit_log_id || d.id) === targetId
  )
  const unwrappedFound = unwrapAuditRecord(found)
  if (unwrappedFound && Object.keys(unwrappedFound).length > 0) {
    return unwrappedFound
  }

  if (unwrappedDetail && Object.keys(unwrappedDetail).length > 0) {
    return unwrappedDetail
  }

  return {}
})

// Core audit identifiers
const eventId = computed(() => {
  return route.params.logId || route.params.id || currentData.value?.audit_log_id || currentData.value?.id || '—'
})

const summaryText = computed(() => {
  return currentData.value?.summary || null
})

const actionValue = computed(() => {
  const raw = currentData.value?.action ||
    currentData.value?.action_name ||
    currentData.value?.action_type ||
    currentData.value?.event ||
    currentData.value?.event_action ||
    currentData.value?.activity ||
    currentData.value?.details?.action ||
    currentData.value?.details?.business_context?.action ||
    currentData.value?.details?.business_context?.transaction_type

  if (raw) return String(raw).replace(/ /g, '_').toUpperCase()

  // Derive from summary text if action is not explicitly given
  if (summaryText.value) {
    const s = summaryText.value.toLowerCase()
    if (s.includes('approve deposit') || s.includes('approved deposit')) return 'APPROVE_DEPOSIT'
    if (s.includes('update role permissions') || s.includes('updated role permissions')) return 'UPDATE_ROLE_PERMISSIONS'
    if (s.includes('delete resource') || s.includes('deleted their own resource')) return 'DELETE_RESOURCE'
    if (s.includes('create resource') || s.includes('created their own resource')) return 'CREATE_RESOURCE'
    if (s.includes('login with secret') || s.includes('admin login with secret')) return 'ADMIN_LOGIN_WITH_SECRET'
    if (s.includes('update profile') || s.includes('updated their own profile details') || s.includes('updated their own profile')) return 'UPDATE_PROFILE'
    if (s.includes('change password') || s.includes('changed password')) return 'CHANGE_ACCOUNT_PASSWORD'
    if (s.includes('kyc')) return 'INIT_KYC'
    if (s.includes('deposit request') || s.includes('created a deposit')) return 'DEPOSIT_CREATED'
    if (s.includes('email') || s.includes('dispatched')) return 'EMAIL_SENT'
    if (s.includes('verified a') && s.includes('withdrawal')) return 'VERIFY_WITHDRAWAL'
    if (s.includes('withdrawal')) return 'WITHDRAWAL_CREATED'
    if (s.includes('approve payment') || s.includes('approved a') || s.includes('approved payment')) return 'APPROVE_PAYMENT_REQUEST'
    if (s.includes('updated')) return 'UPDATE'
  }

  if (currentData.value?.entity?.type) {
    return `MUTATE_${String(currentData.value.entity.type).toUpperCase()}`
  }

  return 'EVENT_LOG'
})

const moduleValue = computed(() => {
  if (currentData.value?.module) return currentData.value.module
  const act = String(actionValue.value).toUpperCase()
  if (act.includes('WITHDRAWAL') || act.includes('DEPOSIT') || act.includes('PAYMENT') || act.includes('FINANCE') || act.includes('SETTLEMENT') || act.includes('WALLET')) return 'FINANCE'
  if (act.includes('ROLE') || act.includes('PERMISSION') || act.includes('RESOURCE') || act.includes('RBAC')) return 'RBAC'
  if (act.includes('CLIENT') || act.includes('USER') || act.includes('PROFILE') || act.includes('KYC') || act.includes('MEMBER')) return 'USER_MANAGEMENT'
  if (act.includes('TRADE') || act.includes('TRADING') || act.includes('ACCOUNT') || act.includes('ORDER')) return 'TRADING'
  if (act.includes('EMAIL') || act.includes('MESSAGE') || act.includes('WHATSAPP') || act.includes('TELEGRAM')) return 'COMMUNICATIONS'
  if (act.includes('LOGIN') || act.includes('AUTH') || act.includes('PASSWORD') || act.includes('SECRET')) return 'AUTH_AND_IDENTITY'
  return 'GENERAL'
})

const entityValue = computed(() => {
  const entity = currentData.value?.entity
  if (typeof entity === 'object' && entity?.type) return entity.type
  if (typeof entity === 'string') return entity
  if (currentData.value?.entity_type) return currentData.value.entity_type
  if (currentData.value?.details?.target?.type) return currentData.value.details.target.type
  const parts = String(actionValue.value).split('_')
  return parts.length > 1 ? parts.slice(1).join('_') : parts[0]
})

const entityIdValue = computed(() => {
  const entity = currentData.value?.entity
  if (typeof entity === 'object' && entity?.id !== undefined) return entity.id
  return currentData.value?.entity_id || currentData.value?.details?.target?.id || null
})

const statusValue = computed(() => {
  return currentData.value?.result_status ||
    currentData.value?.details?.result_details?.status ||
    currentData.value?.result?.status ||
    'SUCCESS'
})

const createdAt = computed(() => {
  return currentData.value?.created_at || new Date().toISOString()
})

const relativeTimeText = computed(() => {
  if (!createdAt.value) return 'Recently'
  const m = moment.utc(createdAt.value)
  return m.isValid() ? m.fromNow() : 'Recently'
})

// Request Context details
const requestContext = computed(() => {
  return currentData.value?.request_context || {}
})

const ipAddress = computed(() => {
  return requestContext.value?.ip_address || currentData.value?.ip_address || currentData.value?.ip || ''
})

const userAgent = computed(() => {
  return requestContext.value?.user_agent || currentData.value?.user_agent || null
})

const txidOrRequestId = computed(() => {
  return requestContext.value?.request_id ||
    currentData.value?.details?.business_context?.txid ||
    currentData.value?.details?.business_context?.reference_id ||
    currentData.value?.details?.business_context?.payment_id ||
    null
})

// Actor Information (100% Dynamic from API actor, source, user)
const actorUser = computed(() => {
  const src = currentData.value?.source || currentData.value?.details?.source || {}
  const act = currentData.value?.actor || currentData.value?.details?.actor || {}
  const usr = currentData.value?.user || currentData.value?.details?.user || {}

  const name = src.name || act.name || usr.name || (act.type && act.id ? `${act.type} #${act.id}` : null) || 'Authenticated Actor'
  const email = src.email || act.email || usr.email || null
  const role = src.role || act.role || usr.role || (act.type === 'USER' ? 'Staff / User' : null)
  const id = act.id || src.user_id || usr.id || null
  const type = act.type || (src.role ? String(src.role).toUpperCase() : 'USER')

  return { id, name, email, role, type }
})

const userInitial = computed(() => {
  const name = actorUser.value.name || 'AU'
  const clean = name.replace(/[^a-zA-Z0-9]/g, '')
  return clean ? clean.slice(0, 2).toUpperCase() : 'AU'
})

// Destination Information (When admin acts on another user/account)
const destinationFlow = computed(() => {
  const dest = currentData.value?.destination || currentData.value?.details?.destination
  if (!dest) return null
  return {
    title: dest.name || dest.email || dest.account_name || 'Destination Target',
    subtitle: dest.email || dest.account_number || null,
    role: dest.role || null,
    userId: dest.user_id || dest.id || null,
    accountName: dest.account_name || null
  }
})

// Target Specifications (100% Dynamic from API target, entity, account, destination)
const targetSpecs = computed(() => {
  const target = currentData.value?.details?.target || currentData.value?.target || {}
  const entity = currentData.value?.entity || {}
  const account = currentData.value?.details?.account || currentData.value?.account || {}
  const dest = destinationFlow.value

  const displayName = target.display_name ||
    account.account_number ||
    (dest ? `${dest.title}${dest.role ? ` (${dest.role})` : ''}` : null) ||
    (entity.type ? `${entity.type} #${entity.id || ''}` : null) ||
    `${entityValue.value} #${entityIdValue.value || eventId.value}`

  const id = target.id || entity.id || account.id || dest?.userId || entityIdValue.value || eventId.value
  const type = target.type || entity.type || (dest ? 'TARGET USER' : 'TARGET RESOURCE')

  return { displayName, id, type }
})

// Business Context & Account parameters
const businessContext = computed(() => {
  return currentData.value?.details?.business_context || currentData.value?.business_context || {}
})

const accountBrokerGroup = computed(() => {
  const acc = currentData.value?.details?.account || currentData.value?.account
  return acc?.broker_group || businessContext.value?.broker_group || null
})

// Dynamic RBAC Permission Codes
const permissionCodes = computed(() => {
  const codes = businessContext.value?.permission_codes
  if (Array.isArray(codes)) return codes
  return []
})

const filteredPermissionCodes = computed(() => {
  if (!permissionSearch.value.trim()) return permissionCodes.value
  const query = permissionSearch.value.toLowerCase()
  return permissionCodes.value.filter(c => String(c).toLowerCase().includes(query))
})

// Dynamic Business Context items list (100% from API payload)
const dynamicContextItems = computed(() => {
  const items = []
  const bc = businessContext.value
  const tx = currentData.value?.details?.transaction || currentData.value?.transaction
  const acc = currentData.value?.details?.account || currentData.value?.account
  const reason = currentData.value?.details?.reason || currentData.value?.reason || bc?.reason

  if (reason) {
    items.push({ label: 'Reason / Note', value: reason, isCopyable: false, fullWidth: true })
  }
  if (bc?.role_name) {
    items.push({ label: 'Role Name', value: bc.role_name, isCopyable: false })
  }
  if (bc?.role_id) {
    items.push({ label: 'Role ID', value: `#${bc.role_id}`, isCopyable: true })
  }
  if (bc?.permission_count) {
    items.push({ label: 'Permission Count', value: `${bc.permission_count} assigned`, isCopyable: false })
  }
  if (bc?.resource_name) {
    items.push({ label: 'Resource Name', value: bc.resource_name, isCopyable: false })
  }
  if (bc?.resource_id) {
    items.push({ label: 'Resource ID', value: `#${bc.resource_id}`, isCopyable: true })
  }
  if (bc?.slug) {
    items.push({ label: 'Resource Slug', value: bc.slug, isCopyable: true })
  }
  if (bc?.gateway) {
    items.push({ label: 'Payment Gateway', value: String(bc.gateway).toUpperCase(), isCopyable: false })
  }
  if (bc?.network) {
    items.push({ label: 'Blockchain / Network', value: bc.network, isCopyable: false })
  }
  if (bc?.payment_method) {
    const pm = typeof bc.payment_method === 'object' ? (bc.payment_method.wallet_label || bc.payment_method.method_type) : bc.payment_method
    items.push({ label: 'Payment Method', value: pm, isCopyable: false })
  }
  if (bc?.payment_id) {
    items.push({ label: 'Payment Request ID', value: `#${bc.payment_id}`, isCopyable: true })
  }
  if (bc?.subject) {
    items.push({ label: 'Email Subject', value: bc.subject, isCopyable: true, fullWidth: true })
  }
  if (bc?.template_code) {
    items.push({ label: 'Email Template', value: bc.template_code, isCopyable: true })
  }
  if (bc?.recipient) {
    items.push({ label: 'Email Recipient', value: bc.recipient, isCopyable: true })
  }
  if (bc?.provider) {
    items.push({ label: 'Provider Service', value: String(bc.provider).toUpperCase(), isCopyable: false })
  }
  if (bc?.message_id) {
    items.push({ label: 'Message ID', value: bc.message_id, isCopyable: true, fullWidth: true })
  }
  if (bc?.admin_name) {
    items.push({ label: 'Admin Agent', value: `${bc.admin_name}${bc.admin_email ? ` (${bc.admin_email})` : ''}`, isCopyable: false, fullWidth: true })
  }
  if (bc?.updated_fields && Array.isArray(bc.updated_fields)) {
    items.push({ label: 'Updated Fields', value: bc.updated_fields.join(', '), isCopyable: false })
  }
  if (bc?.user_type) {
    items.push({ label: 'User Type', value: bc.user_type, isCopyable: false })
  }
  if (acc?.account_number) {
    items.push({ label: 'Trading Account Number', value: acc.account_number, isCopyable: true })
  }
  if (acc?.broker_group) {
    items.push({ label: 'Broker Group', value: acc.broker_group, isCopyable: false })
  }
  if (tx?.amount) {
    items.push({ label: 'Transaction Amount', value: `${tx.currency || 'USD'} ${tx.amount}`, isCopyable: false })
  }

  return items
})

// Dynamic KPI Metric 1 (Gross / Permissions / Fields / Value)
const kpiMetric1 = computed(() => {
  const bc = businessContext.value
  const tx = currentData.value?.details?.transaction || currentData.value?.transaction
  const changes = changedFields.value

  if (tx?.formatted) {
    return {
      label: 'TRANSACTION AMOUNT',
      value: tx.formatted,
      subtext: targetSpecs.value.displayName || 'Settlement Channel',
      footer: 'Transaction Recorded'
    }
  }
  if (tx?.amount) {
    return {
      label: 'TRANSACTION AMOUNT',
      value: `${tx.currency || 'USD'} ${tx.amount}`,
      subtext: targetSpecs.value.displayName || 'Settlement Channel',
      footer: 'Transaction Recorded'
    }
  }
  if (bc?.amount && typeof bc.amount === 'object' && bc.amount.currency) {
    const val = bc.amount.value !== null && bc.amount.value !== undefined ? bc.amount.value : ''
    return {
      label: 'TRANSACTION VALUE',
      value: `${bc.amount.currency} ${val}`.trim(),
      subtext: bc.network ? `${bc.network} • ${bc.gateway || 'Gateway'}` : (bc.gateway || 'Payment Gateway'),
      footer: 'Payment Request'
    }
  }
  if (permissionCodes.value.length > 0 || bc?.permission_count) {
    const count = permissionCodes.value.length || bc.permission_count
    return {
      label: 'PERMISSIONS MUTATED',
      value: `${count} Permissions`,
      subtext: bc.role_name ? `Role: ${bc.role_name}` : 'Role Policy Matrix',
      footer: 'Permissions Synchronized'
    }
  }
  if (changes && changes.length > 0) {
    const firstChange = changes[0]
    return {
      label: 'STATE MUTATION DIFF',
      value: `${changes.length} Field${changes.length > 1 ? 's' : ''} Modified`,
      subtext: `${firstChange.key}: ${formatValue(firstChange.oldValue)} → ${formatValue(firstChange.newValue)}`,
      footer: 'Database State Updated'
    }
  }
  if (bc?.updated_fields && Array.isArray(bc.updated_fields)) {
    return {
      label: 'PROFILE FIELDS UPDATED',
      value: `${bc.updated_fields.length} Field${bc.updated_fields.length > 1 ? 's' : ''}`,
      subtext: `Changed: ${bc.updated_fields.join(', ')}`,
      footer: 'Profile Synchronized'
    }
  }
  if (bc?.resource_name) {
    return {
      label: 'RESOURCE TARGET',
      value: bc.resource_name,
      subtext: `Resource #${bc.resource_id || ''}${bc.slug ? ` (${bc.slug})` : ''}`,
      footer: 'Resource Schema Modified'
    }
  }
  if (bc?.template_code || bc?.subject) {
    return {
      label: 'EMAIL DISPATCH',
      value: bc.template_code || 'EMAIL_SENT',
      subtext: bc.subject ? `Subject: ${bc.subject}` : `To: ${destinationFlow.value?.subtitle || bc.recipient}`,
      footer: bc.provider ? `Dispatched via ${String(bc.provider).toUpperCase()}` : 'Email Dispatched'
    }
  }
  if (actionValue.value.includes('PASSWORD')) {
    return {
      label: 'PASSWORD CHANGE',
      value: targetSpecs.value.displayName,
      subtext: accountBrokerGroup.value || 'Trading Account',
      footer: 'Password Reset Completed'
    }
  }

  return {
    label: 'AUDIT EVENT',
    value: formatAction(actionValue.value),
    subtext: `${moduleValue.value} / ${entityValue.value}`,
    footer: 'Record Logged'
  }
})

// Dynamic Synopsis verb
const synopsisActionVerb = computed(() => {
  const act = String(actionValue.value).toLowerCase()
  if (act.includes('withdrawal') || act.includes('verify')) return 'initiated and confirmed withdrawal for'
  if (act.includes('deposit')) return 'initiated deposit request for'
  if (act.includes('delete')) return 'deleted'
  if (act.includes('create')) return 'created and initialized'
  if (act.includes('update')) return 'updated'
  if (act.includes('approve')) return 'approved request for'
  if (act.includes('reject')) return 'rejected request for'
  if (act.includes('login')) return 'performed authenticated access on'
  if (act.includes('email') || act.includes('send')) return 'dispatched communication to'
  return 'executed action on'
})

// Dynamic Flow Step descriptions
const flowStep2Text = computed(() => {
  const endpoint = requestContext.value?.endpoint
  const method = requestContext.value?.http_method
  if (endpoint) {
    return `Inbound request dispatched to endpoint '${endpoint}' via ${method || 'HTTP'}.`
  }
  return `Action dispatched through ${moduleValue.value} module handler.`
})

const flowStep3Text = computed(() => {
  const act = String(actionValue.value).toLowerCase()
  if (act.includes('role') || act.includes('permission')) {
    const count = permissionCodes.value.length || businessContext.value?.permission_count || 'all'
    return `Synchronized ${count} permission policies for ${targetSpecs.value.displayName}.`
  }
  if (act.includes('withdrawal') || act.includes('deposit') || act.includes('payment')) {
    return `Processed financial request for ${targetSpecs.value.displayName}.`
  }
  if (changedFields.value && changedFields.value.length > 0) {
    return `Mutated ${changedFields.value.length} fields in database for ${targetSpecs.value.displayName}.`
  }
  return `Applied mutation state to ${targetSpecs.value.displayName}.`
})

const resolvedLocationText = computed(() => {
  const parts = [resolvedGeo.value.city, resolvedGeo.value.region, resolvedGeo.value.country].filter(Boolean)
  return parts.length ? parts.join(', ') : null
})

const autonomousSystemText = computed(() => {
  if (resolvedGeo.value.isp) {
    const asn = resolvedGeo.value.asn ? `${resolvedGeo.value.asn} ` : ''
    return `${asn}${resolvedGeo.value.isp}`
  }
  return ipAddress.value ? 'Network Origin' : 'Not Recorded'
})

// User Agent parser
const parsedUserAgent = computed(() => {
  const ua = userAgent.value
  if (!ua) return { device: 'Unknown Device', browser: 'API Client', os: 'Unknown OS', isKnown: false }

  const l = ua.toLowerCase()
  let os = 'Unknown OS'
  let device = 'Device'

  if (l.includes('iphone')) {
    os = 'iOS'
    device = 'Apple iPhone'
  } else if (l.includes('ipad')) {
    os = 'iPadOS'
    device = 'Apple iPad'
  } else if (l.includes('android')) {
    os = 'Android'
    device = l.includes('pixel') ? 'Google Pixel' : (l.includes('samsung') ? 'Samsung Device' : 'Android Device')
  } else if (l.includes('macintosh') || l.includes('mac os')) {
    os = 'macOS'
    device = 'Apple Mac'
  } else if (l.includes('windows')) {
    os = 'Windows'
    device = 'Windows PC'
  } else if (l.includes('linux')) {
    os = 'Linux'
    device = 'Linux Host'
  }

  let browser = 'Web Browser'
  if (l.includes('crios')) browser = 'Chrome (iOS)'
  else if (l.includes('chrome')) browser = 'Google Chrome'
  else if (l.includes('safari') && !l.includes('chrome')) browser = 'Apple Safari'
  else if (l.includes('firefox')) browser = 'Mozilla Firefox'
  else if (l.includes('edg')) browser = 'Microsoft Edge'

  return { device, os, browser, isKnown: true }
})

// Database Changes Diff computed
const changedFields = computed(() => {
  const changes = currentData.value?.changes || currentData.value?.details?.changes
  if (changes && typeof changes === 'object' && Object.keys(changes).length > 0) {
    return Object.entries(changes).map(([key, change]) => ({
      key,
      oldValue: change?.old !== undefined ? change.old : null,
      newValue: change?.new !== undefined ? change.new : null
    }))
  }
  return null
})

// Status & UI formatting helpers
const isFailed = (status) => {
  const s = String(status || '').toLowerCase()
  return s === 'failed' || s === 'error' || s === 'failure' || s === 'rejected'
}

const isSuccess = (status) => {
  const s = String(status || '').toLowerCase()
  return s === 'success' || s === 'completed' || s === 'approved'
}

const formatAction = (action) => {
  if (!action) return 'EVENT LOG'
  return String(action).replace(/ /g, '_').toUpperCase()
}

const getStatusClass = (status) => {
  if (isSuccess(status)) return 'bg-primary-green/10 text-primary-green border-primary-green/20'
  if (isFailed(status)) return 'bg-primary-red/10 text-primary-red border-primary-red/20'
  return 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'
}

const getStatusDotClass = (status) => {
  if (isSuccess(status)) return 'bg-primary-green'
  if (isFailed(status)) return 'bg-primary-red'
  return 'bg-primary-yellow'
}

const formatValue = (val) => {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

const formatTime = (date, offsetSec = 0) => {
  if (!date) return '00:00:00 UTC'
  const m = moment.utc(date).add(offsetSec, 'seconds')
  return m.format('HH:mm:ss') + ' UTC'
}

const truncateMiddle = (str, front = 8, back = 6) => {
  if (!str) return '—'
  const s = String(str)
  if (s.length <= front + back + 3) return s
  return `${s.slice(0, front)}...${s.slice(-back)}`
}

onMounted(async () => {
  const logId = route.params.logId || route.params.id
  const clientId = route.params.logId && route.params.id ? route.params.id : null

  // Ensure store data is available as fallback/primary
  if (!store.data.length) {
    if (clientId) {
      store.fetchUserAuditLogs(clientId, 1, 100, true)
    } else {
      store.fetchAuditLogs(true)
    }
  }

  // Also fetch deep details
  if (logId) {
    try {
      const res = await store.fetchAuditDetails(logId)
      if (res) {
        detailData.value = res
      }
    } catch {
      // Handled gracefully
    }
  }
})
</script>

<style scoped>
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
