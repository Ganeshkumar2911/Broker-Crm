<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-all duration-300 cursor-pointer"
        @click="closeModal"
      >
        <div
          class="bg-card-background border-l border-primary-border w-full max-w-md sm:max-w-xl h-full shadow-2xl flex flex-col transform transition-all duration-300 cursor-default"
          @click.stop
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
              >
                <component :is="isEditing ? Pencil : Upload" class="w-4 h-4" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-sm sm:text-base">
                  {{ isEditing ? "Edit Client Document" : "Upload Document / Image" }}
                </h3>
                <p class="text-[11px] text-secondary-text">
                  {{
                    isEditing
                      ? "Update document name, file attachment or description."
                      : "Upload client identity proof, scanned documents or images."
                  }}
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="closeModal"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Form -->
          <form
            @submit.prevent="submitForm"
            class="flex-1 flex flex-col min-h-0 overflow-hidden bg-card-background"
          >
            <!-- Scrollable Form Body -->
            <div
              class="flex-1 overflow-y-auto p-6 space-y-4.5 text-xs bg-card-background no-scrollbar"
            >
              <!-- Client Reference Banner -->
              <div
                class="flex items-center justify-between p-3 rounded-xl bg-background border border-primary-border"
              >
                <span class="text-[11px] font-medium text-secondary-text">Client:</span>
                <span class="font-bold text-primary-text text-xs flex items-center gap-1.5">
                  <span>{{ clientDisplayName }}</span>
                  <span
                    v-if="resolvedClientId && !clientDisplayName.includes(`#${resolvedClientId}`)"
                    class="text-primary font-mono font-semibold"
                  >
                    #{{ resolvedClientId }}
                  </span>
                </span>
              </div>

              <!-- STEP 1: Type Selection (Document vs Image) - Only in Add mode -->
              <div v-if="!isEditing" class="space-y-1.5">
                <label class="font-bold text-primary-text block">
                  Select Upload Type <span class="text-primary-red">*</span>
                </label>
                <div
                  class="grid grid-cols-2 gap-2 bg-background p-1 rounded-xl border border-primary-border"
                >
                  <button
                    type="button"
                    @click="setUploadCategory('document')"
                    class="py-2 px-3 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-2 text-center"
                    :class="
                      uploadCategory === 'document'
                        ? 'bg-primary text-white shadow-2xs'
                        : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60'
                    "
                  >
                    <FileText class="w-4 h-4" />
                    <span>Document (PDF / DOC)</span>
                  </button>

                  <button
                    type="button"
                    @click="setUploadCategory('image')"
                    class="py-2 px-3 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-2 text-center"
                    :class="
                      uploadCategory === 'image'
                        ? 'bg-primary text-white shadow-2xs'
                        : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60'
                    "
                  >
                    <ImageIcon class="w-4 h-4" />
                    <span>Image (Single / Dual)</span>
                  </button>
                </div>
              </div>

              <!-- STEP 2 (IF IMAGE in Add mode): Single Image vs Dual (Front & Back) -->
              <div
                v-if="!isEditing && uploadCategory === 'image'"
                class="space-y-2 p-3.5 rounded-xl bg-background border border-primary-border"
              >
                <div class="flex items-center justify-between">
                  <label class="font-bold text-primary-text block text-[11px]">
                    Image Upload Condition <span class="text-primary-red">*</span>
                  </label>
                  <span class="text-[10px] text-secondary-text">Single or Dual (Front & Back)</span>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    @click="setImageUploadMode('single')"
                    class="p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 text-left"
                    :class="
                      imageUploadMode === 'single'
                        ? 'bg-primary/10 border-primary text-primary shadow-2xs'
                        : 'bg-card-background border-primary-border text-secondary-text hover:border-primary/40 hover:text-primary-text'
                    "
                  >
                    <div
                      class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                      :class="
                        imageUploadMode === 'single'
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background border-primary-border text-secondary-text'
                      "
                    >
                      <ImageIcon class="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p class="font-bold text-xs">Single Image</p>
                      <p class="text-[10px] opacity-75">1 file (file_name)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    @click="setImageUploadMode('dual')"
                    class="p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 text-left"
                    :class="
                      imageUploadMode === 'dual'
                        ? 'bg-primary/10 border-primary text-primary shadow-2xs'
                        : 'bg-card-background border-primary-border text-secondary-text hover:border-primary/40 hover:text-primary-text'
                    "
                  >
                    <div
                      class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                      :class="
                        imageUploadMode === 'dual'
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background border-primary-border text-secondary-text'
                      "
                    >
                      <Images class="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p class="font-bold text-xs">Front &amp; Back</p>
                      <p class="text-[10px] opacity-75">Dual files (front &amp; back)</p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- ── CASE A: DOCUMENT UPLOAD (Single File or Edit Mode) ── -->
              <template v-if="uploadCategory === 'document'">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-primary-text block">
                      Document Name / Type <span class="text-primary-red">*</span>
                    </label>
                    <span class="text-[10px] text-secondary-text">e.g. bank_statement</span>
                  </div>

                  <input
                    v-model="formFileName"
                    type="text"
                    placeholder="e.g. bank_statement, utility_bill, agreement, salary_slip"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                    required
                  />
                </div>

                <!-- Existing File Card (In Edit Mode) -->
                <div
                  v-if="isEditing && existingFileUrl && !selectedFile"
                  class="p-3.5 rounded-xl bg-background border border-primary-border space-y-2"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <component
                        :is="isImageFile(existingFileUrl) ? ImageIcon : File"
                        class="w-4 h-4 text-primary shrink-0"
                      />
                      <span class="font-bold text-primary-text truncate text-xs">
                        Current Attached File
                      </span>
                    </div>
                    <a
                      :href="existingFileUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <ExternalLink class="w-3 h-3" />
                      View File
                    </a>
                  </div>

                  <button
                    type="button"
                    @click="triggerDocFileInput"
                    class="w-full py-2 px-3 rounded-lg border border-dashed border-primary-border hover:border-primary text-secondary-text hover:text-primary text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Upload class="w-3.5 h-3.5" />
                    Replace / Choose New File
                  </button>
                </div>

                <!-- Single File Picker (Add mode or when user selected a new file) -->
                <div v-if="!isEditing || selectedFile || !existingFileUrl" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-primary-text block">
                      {{ isEditing ? "New Document File" : "Upload Document File (PDF / DOC)" }}
                      <span v-if="!isEditing" class="text-primary-red">*</span>
                    </label>
                    <span v-if="isEditing && selectedFile" class="text-[10px] text-emerald-500 font-bold">
                      Will replace current file
                    </span>
                  </div>

                  <!-- Newly selected file -->
                  <div
                    v-if="selectedFile"
                    class="border border-primary/40 rounded-xl p-3.5 bg-primary/5 space-y-3"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <File class="w-4 h-4 text-primary shrink-0" />
                        <div class="min-w-0">
                          <p class="font-bold text-primary-text truncate text-xs">
                            {{ selectedFile.name }}
                          </p>
                          <p class="text-[10px] text-secondary-text font-mono">
                            {{ (selectedFile.size / 1024).toFixed(1) }} KB · Ready to upload
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="triggerDocFileInput"
                          class="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[10px] cursor-pointer transition"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          @click="removeSingleFile"
                          class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Empty dropzone -->
                  <div
                    v-else
                    @click="triggerDocFileInput"
                    @dragover.prevent
                    @drop.prevent="handleDropSingleFile"
                    class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 hover:bg-background transition-all group"
                  >
                    <div
                      class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform"
                    >
                      <Upload class="w-5 h-5" />
                    </div>
                    <p class="font-bold text-primary-text text-xs">
                      Click to browse or drop document
                    </p>
                    <p class="text-[10px] text-secondary-text mt-0.5">
                      PDF, DOC, DOCX, XLS, TXT (Single file, Max 10MB)
                    </p>
                  </div>

                  <!-- File input -->
                  <input
                    ref="docFileInputRef"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf"
                    class="hidden"
                    @change="handleSingleFileSelected"
                  />
                </div>
              </template>

              <!-- ── CASE B: SINGLE IMAGE UPLOAD ── -->
              <template v-if="uploadCategory === 'image' && imageUploadMode === 'single'">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-primary-text block">
                      Image / Document Name <span class="text-primary-red">*</span>
                    </label>
                    <span class="text-[10px] text-secondary-text">e.g. pan_card, passport</span>
                  </div>

                  <input
                    v-model="formFileName"
                    type="text"
                    placeholder="e.g. pan_card, passport, voter_id, driving_license"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                    required
                  />
                </div>

                <!-- Existing Image Card (In Edit Mode) -->
                <div
                  v-if="isEditing && existingFileUrl && !selectedFile"
                  class="p-3.5 rounded-xl bg-background border border-primary-border space-y-2.5"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-bold text-primary-text text-xs">Current Image</span>
                    <a
                      :href="existingFileUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <ExternalLink class="w-3 h-3" />
                      Open Full Size
                    </a>
                  </div>

                  <div
                    class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 h-40 flex items-center justify-center p-1"
                  >
                    <img
                      :src="existingFileUrl"
                      alt="Current"
                      class="object-contain max-h-36 w-full rounded"
                    />
                  </div>

                  <button
                    type="button"
                    @click="triggerImgFileInput"
                    class="w-full py-2 px-3 rounded-lg border border-dashed border-primary-border hover:border-primary text-secondary-text hover:text-primary text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Upload class="w-3.5 h-3.5" />
                    Replace Image File
                  </button>
                </div>

                <!-- Image File Picker -->
                <div v-if="!isEditing || selectedFile || !existingFileUrl" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-primary-text block">
                      {{ isEditing ? "New Image File" : "Upload Image File (JPG / PNG / WebP)" }}
                      <span v-if="!isEditing" class="text-primary-red">*</span>
                    </label>
                    <span v-if="isEditing && selectedFile" class="text-[10px] text-emerald-500 font-bold">
                      Will replace current image
                    </span>
                  </div>

                  <!-- Selected image preview -->
                  <div
                    v-if="selectedFile"
                    class="border border-primary/40 rounded-xl p-3 bg-primary/5 space-y-3"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <ImageIcon class="w-4 h-4 text-primary shrink-0" />
                        <div class="min-w-0">
                          <p class="font-bold text-primary-text truncate text-xs">
                            {{ selectedFile.name }}
                          </p>
                          <p class="text-[10px] text-secondary-text font-mono">
                            {{ (selectedFile.size / 1024).toFixed(1) }} KB
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="triggerImgFileInput"
                          class="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[10px] cursor-pointer transition"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          @click="removeSingleFile"
                          class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X class="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div
                      v-if="localPreviewUrl"
                      class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 h-40 flex items-center justify-center p-1"
                    >
                      <img
                        :src="localPreviewUrl"
                        alt="Preview"
                        class="object-contain max-h-36 w-full rounded"
                      />
                    </div>
                  </div>

                  <!-- Empty dropzone -->
                  <div
                    v-else
                    @click="triggerImgFileInput"
                    @dragover.prevent
                    @drop.prevent="handleDropSingleFile"
                    class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 hover:bg-background transition-all group"
                  >
                    <div
                      class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform"
                    >
                      <ImageIcon class="w-5 h-5" />
                    </div>
                    <p class="font-bold text-primary-text text-xs">
                      Click to browse or drop image
                    </p>
                    <p class="text-[10px] text-secondary-text mt-0.5">
                      JPG, JPEG, PNG, WebP (Single file, Max 10MB)
                    </p>
                  </div>

                  <input
                    ref="imgFileInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleSingleFileSelected"
                  />
                </div>
              </template>

              <!-- ── CASE C: DUAL IMAGES (Front & Back) ── -->
              <template v-if="!isEditing && uploadCategory === 'image' && imageUploadMode === 'dual'">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-primary-text block">
                      Document Type / Category <span class="text-primary-red">*</span>
                    </label>
                    <span class="text-[10px] text-secondary-text">Dual side proof</span>
                  </div>

                  <input
                    v-model="formFileName"
                    type="text"
                    placeholder="e.g. aadhaar_card, driving_license, voter_id"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-xs font-mono text-primary-text outline-none focus:border-primary transition"
                    required
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- 1. FRONT -->
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] font-bold text-primary-text flex items-center gap-1">
                        <span
                          class="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold"
                        >
                          1
                        </span>
                        Front Image <span class="text-primary-red">*</span>
                      </span>
                      <span
                        v-if="frontFile"
                        class="text-[9px] font-mono text-emerald-500 font-bold flex items-center gap-0.5"
                      >
                        <CheckCircle2 class="w-3 h-3" /> Ready
                      </span>
                    </div>

                    <div
                      v-if="frontFile"
                      class="border border-primary/40 rounded-xl p-2.5 bg-primary/5 space-y-2"
                    >
                      <div class="flex items-center justify-between gap-1.5">
                        <div class="min-w-0 flex-1">
                          <p class="font-bold text-primary-text truncate text-[11px]">
                            {{ frontFile.name }}
                          </p>
                          <p class="text-[9px] text-secondary-text font-mono">
                            {{ (frontFile.size / 1024).toFixed(1) }} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          @click="removeFrontFile"
                          class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Remove front"
                        >
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div
                        v-if="frontPreviewUrl"
                        class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 h-32 flex items-center justify-center p-1"
                      >
                        <img
                          :src="frontPreviewUrl"
                          alt="Front preview"
                          class="object-contain max-h-30 w-full rounded"
                        />
                      </div>
                    </div>

                    <div
                      v-else
                      @click="triggerFrontFileInput"
                      @dragover.prevent
                      @drop.prevent="handleDropFrontFile"
                      class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 hover:bg-background transition-all group min-h-[140px]"
                    >
                      <div
                        class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1.5 group-hover:scale-105 transition-transform"
                      >
                        <Upload class="w-4 h-4" />
                      </div>
                      <p class="font-bold text-primary-text text-[11px]">
                        Upload Front Side
                      </p>
                      <p class="text-[9px] text-secondary-text mt-0.5">
                        front (JPG, PNG)
                      </p>
                    </div>

                    <input
                      ref="frontFileInputRef"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleFrontFileSelected"
                    />
                  </div>

                  <!-- 2. BACK -->
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] font-bold text-primary-text flex items-center gap-1">
                        <span
                          class="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold"
                        >
                          2
                        </span>
                        Back Image <span class="text-primary-red">*</span>
                      </span>
                      <span
                        v-if="backFile"
                        class="text-[9px] font-mono text-emerald-500 font-bold flex items-center gap-0.5"
                      >
                        <CheckCircle2 class="w-3 h-3" /> Ready
                      </span>
                    </div>

                    <div
                      v-if="backFile"
                      class="border border-primary/40 rounded-xl p-2.5 bg-primary/5 space-y-2"
                    >
                      <div class="flex items-center justify-between gap-1.5">
                        <div class="min-w-0 flex-1">
                          <p class="font-bold text-primary-text truncate text-[11px]">
                            {{ backFile.name }}
                          </p>
                          <p class="text-[9px] text-secondary-text font-mono">
                            {{ (backFile.size / 1024).toFixed(1) }} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          @click="removeBackFile"
                          class="p-1 rounded-lg text-secondary-text hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Remove back"
                        >
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div
                        v-if="backPreviewUrl"
                        class="relative rounded-lg overflow-hidden border border-primary-border bg-black/20 h-32 flex items-center justify-center p-1"
                      >
                        <img
                          :src="backPreviewUrl"
                          alt="Back preview"
                          class="object-contain max-h-30 w-full rounded"
                        />
                      </div>
                    </div>

                    <div
                      v-else
                      @click="triggerBackFileInput"
                      @dragover.prevent
                      @drop.prevent="handleDropBackFile"
                      class="border-2 border-dashed border-primary-border hover:border-primary/50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-background/50 hover:bg-background transition-all group min-h-[140px]"
                    >
                      <div
                        class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1.5 group-hover:scale-105 transition-transform"
                      >
                        <Upload class="w-4 h-4" />
                      </div>
                      <p class="font-bold text-primary-text text-[11px]">
                        Upload Back Side
                      </p>
                      <p class="text-[9px] text-secondary-text mt-0.5">
                        back (JPG, PNG)
                      </p>
                    </div>

                    <input
                      ref="backFileInputRef"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleBackFileSelected"
                    />
                  </div>
                </div>
              </template>

              <!-- Description / Remarks Input -->
              <div class="space-y-1.5 pt-1">
                <div class="flex items-center justify-between">
                  <label class="font-bold text-primary-text block">
                    Description / Remarks
                  </label>
                  <span class="text-[10px] text-secondary-text">Optional</span>
                </div>
                <textarea
                  v-model="formRemarks"
                  rows="3"
                  placeholder="Add optional notes, verification details, or compliance comments..."
                  class="w-full px-3.5 py-2.5 rounded-xl bg-background border border-primary-border text-xs text-primary-text outline-none focus:border-primary transition resize-none placeholder:text-secondary-text/60"
                />
              </div>
            </div>

            <!-- Drawer Footer -->
            <div
              class="px-6 py-4 border-t border-primary-border flex items-center justify-end gap-3 bg-card-background shrink-0"
            >
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2.5 text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background rounded-xl border border-primary-border transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitDisabled"
                class="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2
                  v-if="clientDepthStore.isSubmittingReference"
                  class="w-3.5 h-3.5 animate-spin"
                />
                <span>{{ submitButtonLabel }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  X,
  Upload,
  Pencil,
  FileText,
  File,
  Image as ImageIcon,
  Images,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-vue-next";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => ({}) },
  userId: { type: [String, Number], default: null },
  existingDoc: { type: Object, default: null },
  initialCategory: { type: String, default: "document" },
  initialImageMode: { type: String, default: "single" },
});

const emit = defineEmits(["close", "success"]);

const clientDepthStore = useClientDepthStore();

const isEditing = computed(() => !!props.existingDoc);

const resolvedClientId = computed(() => {
  return props.client?.id || props.userId || clientDepthStore.activeClient?.id || null;
});

const clientDisplayName = computed(() => {
  return (
    props.client?.name ||
    clientDepthStore.activeClient?.name ||
    (resolvedClientId.value ? `Client #${resolvedClientId.value}` : "Client")
  );
});

const isImageFile = (input) => {
  if (!input) return false;
  if (typeof input === "object") {
    const mime =
      input.mime_type ||
      input.mime ||
      input.raw?.mime_type ||
      input.raw?.type ||
      input.raw?.mime;
    if (typeof mime === "string" && mime.startsWith("image/")) return true;

    const candidates = [
      input.file_url,
      input.path,
      input.formatted_path,
      input.url,
      input.file_name,
      input.name,
      input.title,
    ].filter(Boolean);

    for (const c of candidates) {
      if (typeof c === "string" && isImageFile(c)) return true;
    }
    return false;
  }

  const str = String(input).split("?")[0].split("#")[0].toLowerCase();
  if (str.startsWith("data:image/") || str.startsWith("blob:")) return true;
  return /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico|tiff?)$/i.test(str);
};

const uploadCategory = ref("document"); // 'document' | 'image'
const imageUploadMode = ref("single"); // 'single' | 'dual'

const formFileName = ref("");
const formRemarks = ref("");
const existingFileUrl = ref(null);

// Single file selection
const selectedFile = ref(null);
const localPreviewUrl = ref(null);

// Dual images (front & back)
const frontFile = ref(null);
const frontPreviewUrl = ref(null);
const backFile = ref(null);
const backPreviewUrl = ref(null);

// Refs for DOM inputs
const docFileInputRef = ref(null);
const imgFileInputRef = ref(null);
const frontFileInputRef = ref(null);
const backFileInputRef = ref(null);

const cleanupBlobUrls = () => {
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = null;
  }
  if (frontPreviewUrl.value) {
    URL.revokeObjectURL(frontPreviewUrl.value);
    frontPreviewUrl.value = null;
  }
  if (backPreviewUrl.value) {
    URL.revokeObjectURL(backPreviewUrl.value);
    backPreviewUrl.value = null;
  }
};

const resetFormState = () => {
  cleanupBlobUrls();

  selectedFile.value = null;
  frontFile.value = null;
  backFile.value = null;

  if (props.existingDoc) {
    uploadCategory.value = isImageFile(props.existingDoc) ? "image" : "document";
    imageUploadMode.value = "single";
    formFileName.value = props.existingDoc.file_name || props.existingDoc.title || "";
    formRemarks.value = props.existingDoc.remarks || props.existingDoc.description || "";
    existingFileUrl.value = props.existingDoc.file_url || props.existingDoc.path || null;
  } else {
    uploadCategory.value = props.initialCategory === "image" ? "image" : "document";
    imageUploadMode.value = props.initialImageMode === "dual" ? "dual" : "single";
    formFileName.value = "";
    formRemarks.value = "";
    existingFileUrl.value = null;
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetFormState();
    } else {
      cleanupBlobUrls();
    }
  },
  { immediate: true },
);

const setUploadCategory = (cat) => {
  uploadCategory.value = cat;
};

const setImageUploadMode = (mode) => {
  imageUploadMode.value = mode;
  if (mode === "dual" && !formFileName.value.trim()) {
    formFileName.value = "aadhaar_card";
  }
};

const triggerDocFileInput = () => {
  docFileInputRef.value?.click();
};

const triggerImgFileInput = () => {
  imgFileInputRef.value?.click();
};

const triggerFrontFileInput = () => {
  frontFileInputRef.value?.click();
};

const triggerBackFileInput = () => {
  backFileInputRef.value?.click();
};

const handleSingleFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    applySingleFile(file);
  }
};

const handleDropSingleFile = (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    applySingleFile(file);
  }
};

const applySingleFile = (file) => {
  selectedFile.value = file;
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = null;
  }
  if (file.type.startsWith("image/")) {
    localPreviewUrl.value = URL.createObjectURL(file);
  }

  if (!formFileName.value.trim()) {
    const rawName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "_")
      .toLowerCase();
    formFileName.value = rawName;
  }
};

const removeSingleFile = () => {
  selectedFile.value = null;
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value);
    localPreviewUrl.value = null;
  }
  if (docFileInputRef.value) docFileInputRef.value.value = "";
  if (imgFileInputRef.value) imgFileInputRef.value.value = "";
};

const handleFrontFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) applyFrontFile(file);
};

const handleDropFrontFile = (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) applyFrontFile(file);
};

const applyFrontFile = (file) => {
  frontFile.value = file;
  if (frontPreviewUrl.value) {
    URL.revokeObjectURL(frontPreviewUrl.value);
  }
  frontPreviewUrl.value = URL.createObjectURL(file);
};

const removeFrontFile = () => {
  frontFile.value = null;
  if (frontPreviewUrl.value) {
    URL.revokeObjectURL(frontPreviewUrl.value);
    frontPreviewUrl.value = null;
  }
  if (frontFileInputRef.value) frontFileInputRef.value.value = "";
};

const handleBackFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (file) applyBackFile(file);
};

const handleDropBackFile = (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) applyBackFile(file);
};

const applyBackFile = (file) => {
  backFile.value = file;
  if (backPreviewUrl.value) {
    URL.revokeObjectURL(backPreviewUrl.value);
  }
  backPreviewUrl.value = URL.createObjectURL(file);
};

const removeBackFile = () => {
  backFile.value = null;
  if (backPreviewUrl.value) {
    URL.revokeObjectURL(backPreviewUrl.value);
    backPreviewUrl.value = null;
  }
  if (backFileInputRef.value) backFileInputRef.value.value = "";
};

const isSubmitDisabled = computed(() => {
  if (clientDepthStore.isSubmittingReference) return true;

  if (isEditing.value) {
    return !formFileName.value.trim();
  }

  if (uploadCategory.value === "document") {
    return !selectedFile.value || !formFileName.value.trim();
  }

  if (uploadCategory.value === "image") {
    if (imageUploadMode.value === "single") {
      return !selectedFile.value || !formFileName.value.trim();
    }
    if (imageUploadMode.value === "dual") {
      return !frontFile.value || !backFile.value || !formFileName.value.trim();
    }
  }

  return false;
});

const submitButtonLabel = computed(() => {
  if (clientDepthStore.isSubmittingReference) {
    return isEditing.value ? "Saving Changes..." : "Uploading...";
  }
  return isEditing.value ? "Save Changes" : "Upload Document";
});

const submitForm = () => {
  const clientId = resolvedClientId.value;
  if (!clientId) return;

  if (isEditing.value) {
    // Edit mode
    const docId = props.existingDoc?.id;
    if (!docId) return;

    let payload = new FormData();
    payload.append("user_id", clientId);
    payload.append("id", docId);
    payload.append("file_id", docId);

    if (formRemarks.value.trim()) {
      payload.append("description", formRemarks.value.trim());
    }
    if (formFileName.value.trim()) {
      payload.append("file_name", formFileName.value.trim());
    }
    if (selectedFile.value) {
      payload.append("file", selectedFile.value);
    }

    clientDepthStore.updateUserReference(clientId, payload, (err, res) => {
      if (!err) {
        emit("success", res);
        closeModal();
      }
    });
    return;
  }

  // Add mode
  let payload = new FormData();
  payload.append("user_id", clientId);

  if (formRemarks.value.trim()) {
    payload.append("description", formRemarks.value.trim());
  }
  if (formFileName.value.trim()) {
    payload.append("file_name", formFileName.value.trim());
  }

  if (uploadCategory.value === "document" || imageUploadMode.value === "single") {
    if (selectedFile.value) {
      payload.append("file", selectedFile.value);
    }
  } else if (uploadCategory.value === "image" && imageUploadMode.value === "dual") {
    if (frontFile.value) {
      payload.append("front", frontFile.value);
    }
    if (backFile.value) {
      payload.append("back", backFile.value);
    }
  }

  clientDepthStore.addUserReference(clientId, payload, (err, res) => {
    if (!err) {
      emit("success", res);
      closeModal();
    }
  });
};

const closeModal = () => {
  resetFormState();
  emit("close");
};
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-active .transform,
.drawer-fade-leave-active .transform {
  transition: transform 0.25s ease;
}
.drawer-fade-enter-from .transform,
.drawer-fade-leave-to .transform {
  transform: translateX(100%);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
