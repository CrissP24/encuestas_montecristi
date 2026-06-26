import { getStore, setStore, generateId } from '../utils/helpers';
import { SEED_FORMS } from '../utils/constants';

const KEY = 'ta_forms';

function ensure() {
  if (!getStore(KEY)) setStore(KEY, SEED_FORMS);
  return getStore(KEY);
}

export const formService = {
  getAll() {
    return ensure();
  },

  getByProject(projectId) {
    return ensure().filter(f => f.project_id === projectId);
  },

  getById(id) {
    return ensure().find(f => f.id === id);
  },

  getVersionById(versionId) {
    const forms = ensure();
    for (const form of forms) {
      const ver = (form.versions || []).find(v => v.id === versionId);
      if (ver) return { ...ver, formName: form.name, formId: form.id };
    }
    return null;
  },

  create(data) {
    const forms = ensure();
    const form = { id: generateId('f'), ...data, status: 'draft', versions: [], created_at: new Date().toISOString() };
    forms.push(form);
    setStore(KEY, forms);
    return form;
  },

  update(id, data) {
    const forms = ensure();
    const idx = forms.findIndex(f => f.id === id);
    if (idx === -1) return null;
    forms[idx] = { ...forms[idx], ...data };
    setStore(KEY, forms);
    return forms[idx];
  },

  addField(formId, field) {
    const forms = ensure();
    const form = forms.find(f => f.id === formId);
    if (!form || form.status === 'published') return null;
    if (!form._draftFields) form._draftFields = [];
    form._draftFields.push({ id: generateId('fd'), ...field });
    setStore(KEY, forms);
    return form;
  },

  updateDraftFields(formId, fields) {
    const forms = ensure();
    const form = forms.find(f => f.id === formId);
    if (!form) return null;
    form._draftFields = fields;
    setStore(KEY, forms);
    return form;
  },

  removeField(formId, fieldId) {
    const forms = ensure();
    const form = forms.find(f => f.id === formId);
    if (!form) return null;
    form._draftFields = (form._draftFields || []).filter(f => f.id !== fieldId);
    setStore(KEY, forms);
    return form;
  },

  publishVersion(formId) {
    const forms = ensure();
    const form = forms.find(f => f.id === formId);
    if (!form || !form._draftFields || form._draftFields.length === 0) return null;
    const versionNum = (form.versions || []).length + 1;
    const version = {
      id: generateId('fv'),
      form_id: formId,
      version: versionNum,
      published_at: new Date().toISOString(),
      fields: [...form._draftFields]
    };
    form.versions = [...(form.versions || []), version];
    form.status = 'published';
    form._draftFields = [];
    setStore(KEY, forms);
    return version;
  },

  // Reset a draft to allow new version
  createNewDraft(formId) {
    const forms = ensure();
    const form = forms.find(f => f.id === formId);
    if (!form) return null;
    form.status = 'draft';
    form._draftFields = [];
    setStore(KEY, forms);
    return form;
  }
};
