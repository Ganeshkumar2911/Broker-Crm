<template>
  <div
    class="w-full border border-primary-border rounded-xl overflow-hidden bg-background transition-all focus-within:border-primary relative"
  >
    <!-- Editor Toolbar -->
    <div
      class="flex flex-wrap items-center gap-1 p-2 bg-card-background border-b border-primary-border text-secondary-text select-none text-xs"
    >
      <!-- Text Formatting -->
      <button
        type="button"
        @click="format('bold')"
        title="Bold"
        class="px-2.5 py-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors font-bold cursor-pointer"
      >
        <Bold class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="format('italic')"
        title="Italic"
        class="px-2.5 py-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors italic cursor-pointer"
      >
        <Italic class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="format('underline')"
        title="Underline"
        class="px-2.5 py-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors underline cursor-pointer"
      >
        <Underline class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="format('strikeThrough')"
        title="Strikethrough"
        class="px-2.5 py-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors line-through cursor-pointer"
      >
        <Strikethrough class="w-3.5 h-3.5" />
      </button>

      <div class="w-[1px] h-4 bg-primary-border mx-1" />

      <!-- Headings -->
      <button
        type="button"
        @click="formatHeader('h2')"
        title="Heading 2"
        class="px-2.5 py-1 rounded-lg hover:bg-background hover:text-primary transition-colors font-bold text-xs cursor-pointer"
      >
        <Heading2 class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="formatHeader('h3')"
        title="Heading 3"
        class="px-2.5 py-1 rounded-lg hover:bg-background hover:text-primary transition-colors font-bold text-xs cursor-pointer"
      >
        <Heading3 class="w-3.5 h-3.5" />
      </button>

      <div class="w-[1px] h-4 bg-primary-border mx-1" />

      <!-- Lists -->
      <button
        type="button"
        @click="format('insertUnorderedList')"
        title="Bullet List"
        class="p-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
      >
        <List class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="format('insertOrderedList')"
        title="Numbered List"
        class="p-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
      >
        <ListOrdered class="w-3.5 h-3.5" />
      </button>

      <div class="w-[1px] h-4 bg-primary-border mx-1" />

      <!-- Quote, Link, Image -->
      <button
        type="button"
        @click="formatHeader('blockquote')"
        title="Quote"
        class="p-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
      >
        <Quote class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="openLinkModal"
        title="Insert Link"
        class="p-1.5 rounded-lg hover:bg-background hover:text-primary transition-colors cursor-pointer"
      >
        <Link class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="openImageModal"
        title="Insert Image"
        class="p-1.5 rounded-lg hover:bg-background hover:text-primary transition-colors cursor-pointer"
      >
        <Image class="w-3.5 h-3.5" />
      </button>

      <div class="w-[1px] h-4 bg-primary-border mx-1" />

      <!-- Alignment -->
      <button
        type="button"
        @click="format('justifyLeft')"
        title="Align Left"
        class="p-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
      >
        <AlignLeft class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="format('justifyCenter')"
        title="Align Center"
        class="p-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
      >
        <AlignCenter class="w-3.5 h-3.5" />
      </button>

      <div class="w-[1px] h-4 bg-primary-border mx-1" />

      <!-- Actions -->
      <button
        type="button"
        @click="format('removeFormat')"
        title="Clear Formatting"
        class="p-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
      >
        <RemoveFormatting class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="format('undo')"
        title="Undo"
        class="p-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
      >
        <Undo2 class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        @click="format('redo')"
        title="Redo"
        class="p-1.5 rounded-lg hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
      >
        <Redo2 class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Editable Content Area -->
    <div
      ref="editorRef"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="onInput"
      @blur="onInput"
      class="p-4 min-h-[220px] max-h-[420px] overflow-y-auto text-xs text-primary-text focus:outline-none editor-content leading-relaxed bg-background"
    />

    <!-- Custom Link Modal -->
    <div
      v-if="showLinkModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-card-background border border-primary-border rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl"
      >
        <div class="flex justify-between items-center pb-2 border-b border-primary-border">
          <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider">
            Insert Link
          </h4>
          <button
            type="button"
            @click="showLinkModal = false"
            class="text-secondary-text hover:text-primary-text text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div class="space-y-3">
          <div class="space-y-1">
            <label class="text-[11px] text-secondary-text font-medium">Link URL *</label>
            <input
              v-model="linkUrl"
              type="url"
              placeholder="https://panthercapitals.com"
              class="w-full bg-background border border-primary-border rounded-xl px-3 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary"
            />
          </div>
          <div class="space-y-1">
            <label class="text-[11px] text-secondary-text font-medium">Display Text (Optional)</label>
            <input
              v-model="linkText"
              type="text"
              placeholder="Click here"
              class="w-full bg-background border border-primary-border rounded-xl px-3 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-primary-border">
          <button
            type="button"
            @click="showLinkModal = false"
            class="px-3.5 py-1.5 rounded-xl text-xs text-secondary-text hover:text-primary-text cursor-pointer border border-primary-border"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmInsertLink"
            class="bg-primary hover:bg-primary-hover text-white font-bold px-4 py-1.5 rounded-xl text-xs cursor-pointer transition-colors"
          >
            Insert Link
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Image Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-card-background border border-primary-border rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl"
      >
        <div class="flex justify-between items-center pb-2 border-b border-primary-border">
          <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider">
            Insert Image
          </h4>
          <button
            type="button"
            @click="showImageModal = false"
            class="text-secondary-text hover:text-primary-text text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div class="space-y-3">
          <div class="space-y-1">
            <label class="text-[11px] text-secondary-text font-medium">Image Address / URL *</label>
            <input
              v-model="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              class="w-full bg-background border border-primary-border rounded-xl px-3 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-primary-border">
          <button
            type="button"
            @click="showImageModal = false"
            class="px-3.5 py-1.5 rounded-xl text-xs text-secondary-text hover:text-primary-text cursor-pointer border border-primary-border"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmInsertImage"
            class="bg-primary hover:bg-primary-hover text-white font-bold px-4 py-1.5 rounded-xl text-xs cursor-pointer transition-colors"
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  RemoveFormatting,
  Undo2,
  Redo2,
} from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Write your detailed blog content here...",
  },
});

const emit = defineEmits(["update:modelValue"]);
const editorRef = ref(null);

// Custom Modals state
const showLinkModal = ref(false);
const linkUrl = ref("https://");
const linkText = ref("");

const showImageModal = ref(false);
const imageUrl = ref("");

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = props.modelValue || "";
  }
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (editorRef.value && editorRef.value.innerHTML !== newVal) {
      editorRef.value.innerHTML = newVal || "";
    }
  }
);

const onInput = () => {
  if (editorRef.value) {
    const rawHtml = editorRef.value.innerHTML;
    const text = (editorRef.value.innerText || "").trim();
    if (!text && !rawHtml.includes("<img")) {
      if (rawHtml === "<p><br></p>" || rawHtml === "<br>" || rawHtml === "<p></p>") {
        editorRef.value.innerHTML = "";
      }
      emit("update:modelValue", "");
    } else {
      emit("update:modelValue", rawHtml);
    }
  }
};

const format = (cmd, val = null) => {
  document.execCommand(cmd, false, val);
  onInput();
};

const formatHeader = (tag) => {
  document.execCommand("formatBlock", false, tag);
  onInput();
};

// Saved selection for modal insertion
const savedSelection = ref(null);

const saveSelection = () => {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0).cloneRange();
    }
  }
  return null;
};

const restoreSelection = (range) => {
  if (range && window.getSelection) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
};

const insertHtmlAtCaret = (html) => {
  if (editorRef.value) {
    editorRef.value.focus();
  }
  if (savedSelection.value) {
    restoreSelection(savedSelection.value);
  }

  let sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node, lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      document.execCommand("insertHTML", false, html);
    }
  } else {
    document.execCommand("insertHTML", false, html);
  }
  onInput();
};

// Custom Link Modal Handlers
const openLinkModal = () => {
  savedSelection.value = saveSelection();
  linkUrl.value = "https://";
  linkText.value = window.getSelection()?.toString() || "";
  showLinkModal.value = true;
};

const confirmInsertLink = () => {
  if (linkUrl.value && linkUrl.value !== "https://") {
    const text = linkText.value.trim() || linkUrl.value.trim();
    const html = `<a href="${linkUrl.value.trim()}" target="_blank" rel="noopener noreferrer" class="text-primary underline font-medium">${text}</a>`;
    insertHtmlAtCaret(html);
  }
  showLinkModal.value = false;
};

// Custom Image Modal Handlers
const openImageModal = () => {
  savedSelection.value = saveSelection();
  imageUrl.value = "";
  showImageModal.value = true;
};

const confirmInsertImage = () => {
  let url = imageUrl.value ? imageUrl.value.trim() : "";
  if (url) {
    const html = `<div class="my-4"><img src="${url}" alt="Inserted Image" class="max-w-full h-auto rounded-xl border border-primary-border inline-block" /></div>`;
    insertHtmlAtCaret(html);
  }
  showImageModal.value = false;
};
</script>

<style scoped>
.editor-content:empty::before,
.editor-content[data-placeholder]:empty::before,
.editor-content:has(> p:only-child:empty)::before,
.editor-content:has(> p:only-child > br:only-child)::before {
  content: attr(data-placeholder);
  color: var(--color-secondary-text, #94a3b8);
  opacity: 0.5;
  pointer-events: none;
  font-style: normal;
  display: block;
}

.editor-content :deep(h2) {
  font-size: 1.15rem;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary-text, #ffffff);
}

.editor-content :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
  color: var(--color-primary-text, #ffffff);
}

.editor-content :deep(p) {
  margin-bottom: 0.5rem;
}

.editor-content :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}

.editor-content :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}

.editor-content :deep(blockquote) {
  border-left: 3px solid var(--color-primary, #6366f1);
  padding-left: 0.75rem;
  margin: 0.75rem 0;
  font-style: italic;
  opacity: 0.85;
}

.editor-content :deep(a) {
  color: var(--color-primary, #6366f1);
  text-decoration: underline;
}

.editor-content :deep(img) {
  max-width: 100%;
  margin: 0.75rem 0;
}
</style>
