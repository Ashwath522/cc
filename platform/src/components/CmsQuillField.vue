<template>
  <div class="cms-quill-field" :id="id || undefined">
    <quill-editor
      :value="normalized"
      @input="$emit('input', $event)"
      :options="editorOptions"
    />
  </div>
</template>

<script>
import { quillEditor } from 'vue-quill-editor';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

const toolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ color: [] }, { background: [] }],
  ['link'],
  ['clean'],
];

export default {
  name: 'CmsQuillField',
  components: { quillEditor },
  props: {
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },
  },
  computed: {
    normalized() {
      return this.value == null ? '' : String(this.value);
    },
    editorOptions() {
      return {
        theme: 'snow',
        placeholder: this.placeholder || 'Write content…',
        modules: {
          toolbar,
        },
      };
    },
  },
};
</script>

<style scoped>
.cms-quill-field {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  background: #fff;
}
.cms-quill-field >>> .ql-toolbar.ql-snow {
  border: none;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.cms-quill-field >>> .ql-container.ql-snow {
  border: none;
  font-size: 14px;
}
.cms-quill-field >>> .ql-editor {
  min-height: 200px;
}
.cms-quill-field >>> .ql-editor.ql-blank::before {
  color: #94a3b8;
  font-style: normal;
}
</style>
