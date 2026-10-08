<template>
  <div class="space-y-5 pt-4 pb-12">
    <!-- ─── TOP HEADER ───────────────────────────────────────────── -->
    <!-- <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-base sm:text-lg font-bold text-primary-text">
          Profile & KYC Verification
        </h3>
        <p class="text-xs text-secondary-text mt-0.5">
          Manage client personal details, identity verification status, documents, and compliance remarks.
        </p>
      </div>
    </div> -->

    <!-- ─── SKELETON LOADING STATE ─────────────────────────────────── -->
    <div
      v-if="isProfileLoading"
      class="grid grid-cols-1 xl:grid-cols-2 gap-3 items-stretch animate-pulse"
    >
      <!-- Left Column Skeleton -->
      <div class="flex flex-col gap-3 h-full">
        <!-- 1. Profile Information Skeleton Card -->
        <div
          class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 space-y-5"
        >
          <div
            class="flex items-start justify-between gap-3 pb-5 border-b border-primary-border/60"
          >
            <div class="space-y-2">
              <div class="h-4 w-36 bg-primary-border/70 rounded" />
              <div class="h-3 w-56 bg-primary-border/40 rounded" />
            </div>
            <div class="h-8 w-24 bg-primary-border/50 rounded-xl" />
          </div>
          <div class="flex flex-col sm:flex-row items-start gap-4 pt-2">
            <div
              class="w-24 h-24 rounded-full bg-primary-border/50 shrink-0 self-center sm:self-start"
            />
            <div class="flex-1 w-full space-y-3">
              <div class="h-3 w-32 bg-primary-border/60 rounded" />
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="i in 6"
                  :key="i"
                  class="p-2.5 bg-background/50 rounded-lg space-y-1.5"
                >
                  <div class="h-2.5 w-16 bg-primary-border/40 rounded" />
                  <div class="h-3.5 w-24 bg-primary-border/70 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Address Skeleton Card -->
        <div
          class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 space-y-4"
        >
          <div class="space-y-2 pb-4 border-b border-primary-border/60">
            <div class="h-4 w-28 bg-primary-border/70 rounded" />
            <div class="h-3 w-48 bg-primary-border/40 rounded" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="i in 4"
              :key="i"
              class="p-2.5 bg-background/50 rounded-lg space-y-1.5"
            >
              <div class="h-2.5 w-14 bg-primary-border/40 rounded" />
              <div class="h-3.5 w-20 bg-primary-border/70 rounded" />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column Skeleton (KYC & Documents) -->
      <div class="flex flex-col gap-3 h-full">
        <div
          class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 space-y-4 flex-1"
        >
          <div
            class="flex items-start justify-between gap-3 pb-4 border-b border-primary-border/60"
          >
            <div class="space-y-2">
              <div class="h-4 w-40 bg-primary-border/70 rounded" />
              <div class="h-3 w-52 bg-primary-border/40 rounded" />
            </div>
            <div class="h-8 w-28 bg-primary-border/50 rounded-xl" />
          </div>
          <div class="p-4 bg-background/60 rounded-xl space-y-3">
            <div class="h-3.5 w-28 bg-primary-border/60 rounded" />
            <div class="h-6 w-36 bg-primary-border/70 rounded-full" />
          </div>
          <div class="space-y-3 pt-2">
            <div class="h-3.5 w-32 bg-primary-border/60 rounded" />
            <div
              v-for="i in 3"
              :key="i"
              class="h-14 bg-background/50 border border-primary-border/50 rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── MAIN 2-COLUMN GRID ───────────────────────────────────── -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-3 items-stretch">
      <!-- ─── LEFT COLUMN ─────────────────────────────────────────── -->
      <div class="flex flex-col gap-3 h-full">
        <!-- 1. Profile Information Card -->
        <div
          class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3 pb-5 border-b border-primary-border/60">
            <div>
              <h3 class="text-base min-[1650px]:text-lg font-bold text-primary-text">
                Profile Information
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                Personal and contact information provided by the client.
              </p>
            </div>
            <button
              v-if="canEditProfile"
              type="button"
              @click="openEditProfileModal"
              class="border border-primary-border rounded-xl px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-background transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Pencil class="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>

          <!-- Card Body -->
          <div class="flex flex-col sm:flex-row items-start gap-4 pt-5">
            <!-- Avatar / Photo Area -->
            <div class="flex flex-col items-center shrink-0 w-full sm:w-36 xl:w-28 2xl:w-36">
              <div class="relative">
                <div
                  class="w-24 h-24 rounded-full bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green"
                >
                  <User class="w-12 h-12" />
                </div>
                <!-- Verified Green Badge -->
                <div
                  class="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-green text-white flex items-center justify-center border-2 border-card-background shadow-xs"
                  title="Verified Profile"
                >
                  <Check class="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <button
                v-if="canEditProfile"
                type="button"
                @click="triggerPhotoUpload"
                class="mt-3.5 border border-primary-border rounded-xl px-3 py-1.5 text-xs font-semibold text-primary-text hover:bg-background transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload class="w-3.5 h-3.5 text-secondary-text" />
                Upload Photo
              </button>
              <input
                ref="photoInputRef"
                type="file"
                accept="image/jpeg,image/png"
                class="hidden"
                @change="handlePhotoUpload"
              />
              <span class="text-[10px] text-secondary-text mt-1 text-center font-medium">
                JPG, PNG (Max. 2MB)
              </span>
            </div>

            <!-- Profile Details with Vertical & Horizontal Borders -->
            <div class="flex-1 w-full sm:border-l sm:border-primary-border/60 sm:pl-4 space-y-0 text-xs">
              <!-- Row 1: Full Name, Date of Birth, Gender -->
              <div class="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-primary-border/60">
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Full Name
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ user.name || "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Date of Birth
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ formattedDob }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Gender
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ user.gender || "—" }}
                  </p>
                </div>
              </div>

              <!-- Row 2: Email Address, Phone Number -->
              <div class="flex flex-col sm:flex-row justify-between gap-4 py-4 border-b border-primary-border/60">
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Email Address
                  </p>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-primary-text text-xs sm:text-[12px] break-all">
                      {{ user.email || "—" }}
                    </span>
                    <span
                      class="bg-primary-green/10 text-primary-green text-[11px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-primary-green/20"
                    >
                      <Check class="w-3 h-3 stroke-[3]" />
                      Verified
                    </span>
                  </div>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Phone Number
                  </p>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-primary-text text-xs sm:text-[12px]">
                      {{ user.phone_number || user.phone || "—" }}
                    </span>
                    <span
                      v-if="user.phone_number || user.phone"
                      class="bg-primary-green/10 text-primary-green text-[11px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-primary-green/20"
                    >
                      <Check class="w-3 h-3 stroke-[3]" />
                      Verified
                    </span>
                    <span
                      v-else
                      class="bg-primary-red/10 text-primary-red text-[11px] font-semibold px-2 py-0.5 rounded-md border border-primary-red/20"
                    >
                      Not Verified
                    </span>
                  </div>
                </div>
              </div>

              <!-- Row 3: Country of Residence, Nationality, Preferred Language -->
              <div class="flex flex-col sm:flex-row justify-between gap-4 py-4 border-b border-primary-border/60">
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Country of Residence
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px] flex items-center gap-1.5">
                    <span
                      v-if="user.country && getFlagCode(user.country)"
                      :class="[
                        'fi',
                        `fi-${getFlagCode(user.country)}`,
                        'fis',
                        'w-4 h-3 flex-shrink-0',
                      ]"
                    ></span>
                    <span>{{ cleanCountryLabel(user.country) || "—" }}</span>
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Nationality
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px] flex items-center gap-1.5">
                    <span
                      v-if="(user.nationality || user.country) && getFlagCode(user.nationality || user.country)"
                      :class="[
                        'fi',
                        `fi-${getFlagCode(user.nationality || user.country)}`,
                        'fis',
                        'w-4 h-3 flex-shrink-0',
                      ]"
                    ></span>
                    <span>{{ cleanCountryLabel(user.nationality || user.country) || "—" }}</span>
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Preferred Language
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ user.preferred_language || "English (EN)" }}
                  </p>
                </div>
              </div>

              <!-- Row 4: Residential Address, City / State, Postal Code -->
              <div class="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <div class="flex-1">
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Residential Address
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ user.address || user.residential_address || "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    City / State
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ [user.city, user.state].filter(Boolean).join(", ") || "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Postal Code
                  </p>
                  <p class="font-semibold text-primary-text text-xs sm:text-[12px]">
                    {{ user.zip_code || user.postal_code || user.zip || "—" }}
                  </p>
                </div>
              </div>

              <!-- Row 5: Two-Factor Authentication (2FA) Status & Reset -->
              <div
                v-if="hasPermission(['two_factor.view', 'two_factor.reset'])"
                class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-primary-border/60"
              >
                <div>
                  <p class="text-[11px] sm:text-xs text-secondary-text font-medium mb-1">
                    Two-Factor Authentication (2FA)
                  </p>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5"
                      :class="
                        user.totp_enabled || user.is_2fa_enabled
                          ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                          : 'bg-secondary-text/10 text-secondary-text border-primary-border'
                      "
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        :class="user.totp_enabled || user.is_2fa_enabled ? 'bg-primary-green' : 'bg-secondary-text'"
                      />
                      {{ (user.totp_enabled || user.is_2fa_enabled) ? 'Enabled' : 'Disabled' }}
                    </span>
                  </div>
                </div>

                <div v-if="canResetUser2fa && (user.totp_enabled || user.is_2fa_enabled)">
                  <button
                    type="button"
                    class="btn-danger text-xs px-3 py-1.5"
                    @click="reset2FaModalOpen = true"
                  >
                    <RefreshCw class="w-3.5 h-3.5" />
                    <span>Reset 2FA</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. KYC Documents & Image References Table -->
        <KycDocumentsTable :userId="clientForEdit.id" />
      </div>

      <!-- ─── RIGHT COLUMN ────────────────────────────────────────── -->
      <div class="flex flex-col gap-3 h-full">
        <!-- 3. KYC Verification Card -->
        <div
          class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 space-y-6"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3 pb-5 border-b border-primary-border/60">
            <div>
              <h3 class="text-base min-[1650px]:text-lg font-bold text-primary-text">
                KYC Verification
              </h3>
              <p class="text-xs text-secondary-text mt-0.5">
                Track and manage client verification status and documents.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <!-- When KYC is Approved: Show Approved Badge -->
              <Tooltip v-if="isKycApproved" text="KYC verification is completed & approved" position="left">
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-green/10 text-primary-green border border-primary-green/20">
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>Approved</span>
                </div>
              </Tooltip>

              <!-- When KYC is Rejected: Show Rejected Badge -->
              <Tooltip v-else-if="isKycRejected" text="Rejected" position="top">
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20">
                  <AlertCircle class="w-3.5 h-3.5" />
                  <span>Rejected</span>
                </div>
              </Tooltip>

              <!-- When KYC is Pending: Show Approve/Reject Button if permitted -->
              <button
                v-else-if="canApproveKyc || canRejectKyc"
                type="button"
                @click="openApprovalModal(canApproveKyc ? 'approve' : 'reject')"
                class="bg-primary hover:bg-primary-hover text-white rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                :title="canApproveKyc && canRejectKyc ? 'Review and Approve / Reject KYC Documents' : canApproveKyc ? 'Review and Approve KYC Documents' : 'Review and Reject KYC Documents'"
              >
                <ShieldCheck v-if="canApproveKyc" class="w-3.5 h-3.5" />
                <ShieldAlert v-else class="w-3.5 h-3.5" />
                <span>{{ canApproveKyc && canRejectKyc ? 'Approve / Reject' : canApproveKyc ? 'Approve KYC' : 'Reject KYC' }}</span>
              </button>
            </div>
          </div>

          <!-- Status & Progress Hero Box -->
          <div
            class="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-colors"
            :class="kycHeroBoxClasses.container"
          >
            <div class="flex items-center gap-4 min-w-0">
              <!-- Shield / Status Badge Icon -->
              <div
                class="w-12 h-12 rounded-2xl border flex items-center justify-center font-extrabold text-2xl shrink-0 transition-colors"
                :class="kycHeroBoxClasses.iconBox"
              >
                <Check v-if="isKycApproved" class="w-6 h-6 stroke-[3]" />
                <X v-else-if="isKycRejected" class="w-6 h-6 stroke-[3]" />
                <span v-else>A</span>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold tracking-wider text-secondary-text">
                  Current Status
                </p>
                <div class="flex items-center gap-2 flex-wrap mt-0.5">
                  <p class="text-xl min-[1650px]:text-2xl font-bold capitalize" :class="kycHeroBoxClasses.statusText">
                    {{ kycStatus }}
                  </p>
                  <!-- Verification Channel Badge -->
                  <span
                    v-if="verificationChannel"
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                    :class="kycHeroBoxClasses.channelBadge"
                  >
                    <span class="opacity-70 font-medium text-[11px]">Via</span>
                    <span>{{ verificationChannel }}</span>
                  </span>
                </div>
                <p class="text-xs text-secondary-text mt-0.5">
                  {{ kycStatusMessage }}
                </p>
              </div>
            </div>

            <!-- Progress Indicator -->
            <div class="flex flex-col sm:items-start shrink-0 w-full sm:w-auto">
              <span class="text-xs font-semibold text-secondary-text">Progress</span>
              <span class="text-sm font-extrabold text-primary-text mt-0.5">
                {{ completedStepsCount }} / {{ totalStepsCount }}
              </span>
              <div class="w-full sm:w-36 h-2 rounded-full bg-primary-border/80 overflow-hidden mt-1.5">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="kycHeroBoxClasses.progressBar"
                  :style="{ width: `${progressPercentage}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Stepper Progress -->
          <div class="flex items-center justify-between gap-2 px-2 sm:px-6 py-2 overflow-x-auto no-scrollbar">
            <template v-for="(step, sIdx) in stepperSteps" :key="step.number">
              <!-- Step Item -->
              <div class="flex items-center gap-3 shrink-0">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs"
                  :class="getStepBadgeClass(step.status)"
                >
                  {{ step.number }}
                </div>
                <div>
                  <p class="text-xs font-bold text-primary-text">{{ step.label }}</p>
                  <p class="text-[11px] font-semibold capitalize" :class="getStepTextClass(step.status)">
                    {{ step.statusText || step.status }}
                  </p>
                </div>
              </div>

              <!-- Connector Arrow -->
              <ChevronRight
                v-if="sIdx < stepperSteps.length - 1"
                class="w-4 h-4 text-secondary-text/40 shrink-0"
              />
            </template>
          </div>

          <!-- Document Checklist Section (3 Fields) -->
          <div class="space-y-3 pt-2">
            <div>
              <h4 class="text-sm font-bold text-primary-text">Document Checklist</h4>
              <p class="text-xs text-secondary-text mt-0.5">
                Please upload valid documents to proceed.
              </p>
            </div>

            <!-- Documents Table (Scrollable with sticky header) -->
            <div class="border border-primary-border rounded-xl overflow-x-auto overflow-y-auto max-h-[170px] no-scrollbar">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-primary-border">
                  <tr class="text-[11px] font-bold text-secondary-text uppercase tracking-wider">
                    <th class="py-2.5 px-4">Document Type</th>
                    <th class="py-2.5 px-3">Status</th>
                    <th class="py-2.5 px-3">Remarks</th>
                    <th class="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="doc in documentChecklist"
                    :key="doc.id || doc.type"
                    class="border-b border-primary-border hover:bg-card-background/70 transition-colors"
                  >
                    <!-- Type & Subtitle -->
                    <td class="py-3 px-4">
                      <div class="flex items-start gap-2.5">
                        <component
                          :is="doc.uploaded ? CheckCircle2 : AlertCircle"
                          class="w-4 h-4 shrink-0 mt-0.5"
                          :class="doc.uploaded ? 'text-primary-green' : 'text-primary-red'"
                        />
                        <div>
                          <p class="font-bold text-primary-text">{{ doc.title }}</p>
                          <p class="text-[11px] text-secondary-text">{{ doc.subtitle }}</p>
                        </div>
                      </div>
                    </td>

                    <!-- Status Badges -->
                    <td class="py-3 px-3">
                      <div class="flex flex-col gap-1 items-start">
                        <span
                          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          :class="doc.uploaded ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' : 'bg-primary-red/10 text-primary-red border border-primary-red/20'"
                        >
                          {{ doc.uploaded ? 'Uploaded' : 'Not Uploaded' }}
                        </span>
                        <span
                          v-if="doc.verification_status"
                          class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                          :class="getVerificationStatusBadgeClass(doc.verification_status)"
                        >
                          {{ doc.verification_status }}
                        </span>
                      </div>
                    </td>

                    <!-- Remarks -->
                    <td class="py-3 px-3 text-secondary-text font-medium text-[11px]">
                      {{ doc.remarks || '—' }}
                    </td>

                    <!-- Action Buttons -->
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <!-- If Document Uploaded -->
                        <template v-if="doc.uploaded">
                          <!-- 1. View Document Button (Icon with Tooltip) -->
                          <Tooltip v-if="canViewDoc && (doc.front || doc.back || doc.doc_path?.front || doc.doc_path?.back)" text="View Document" position="top">
                            <button
                              type="button"
                              @click="openViewDoc(doc)"
                              class="border border-primary-border rounded-lg p-1.5 text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer flex items-center justify-center"
                            >
                              <Eye class="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>

                          <!-- 2. Status Badge or Approve/Reject Icon Buttons -->
                          <!-- Case A: Document is Approved (Icon Badge) -->
                          <Tooltip
                            v-if="String(doc.verification_status).toLowerCase() === 'approved' || String(doc.verification_status).toLowerCase() === 'verified'"
                            text="Approved"
                            position="top"
                          >
                            <div class="w-7 h-7 rounded-lg border border-primary-green/30 bg-primary-green/10 text-primary-green flex items-center justify-center">
                              <CheckCircle2 class="w-3.5 h-3.5" />
                            </div>
                          </Tooltip>

                          <!-- Case B: Document is Rejected (Icon Badge) -->
                          <Tooltip
                            v-else-if="String(doc.verification_status).toLowerCase() === 'rejected'"
                            text="Rejected"
                            position="top"
                          >
                            <div class="w-7 h-7 rounded-lg border border-primary-red/30 bg-primary-red/10 text-primary-red flex items-center justify-center">
                              <AlertCircle class="w-3.5 h-3.5" />
                            </div>
                          </Tooltip>

                          <!-- Case C: Document is Pending Review & user has approve/reject permission -->
                          <template v-else-if="(canApproveKyc || canRejectKyc) && !doc.isSumsub && !doc.isDirect">
                            <!-- Approve Icon Button -->
                            <Tooltip v-if="canApproveKyc" text="Approve Document" position="top">
                              <button
                                type="button"
                                @click="openApprovalModal('approve')"
                                class="border border-primary-green/40 bg-primary-green/10 text-primary-green hover:bg-primary-green/20 rounded-lg p-1.5 transition-all cursor-pointer flex items-center justify-center"
                              >
                                <Check class="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </Tooltip>

                            <!-- Reject Icon Button -->
                            <Tooltip v-if="canRejectKyc" text="Reject Document" position="top">
                              <button
                                type="button"
                                @click="openApprovalModal('reject')"
                                class="border border-primary-red/40 bg-primary-red/10 text-primary-red hover:bg-primary-red/20 rounded-lg p-1.5 transition-all cursor-pointer flex items-center justify-center"
                              >
                                <X class="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </Tooltip>
                          </template>

                          <!-- 3. Edit / Replace Document Button (only if not sumsub and not approved) -->
                          <Tooltip v-if="canUpdateDoc && !doc.isSumsub && !doc.isDirect && !isKycApproved" text="Edit / Replace Document" position="left">
                            <button
                              type="button"
                              @click="openEditDoc(doc)"
                              class="border border-primary-border rounded-lg p-1.5 text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer flex items-center justify-center"
                            >
                              <Pencil class="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>
                        </template>

                        <!-- If Document Not Uploaded: Upload button (only if not approved) -->
                        <template v-else>
                          <Tooltip v-if="canAddDoc && !isKycApproved" text="Upload Document" position="top">
                            <button
                              type="button"
                              @click="openUploadDoc(doc)"
                              class="border border-primary-border bg-primary/10 hover:bg-primary/20 text-primary rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Upload class="w-3.5 h-3.5" />
                              <span>Upload</span>
                            </button>
                          </Tooltip>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 4. KYC Notes References Table -->
        <KycNotesTable :userId="clientForEdit.id" />
      </div>
    </div>

    <!-- ─── MODALS & DRAWERS ────────────────────────────────────── -->

    <!-- 1. Edit Client Profile Drawer -->
    <EditClientProfileDrawer
      :open="editProfileDrawerOpen"
      :client="clientForEdit"
      @close="closeEditProfileDrawer"
      @success="handleProfileEditSuccess"
    />

    <!-- 2. Upload / Edit KYC Verification Modal (Center Popup) -->
    <UploadKycVerificationModal
      :open="uploadDocModalOpen"
      :client="clientForEdit"
      :existingDoc="selectedDoc"
      @close="closeUploadDocModal"
      @success="handleUploadDocSuccess"
    />

    <!-- 3. View KYC Document Modal -->
    <ViewKycDocumentModal
      :open="viewDocModalOpen"
      :doc="selectedDoc"
      :status="kycStatus"
      :canApprove="canApproveKyc && !selectedDoc?.isSumsub"
      :canReject="canRejectKyc && !selectedDoc?.isSumsub"
      :canEdit="canUpdateDoc && !selectedDoc?.isSumsub"
      @close="closeViewDocModal"
      @edit="openEditDoc(selectedDoc)"
      @approve="openApprovalModal('approve')"
      @reject="openApprovalModal('reject')"
    />

    <!-- 4. Approve / Reject KYC Modal (Super Admin Only) -->
    <ApproveRejectKycModal
      :open="approveRejectModalOpen"
      :client="clientForEdit"
      :kycData="kycData"
      :initialAction="approvalInitialAction"
      @close="approveRejectModalOpen = false"
      @success="handleApprovalSuccess"
    />

    <!-- 5. Reset User 2FA Confirmation Modal -->
    <Reset2FaConfirmDialog
      :open="reset2FaModalOpen"
      :target-name="user.name || user.email || 'this client'"
      :loading="twoFactorStore.actionLoading"
      @close="reset2FaModalOpen = false"
      @confirm="handleResetUser2fa"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { useProfileStore } from "@/stores/profile/profile";
import { useTwoFactorStore } from "@/stores/twoFactor/twoFactor";
import { useMyPermissionsStore } from "@/stores/rbac/myPermissions";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { getFlagCode, cleanCountryLabel } from "@/utils/countries";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import Tooltip from "@/components/common/Tooltip.vue";
import Reset2FaConfirmDialog from "@/components/common/Reset2FaConfirmDialog.vue";
import EditClientProfileDrawer from "@/components/clientDetails/EditClientProfileDrawer.vue";
import UploadKycVerificationModal from "@/components/clientDetails/UploadKycVerificationModal.vue";
import ViewKycDocumentModal from "@/components/clientDetails/ViewKycDocumentModal.vue";
import ApproveRejectKycModal from "@/components/clientDetails/ApproveRejectKycModal.vue";
import KycNotesTable from "@/components/clientDetails/KycNotesTable.vue";
import KycDocumentsTable from "@/components/clientDetails/KycDocumentsTable.vue";
import {
  User,
  Pencil,
  Check,
  Upload,
  Mail,
  RefreshCw,
  ChevronRight,
  Plus,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  ShieldCheck,
  ShieldAlert,
} from "lucide-vue-next";

const route = useRoute();
const snackbar = useSnackbarStore();
const clientDepthStore = useClientDepthStore();
const profileStore = useProfileStore();
const twoFactorStore = useTwoFactorStore();
const permissionsStore = useMyPermissionsStore();
const { hasPermission } = usePermissionCheck();

// 2FA Reset State
const reset2FaModalOpen = ref(false);

const canResetUser2fa = computed(() => {
  return hasPermission(["two_factor.reset"]);
});

const handleResetUser2fa = async () => {
  const userId = clientForEdit.value.id;
  if (!userId) return;
  try {
    await twoFactorStore.resetUser2fa(userId);
    reset2FaModalOpen.value = false;
    // Refresh client overview to update 2FA status
    if (clientDepthStore.fetchOverview) {
      clientDepthStore.fetchOverview(userId);
    }
  } catch (_) {
    // snackbar is handled in store
  }
};

// ─── Permission & Access Checks ──────────────────────────────────────────────
// Pure RBAC permission checks from backend 'client' module:
// - Client Profile Edit: "client.update"
// - Document Approve: "client.document_approve" (or fallback "kyc.approve")
// - Document Reject: "client.document_reject" (or fallback "kyc.reject")
// - Document Upload/Add: "client.document_add"
// - Document Update/Edit: "client.document_update"
// - Document View: "client.document_view" (or "client.view")

const canEditProfile = computed(() => {
  return hasPermission("client.update");
});

const canApproveKyc = computed(() => {
  return hasPermission(["client.document_approve", "kyc.approve"]);
});

const canRejectKyc = computed(() => {
  return hasPermission(["client.document_reject", "kyc.reject"]);
});

const canAddDoc = computed(() => {
  return hasPermission(["client.document_add"]);
});

const canUpdateDoc = computed(() => {
  return hasPermission(["client.document_update"]);
});

const canViewDoc = computed(() => {
  return hasPermission(["client.document_view", "client.view"]);
});

// ─── User Profile State ───────────────────────────────────────────────────────
const localStoredUser = ref({});

const loadClientFromStorage = () => {
  try {
    const raw = localStorage.getItem("active_client");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!route.params.id || String(parsed?.id) === String(route.params.id)) {
        localStoredUser.value = parsed;
        return;
      }
    }
  } catch { }
  localStoredUser.value = {};
};

const user = computed(() => {
  const routeId = route.params.id;
  const overviewUser =
    (String(clientDepthStore.overviewData?.user?.id) === String(routeId) ||
     String(clientDepthStore.overviewData?.id) === String(routeId))
      ? (clientDepthStore.overviewData?.user || clientDepthStore.overviewData)
      : {};
  const active =
    (String(clientDepthStore.activeClient?.id) === String(routeId))
      ? clientDepthStore.activeClient
      : {};
  const stored =
    (String(localStoredUser.value?.id) === String(routeId))
      ? localStoredUser.value
      : {};
  const kycStatusFromStore =
    (String(clientDepthStore.kycData?.user_id) === String(routeId) ||
     String(clientDepthStore.currentUserId) === String(routeId))
      ? (clientDepthStore.kycData?.kyc_status || clientDepthStore.kycData?.status)
      : null;

  return {
    ...stored,
    ...active,
    ...overviewUser,
    ...(kycStatusFromStore ? { kyc_status: kycStatusFromStore } : {}),
  };
});

const clientForEdit = computed(() => {
  return {
    ...user.value,
    id: route.params.id || user.value?.id,
  };
});

const isRefreshing = ref(false);

const isProfileLoading = computed(() => {
  return (
    isRefreshing.value ||
    (!clientDepthStore.kycFetched && clientDepthStore.kycLoading)
  );
});

const loadKyc = (force = false) => {
  const userId = route.params.id || user.value?.id;
  if (userId) {
    clientDepthStore.fetchClientOverview(userId, force);
    clientDepthStore.fetchClientKyc(userId, force);
    clientDepthStore.fetchUserReferences(userId, force);
  }
};

const handleTabRefresh = (e) => {
  if (e?.detail?.tab && e.detail.tab !== "profile") return;
  isRefreshing.value = true;
  loadKyc(true);
};

watch(
  () => [clientDepthStore.kycLoading, clientDepthStore.userReferencesLoading],
  ([kLoading, rLoading]) => {
    if (!kLoading && !rLoading && isRefreshing.value) {
      isRefreshing.value = false;
    }
  }
);

onMounted(() => {
  loadClientFromStorage();
  loadKyc();
  if (!profileStore.user) {
    profileStore.fetchUserProfile().catch(() => {});
  }
  if (!permissionsStore.isFetched && !permissionsStore.loading) {
    permissionsStore.fetchMyPermissions().catch(() => {});
  }
  window.addEventListener("refresh-client-tab-data", handleTabRefresh);
});

onUnmounted(() => {
  window.removeEventListener("refresh-client-tab-data", handleTabRefresh);
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadClientFromStorage();
      loadKyc();
    }
  },
);

const formattedDob = computed(() => {
  const dob = user.value.date_of_birth || user.value.dob;
  if (!dob) return "—";
  try {
    return new Date(dob).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dob;
  }
});

// ─── Photo Upload ─────────────────────────────────────────────────────────────
const photoInputRef = ref(null);

const triggerPhotoUpload = () => {
  photoInputRef.value?.click();
};

const handlePhotoUpload = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    snackbar.show("Profile photo uploaded successfully!", "success");
  }
};

// ─── Edit Profile Drawer State ────────────────────────────────────────────────
const editProfileDrawerOpen = ref(false);

const openEditProfileModal = () => {
  editProfileDrawerOpen.value = true;
};

const closeEditProfileDrawer = () => {
  editProfileDrawerOpen.value = false;
};

const handleProfileEditSuccess = (updatedClient) => {
  if (updatedClient) {
    localStoredUser.value = { ...localStoredUser.value, ...updatedClient };
    clientDepthStore.setActiveClient(updatedClient);
  } else {
    loadClientFromStorage();
  }
};

// ─── KYC Document Helpers & Formatters ────────────────────────────────────────
const formatDocType = (type) => {
  if (!type) return "Passport, ID Card, or Driver's License";
  const key = String(type).toLowerCase();
  const map = {
    aadhaar: "Aadhaar Card",
    pan: "PAN Card",
    passport: "Passport",
    driving_license: "Driver's License",
    drivers: "Driver's License",
    driver_license: "Driver's License",
    voter_id: "Voter ID Card",
    national_id: "National Identity Card",
    address_proof: "Address Proof",
    selfie: "Selfie Photo",
    direct_verification: "Direct Verification",
    other: "Official Identity Document",
  };
  return map[key] || String(type).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const getVerificationStatusBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "verified" || s === "approved")
    return "bg-primary-green/10 text-primary-green border border-primary-green/20";
  if (s === "unverified" || s === "pending" || s === "in_progress" || s === "under review" || s === "waiting for verification")
    return "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20";
  if (s === "rejected")
    return "bg-primary-red/10 text-primary-red border border-primary-red/20";
  return "bg-secondary-text/10 text-secondary-text";
};

// ─── KYC Response Resolver ───────────────────────────────────────────────────
const kycData = computed(() => {
  return clientDepthStore.kycData || null;
});

const kycStatus = computed(() => {
  return (
    kycData.value?.kyc_status ||
    kycData.value?.status ||
    user.value?.kyc_status ||
    "Pending"
  );
});

const hasSumsubDocs = computed(() => {
  return Array.isArray(kycData.value?.sumsub_documents) && kycData.value.sumsub_documents.length > 0;
});

const isKycApproved = computed(() => {
  const s = String(kycStatus.value || "").toLowerCase();
  return s === "approved" || s === "verified";
});

const isKycRejected = computed(() => {
  const s = String(kycStatus.value || "").toLowerCase();
  return s === "rejected";
});

const isDocUploaded = computed(() => {
  return !!(
    kycData.value?.docs_uploaded ||
    hasSumsubDocs.value ||
    kycData.value?.front ||
    kycData.value?.doc_path?.front ||
    kycData.value?.front_url ||
    kycData.value?.file_url ||
    isKycApproved.value
  );
});

const verificationChannel = computed(() => {
  const channel = kycData.value?.verification_channel;
  if (channel) {
    const c = String(channel).trim().toLowerCase();
    if (c === "sumsub") return "Sumsub";
    if (c === "manual") return "Manual";
    if (c === "direct") return "Direct";
    return channel.charAt(0).toUpperCase() + channel.slice(1);
  }
  if (hasSumsubDocs.value || kycData.value?.sumsub_applicant_id) {
    return "Sumsub";
  }
  if (kycData.value?.docs_uploaded || kycData.value?.doc_path?.front || kycData.value?.front || kycData.value?.front_url) {
    return "Manual";
  }
  if (isKycApproved.value) {
    return "Direct";
  }
  return null;
});

const kycHeroBoxClasses = computed(() => {
  if (isKycApproved.value) {
    return {
      container: "bg-primary-green/10 border-primary-green/30",
      iconBox: "bg-primary-green/15 border-primary-green/30 text-primary-green",
      statusText: "text-primary-green",
      progressBar: "bg-primary-green",
      channelBadge: "bg-primary-green/15 text-primary-green border-primary-green/30",
    };
  }
  if (isKycRejected.value) {
    return {
      container: "bg-primary-red/10 border-primary-red/30",
      iconBox: "bg-primary-red/15 border-primary-red/30 text-primary-red",
      statusText: "text-primary-red",
      progressBar: "bg-primary-red",
      channelBadge: "bg-primary-red/15 text-primary-red border-primary-red/30",
    };
  }
  return {
    container: "bg-primary-yellow/10 border-primary-yellow/30",
    iconBox: "bg-primary-yellow/15 border-primary-yellow/30 text-primary-yellow",
    statusText: "text-primary-yellow",
    progressBar: "bg-primary-yellow",
    channelBadge: "bg-primary-yellow/15 text-primary-yellow border-primary-yellow/30",
  };
});

const kycStatusMessage = computed(() => {
  const isUploaded = isDocUploaded.value || hasSumsubDocs.value;
  if (isKycApproved.value) {
    return "Client identity verification completed.";
  }
  if (isKycRejected.value) {
    return kycData.value?.kyc_reject_reason || "Document rejected. Please upload valid proof.";
  }
  if (isUploaded) {
    return "Documents uploaded. Waiting for admin review.";
  }
  return "Complete the remaining steps to get verified.";
});

// ─── 3-Field Document Checklist Resolver ──────────────────────────────────────
const documentChecklist = computed(() => {
  const k = clientDepthStore.kycData || {};
  const sumsubDocs = Array.isArray(k.sumsub_documents) ? k.sumsub_documents : [];
  const docType = k.doc_type || "passport";
  const docPath = k.doc_path || {};
  const frontUrl = docPath.front || k.front || k.front_url || null;
  const backUrl = docPath.back || k.back || k.back_url || null;
  const hasManualUploaded = !!(k.docs_uploaded || frontUrl || backUrl);
  const status = k.kyc_status || (k.doc_approved ? "approved" : (hasManualUploaded ? "unverified" : null));
  const remarks = k.kyc_reject_reason || (k.doc_approved ? "Approved" : (hasManualUploaded ? "Waiting for verification" : "Required"));

  const checklist = [];

  // Case 1: Verified or uploaded via Sumsub
  if (sumsubDocs.length > 0) {
    const groupedSumsubDocs = {};
    sumsubDocs.forEach((doc) => {
      const type = doc.idDocType || "IDENTITY";
      if (!groupedSumsubDocs[type]) {
        groupedSumsubDocs[type] = { front: null, back: null };
      }
      if (doc.idDocSubType === "BACK_SIDE") {
        groupedSumsubDocs[type].back = doc.image;
      } else {
        groupedSumsubDocs[type].front = doc.image;
      }
    });

    for (const [type, docs] of Object.entries(groupedSumsubDocs)) {
      checklist.push({
        id: `sumsub_${type}`,
        type: "identity",
        doc_type: type.toLowerCase(),
        title: "Proof of Identity (Sumsub)",
        subtitle: formatDocType(type),
        uploaded: true,
        verification_status: k.kyc_status || "approved",
        remarks: k.kyc_reject_reason || "Sumsub Verification",
        front: docs.front,
        back: docs.back,
        doc_path: { front: docs.front, back: docs.back },
        isSumsub: true,
      });
    }
    return checklist;
  }

  // Case 2: Manual Uploaded Document
  if (hasManualUploaded) {
    checklist.push({
      id: "identity",
      type: "identity",
      doc_type: docType,
      title: "Proof of Identity",
      subtitle: formatDocType(docType),
      uploaded: true,
      verification_status: status,
      remarks: remarks,
      front: frontUrl,
      back: backUrl,
      doc_path: docPath,
    });
    return checklist;
  }

  // Case 3: Direct Admin Verification without documents (Approved)
  if (isKycApproved.value) {
    checklist.push({
      id: "direct_verification",
      type: "identity",
      doc_type: "direct_verification",
      title: "Proof of Identity",
      subtitle: "Direct Admin Verification",
      uploaded: true,
      verification_status: "approved",
      remarks: "Directly verified without documents",
      isDirect: true,
      front: null,
      back: null,
      doc_path: null,
    });
    return checklist;
  }

  // Case 4: Pending manual document upload
  checklist.push({
    id: "identity",
    type: "identity",
    doc_type: docType,
    title: "Proof of Identity",
    subtitle: "Passport, ID Card, or Driver's License",
    uploaded: false,
    verification_status: null,
    remarks: "Waiting for verification",
    front: null,
    back: null,
    doc_path: docPath,
  });

  return checklist;
});

// ─── Stepper Progress Logic ───────────────────────────────────────────────────
const completedStepsCount = computed(() => {
  let count = 1; // Personal Info
  if (isKycApproved.value) {
    return 3;
  }
  if (isDocUploaded.value || hasSumsubDocs.value) {
    count += 1;
  }
  return count;
});

const totalStepsCount = ref(3);

const progressPercentage = computed(() => {
  return Math.min(
    100,
    Math.round((completedStepsCount.value / (totalStepsCount.value || 3)) * 100)
  );
});

const stepperSteps = computed(() => {
  const docsDone = isKycApproved.value || isDocUploaded.value || hasSumsubDocs.value;

  return [
    {
      number: 1,
      label: "Personal Info",
      status: "completed",
      statusText: "Completed",
    },
    {
      number: 2,
      label: "Documents",
      status: docsDone ? "completed" : "pending",
      statusText: docsDone ? "Completed" : "Pending",
    },
    {
      number: 3,
      label: "Verification",
      status: isKycApproved.value
        ? "completed"
        : isKycRejected.value
        ? "rejected"
        : docsDone
        ? "in_progress"
        : "pending",
      statusText: isKycApproved.value
        ? "Approved"
        : isKycRejected.value
        ? "Rejected"
        : docsDone
        ? "Under Review"
        : "Pending",
    },
  ];
});

function getStepBadgeClass(status) {
  if (status === "completed") return "bg-primary-green text-white";
  if (status === "pending" || status === "in_progress") return "bg-primary-yellow text-white";
  if (status === "rejected") return "bg-primary-red text-white";
  return "bg-primary-border text-secondary-text";
}

function getStepTextClass(status) {
  if (status === "completed") return "text-primary-green";
  if (status === "pending" || status === "in_progress") return "text-primary-yellow";
  if (status === "rejected") return "text-primary-red";
  return "text-secondary-text";
}

// ─── Upload & View Modals State ───────────────────────────────────────────────
const selectedDoc = ref(null);
const uploadDocModalOpen = ref(false);
const viewDocModalOpen = ref(false);

const openViewDoc = (doc) => {
  selectedDoc.value = doc;
  viewDocModalOpen.value = true;
};

const openEditDoc = (doc) => {
  selectedDoc.value = doc;
  uploadDocModalOpen.value = true;
};

const openUploadDoc = (doc) => {
  selectedDoc.value = doc;
  uploadDocModalOpen.value = true;
};

const closeUploadDocModal = () => {
  uploadDocModalOpen.value = false;
};

const closeViewDocModal = () => {
  viewDocModalOpen.value = false;
};

const handleUploadDocSuccess = () => {
  const userId = route.params.id || user.value?.id;
  if (userId) {
    clientDepthStore.fetchClientKyc(userId, true);
    clientDepthStore.fetchClientOverview(userId, true);
  }
  window.dispatchEvent(new CustomEvent("client-kyc-updated", { detail: { userId } }));
};

// ─── Super Admin Document Approval Modal Handlers ───────────────────────────
const approveRejectModalOpen = ref(false);
const approvalInitialAction = ref("approve");

const openApprovalModal = (action = "approve") => {
  approvalInitialAction.value = action;
  approveRejectModalOpen.value = true;
};

const handleApprovalSuccess = (res) => {
  const userId = route.params.id || user.value?.id;
  if (userId) {
    clientDepthStore.fetchClientKyc(userId, true);
    clientDepthStore.fetchClientOverview(userId, true);
  }
  window.dispatchEvent(new CustomEvent("client-kyc-updated", { detail: { userId, res } }));
};

const refreshKycStatus = () => {
  const userId = route.params.id || user.value?.id;
  if (!userId) return;
  clientDepthStore.fetchClientKyc(userId, true);
  clientDepthStore.fetchUserReferences(userId, true);
};

const sendKycInstructions = () => {
  snackbar.show("Verification instructions sent to client email!", "success");
};
</script>
