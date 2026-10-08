import { defineStore } from "pinia";
import { ref, reactive } from "vue";

import apiRequest from "@/api/request";
import urls from "@/api/urls";

import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useEmailTriggerStore = defineStore("emailTrigger", () => {
  const snackbar = useSnackbarStore();

  // ─────────────────────────────────────
  // State
  // ─────────────────────────────────────

  const loading = ref(false);

  const sendLoading = ref(false);

  const searchTemplatesLoading = ref(false);

  const searchClientsLoading = ref(false);

  const error = ref(null);

  const isFetched = ref(false);

  // ─────────────────────────────────────
  // Existing Template Flow
  // ─────────────────────────────────────

  const selectedTemplate = ref(null);

  const templateOptions = ref([]);

  const selectedRecipients = ref([]);

  // ─────────────────────────────────────
  // Custom Email Flow
  // ─────────────────────────────────────

  const customEmail = reactive({
    subject: "",
    body_html: "",
    tag: "",
    variables: [],
  });

  // ─────────────────────────────────────
  // Client Search
  // ─────────────────────────────────────

  const clientOptions = ref([]);

  // ─────────────────────────────────────
  // Parse Variables
  // ─────────────────────────────────────

  const parseVariables = (html = "") => {
    const matches =
      html
        .match(/{{(.*?)}}/g)
        ?.map((item) => item.replace("{{", "").replace("}}", "").trim()) || [];

    return [...new Set(matches)];
  };

  // ─────────────────────────────────────
  // Search Templates
  // ─────────────────────────────────────

  const searchTemplates = (search = "") => {
    searchTemplatesLoading.value = true;

    const successHandler = (res) => {
      templateOptions.value = (res?.data || []).map((template) => ({
        label: template.name,
        value: template.id,
        ...template,
      }));

      searchTemplatesLoading.value = false;
    };

    const failureHandler = (err) => {
      searchTemplatesLoading.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch templates.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.emailTemplates.list, {
      params: {
        search,
      },

      isTokenRequired: true,

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

  // ─────────────────────────────────────
  // Search Clients
  // ─────────────────────────────────────

  const searchClients = (search = "") => {
    searchClientsLoading.value = true;

    const successHandler = (res) => {
      clientOptions.value = (res?.data || []).map((client) => ({
        label: `${client.name} (${client.email})`,
        value: client.id,
        email: client.email,
        name: client.name,
      }));

      searchClientsLoading.value = false;
    };

    const failureHandler = (err) => {
      searchClientsLoading.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch clients.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.clientLedger.allClients, {
      params: {
        search,
      },

      isTokenRequired: true,

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

  // ─────────────────────────────────────
  // Send Existing Template
  // ─────────────────────────────────────

  const sendTemplateEmail = (targetGroup = null) => {
    if (!selectedTemplate.value) {
      snackbar.show("Please select a template.", "error");
      return;
    }

    if (!targetGroup && !selectedRecipients.value.length) {
      snackbar.show("Please select recipients.", "error");
      return;
    }

    sendLoading.value = true;

    const payload = {
      emails: targetGroup || selectedRecipients.value.map((item) => item.email),

      template_code: selectedTemplate.value.code,

      variables: selectedTemplate.value.available_variables || [],
    };

    const successHandler = (res) => {
      sendLoading.value = false;

      snackbar.show(res?.message || "Email sent successfully.", "success");

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    };

    const failureHandler = (err) => {
      sendLoading.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to send email.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.emailTemplates.manual, {
      data: payload,

      isTokenRequired: true,

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

  // ─────────────────────────────────────
  // Send Custom Email
  // ─────────────────────────────────────

  const sendCustomEmail = (targetGroup = null) => {
    // alert("clicked")
    if (!customEmail.subject) {
      snackbar.show("Subject is required.", "error");
      return;
    }

    if (!customEmail.body_html) {
      snackbar.show("Email body is required.", "error");
      return;
    }

    if (!targetGroup && !selectedRecipients.value.length) {
      snackbar.show("Please select recipients.", "error");
      return;
    }

    sendLoading.value = true;

    const payload = {
      emails: targetGroup || selectedRecipients.value.map((item) => item.email),

      subject: customEmail.subject,

      body_html: customEmail.body_html,

      tag: customEmail.tag,

      variables: parseVariables(customEmail.body_html),
    };

    const successHandler = (res) => {
      sendLoading.value = false;

      snackbar.show(res?.message || "Email sent successfully.", "success");

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    };

    const failureHandler = (err) => {
      sendLoading.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to send email.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.emailTemplates.manual, {
      data: payload,

      isTokenRequired: true,

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

  // ─────────────────────────────────────
  // Reset
  // ─────────────────────────────────────

  const reset = () => {
    loading.value = false;

    sendLoading.value = false;

    searchTemplatesLoading.value = false;

    searchClientsLoading.value = false;

    error.value = null;

    isFetched.value = false;

    selectedTemplate.value = null;

    templateOptions.value = [];

    selectedRecipients.value = [];

    clientOptions.value = [];

    Object.assign(customEmail, {
      subject: "",
      body_html: "",
      variables: [],
    });
  };

  // ─────────────────────────────────────
  // Success Callback
  // ─────────────────────────────────────

  let onSuccessCallback = null;

  const setOnSuccessCallback = (callback) => {
    onSuccessCallback = callback;
  };

  return {
    loading,
    sendLoading,
    searchTemplatesLoading,
    searchClientsLoading,

    error,
    isFetched,

    selectedTemplate,
    templateOptions,

    selectedRecipients,
    clientOptions,

    customEmail,

    searchTemplates,
    searchClients,

    parseVariables,

    sendTemplateEmail,
    sendCustomEmail,

    reset,

    setOnSuccessCallback,
  };
});
