// src/composables/useTextareaEditor.js
import { ref, computed } from 'vue';

export function useTextareaEditor(initialContent = '') {
  // Reactive state
  const content = ref(initialContent);
  const textareaRef = ref(null);
  const selectedPlaceholder = ref(''); // Tracks dropdown selection

  // Available placeholders
  const placeholders = [
    { value: 'member_name', label: 'Member Name' },
    { value: 'member_number', label: 'Member Number' },
    { value: 'member_id', label: 'Member ID' },
    
  ];

  // Insert placeholder at cursor position
  const insertPlaceholder = () => {
    if (!selectedPlaceholder.value || !textareaRef.value) return;

    const textarea = textareaRef.value;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const placeholder = `{{ ${selectedPlaceholder.value} }}`;

    // Insert placeholder at cursor
    content.value =
      content.value.substring(0, startPos) +
      placeholder +
      content.value.substring(endPos);

    // Move cursor after the inserted placeholder
    const newPos = startPos + placeholder.length;
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = newPos;
      textarea.focus();
    }, 0);

    // Reset dropdown
    selectedPlaceholder.value = '';
  };

  // Computed property for v-model
  const contentModel = computed({
    get: () => content.value,
    set: value => (content.value = value),
  });

  return {
    content,contentModel,textareaRef,placeholders,selectedPlaceholder,insertPlaceholder,
  };
}