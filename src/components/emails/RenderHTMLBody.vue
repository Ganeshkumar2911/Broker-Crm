<template>
  <div class="email-preview-container">
    <iframe
      :srcdoc="safeHtml"
      sandbox="allow-popups"
      loading="lazy"
      class="email-iframe no-scrollbar border border-primary-border"
    ></iframe>
  </div>
</template>

<script setup>
import { computed } from "vue";
import DOMPurify from "dompurify";

const props = defineProps({
  htmlContent: {
    type: String,
    required: true,
  },
});

const safeHtml = computed(() => {
  const hideScrollbarStyle = `
    <style>
      /* Chrome, Safari, and Opera */
      html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
      /* IE and Edge */
      html, body { -ms-overflow-style: none !important; }
      /* Firefox */
      html, body { scrollbar-width: none !important; }
    </style>
  `;

  const combinedHtml = hideScrollbarStyle + (props.htmlContent || "");

  return DOMPurify.sanitize(combinedHtml, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ["style", "meta"],
  });
});
</script>

<style scoped>
.email-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  min-height: 0;
}

.email-iframe {
  flex: 1;
  width: 100%;
  height: 100%;
  border-radius: 7px;
}
</style>
