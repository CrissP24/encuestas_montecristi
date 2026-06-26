import { useState, useMemo } from 'react';
import { formService } from '../services/formService';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { FIELD_TYPE_LABELS } from '../utils/constants';
import {
  FileText, Plus, Trash2, Send, PlusCircle, Eye, EyeOff,
  ChevronUp, ChevronDown, Copy, GripVertical, Check, Type,
  Hash, CircleDot, CheckSquare, ToggleLeft, Clock, Calendar
} from 'lucide-react';

const FIELD_ICONS = {
  text: Type,
  number: Hash,
  single_choice: CircleDot,
  multi_choice: CheckSquare,
  yes_no: ToggleLeft,
};

function QuestionPreview({ field }) {
  if (field.type === 'text') {
    return <div className="question-preview"><div className="preview-input">Respuesta de texto</div></div>;
  }
  if (field.type === 'number') {
    return <div className="question-preview"><div className="preview-input">Respuesta numérica</div></div>;
  }
  if (field.type === 'single_choice') {
    return (
      <div className="question-preview">
        {(field.options || []).map((opt, i) => (
          <div key={i} className="preview-option"><div className="radio-dot" />{opt}</div>
        ))}
      </div>
    );
  }
  if (field.type === 'multi_choice') {
    return (
      <div className="question-preview">
        {(field.options || []).map((opt, i) => (
          <div key={i} className="preview-option"><div className="checkbox-dot" />{opt}</div>
        ))}
      </div>
    );
  }
  if (field.type === 'yes_no') {
    return (
      <div className="question-preview">
        <div className="yesno-group">
          <div className="yesno-btn">Sí</div>
          <div className="yesno-btn">No</div>
        </div>
      </div>
    );
  }
  return null;
}

export default function Forms() {
  const { user, isSuperAdmin } = useAuth();
  const projects = isSuperAdmin() ? projectService.getAll() : projectService.getByCompany(user.company_id);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [newFormDesc, setNewFormDesc] = useState('');
  const [fieldForm, setFieldForm] = useState({ type: 'text', label: '', required: true, options: [] });
  const [optionInput, setOptionInput] = useState('');
  const [activeFieldId, setActiveFieldId] = useState(null);

  useMemo(() => {
    if (selectedProject) {
      setForms(formService.getByProject(selectedProject));
      setSelectedForm(null);
    }
  }, [selectedProject]);

  const reload = () => {
    setForms(formService.getByProject(selectedProject));
  };

  const selectForm = (f) => {
    const loaded = formService.getById(f.id);
    setSelectedForm(loaded);
    setActiveFieldId(null);
    setShowPreview(false);
  };

  const handleCreateForm = () => {
    if (!newFormName.trim()) return;
    formService.create({ project_id: selectedProject, name: newFormName, description: newFormDesc });
    setShowCreateModal(false);
    setNewFormName('');
    setNewFormDesc('');
    reload();
  };

  const openFieldModal = () => {
    setFieldForm({ type: 'text', label: '', required: true, options: [] });
    setOptionInput('');
    setShowFieldModal(true);
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    setFieldForm({ ...fieldForm, options: [...fieldForm.options, optionInput.trim()] });
    setOptionInput('');
  };

  const removeOption = (idx) => {
    setFieldForm({ ...fieldForm, options: fieldForm.options.filter((_, i) => i !== idx) });
  };

  const handleAddField = () => {
    if (!fieldForm.label.trim()) return;
    formService.addField(selectedForm.id, fieldForm);
    setShowFieldModal(false);
    setSelectedForm(formService.getById(selectedForm.id));
    reload();
  };

  const handleRemoveField = (fieldId) => {
    formService.removeField(selectedForm.id, fieldId);
    setSelectedForm(formService.getById(selectedForm.id));
  };

  const handleMoveField = (idx, direction) => {
    const fields = [...(selectedForm._draftFields || [])];
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= fields.length) return;
    [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
    formService.updateDraftFields(selectedForm.id, fields);
    setSelectedForm(formService.getById(selectedForm.id));
  };

  const handleDuplicateField = (field) => {
    formService.addField(selectedForm.id, { type: field.type, label: field.label + ' (copia)', required: field.required, options: [...(field.options || [])] });
    setSelectedForm(formService.getById(selectedForm.id));
  };

  const handlePublish = () => {
    if (confirm('¿Publicar esta versión del formulario? Los campos ya no podrán editarse una vez publicados.')) {
      const ver = formService.publishVersion(selectedForm.id);
      if (ver) alert(`Versión ${ver.version} publicada exitosamente`);
      setSelectedForm(formService.getById(selectedForm.id));
      reload();
    }
  };

  const needsOptions = (type) => ['single_choice', 'multi_choice'].includes(type);
  const draftFields = selectedForm?._draftFields || [];
  const isPublished = selectedForm?.status === 'published' && draftFields.length === 0;

  // Get all fields to show (draft or latest published version)
  const displayFields = draftFields.length > 0 ? draftFields :
    (selectedForm?.versions?.length > 0 ? selectedForm.versions[selectedForm.versions.length - 1].fields : []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Constructor de Formularios</h2>
          <p>Diseña y gestiona encuestas con campos dinámicos estilo Google Forms</p>
        </div>
      </div>

      <div className="filter-bar">
        <label style={{ fontWeight: 600, fontSize: 13 }}>Proyecto:</label>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ minWidth: 260 }}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} /> Nuevo Formulario
        </button>
      </div>

      <div className="form-builder-layout">
        {/* Panel izquierdo - lista de formularios */}
        <div className="form-list-panel">
          <h4>Formularios</h4>
          {forms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <FileText size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>Sin formularios</p>
            </div>
          ) : forms.map(f => (
            <div
              key={f.id}
              onClick={() => selectForm(f)}
              className={`form-list-item ${selectedForm?.id === f.id ? 'active' : ''}`}
            >
              <div className="form-name">
                <FileText size={15} style={{ color: 'var(--primary-light)' }} />
                {f.name}
              </div>
              <div className="form-meta">
                <span className={`badge ${f.status === 'published' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                  {f.status === 'published' ? 'Publicado' : 'Borrador'}
                </span>
                <span>{(f.versions || []).length}v</span>
              </div>
            </div>
          ))}
        </div>

        {/* Panel derecho - canvas del formulario */}
        <div>
          {!selectedForm ? (
            <div className="form-canvas">
              <div className="empty-state" style={{ padding: '80px 24px' }}>
                <div className="empty-icon"><FileText size={32} style={{ color: 'var(--text-muted)' }} /></div>
                <h3>Selecciona un formulario</h3>
                <p>Elige uno de la lista o crea un formulario nuevo para comenzar a diseñar</p>
              </div>
            </div>
          ) : showPreview ? (
            /* VISTA DE PREVISUALIZACIÓN */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Previsualización del Formulario</h3>
                <button className="btn btn-outline btn-sm" onClick={() => setShowPreview(false)}>
                  <EyeOff size={14} /> Volver al editor
                </button>
              </div>
              <div style={{ maxWidth: 680, margin: '0 auto' }}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  borderRadius: '14px 14px 0 0', padding: 32, color: '#fff', position: 'relative'
                }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'var(--accent)' }} />
                  <h2 style={{ fontSize: 24, fontWeight: 700 }}>{selectedForm.name}</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
                    {selectedForm.description || 'Formulario de encuesta'}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
                    {displayFields.length} pregunta(s) · {displayFields.filter(f => f.required).length} obligatoria(s)
                  </p>
                </div>
                <div style={{ background: '#fff', borderRadius: '0 0 14px 14px', padding: 32, boxShadow: 'var(--shadow)' }}>
                  {displayFields.map((field, idx) => (
                    <div key={field.id} style={{ marginBottom: 28, paddingBottom: 20, borderBottom: idx < displayFields.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                        {idx + 1}. {field.label}
                        {field.required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
                      </label>
                      {field.type === 'text' && (
                        <input type="text" className="form-control" placeholder="Tu respuesta" disabled />
                      )}
                      {field.type === 'number' && (
                        <input type="number" className="form-control" placeholder="Tu respuesta numérica" disabled />
                      )}
                      {field.type === 'single_choice' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(field.options || []).map((opt, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14 }}>
                              <input type="radio" name={`preview_${field.id}`} disabled style={{ accentColor: 'var(--primary)' }} />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}
                      {field.type === 'multi_choice' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(field.options || []).map((opt, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14 }}>
                              <input type="checkbox" disabled style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}
                      {field.type === 'yes_no' && (
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button className="btn btn-outline" disabled style={{ flex: 1 }}>Sí</button>
                          <button className="btn btn-outline" disabled style={{ flex: 1 }}>No</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {displayFields.length > 0 && (
                    <div style={{ textAlign: 'center', paddingTop: 16 }}>
                      <button className="btn btn-primary btn-lg" disabled>Enviar Formulario</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* VISTA DE EDITOR */
            <div className="form-canvas">
              {/* Header del formulario */}
              <div className="form-canvas-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={22} />
                  {selectedForm.name}
                </h3>
                <div className="form-status">
                  <span className={`badge ${selectedForm.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedForm.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                    {(selectedForm.versions || []).length} versión(es) · {displayFields.length} campo(s)
                  </span>
                </div>
              </div>

              <div className="form-canvas-body">
                {/* Acciones */}
                <div className="form-canvas-actions">
                  {!isPublished && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={openFieldModal}>
                        <PlusCircle size={15} /> Agregar Pregunta
                      </button>
                      {draftFields.length > 0 && (
                        <button className="btn btn-success btn-sm" onClick={handlePublish}>
                          <Send size={15} /> Publicar Versión
                        </button>
                      )}
                    </>
                  )}
                  {isPublished && (
                    <button className="btn btn-outline btn-sm" onClick={() => {
                      formService.createNewDraft(selectedForm.id);
                      setSelectedForm(formService.getById(selectedForm.id));
                      reload();
                    }}>
                      <Plus size={14} /> Nueva Versión (Borrador)
                    </button>
                  )}
                  {displayFields.length > 0 && (
                    <button className="btn btn-outline btn-sm" onClick={() => setShowPreview(true)} style={{ marginLeft: 'auto' }}>
                      <Eye size={14} /> Previsualizar
                    </button>
                  )}
                </div>

                {/* Versiones publicadas */}
                {(selectedForm.versions || []).length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 12 }}>
                      Historial de Versiones
                    </h5>
                    <div className="version-timeline">
                      {selectedForm.versions.map(v => (
                        <div key={v.id} className="version-item">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>Versión {v.version}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {new Date(v.published_at).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.fields.length} campos</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campos / Preguntas */}
                {!isPublished && (
                  <>
                    <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 16 }}>
                      Preguntas del Formulario {draftFields.length > 0 && `(${draftFields.length})`}
                    </h5>

                    {draftFields.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <PlusCircle size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <p style={{ fontSize: 14, fontWeight: 500 }}>Aún no hay preguntas</p>
                        <p style={{ fontSize: 13, marginTop: 4 }}>Agrega campos al formulario usando el botón "Agregar Pregunta"</p>
                      </div>
                    ) : (
                      draftFields.map((field, idx) => {
                        const Icon = FIELD_ICONS[field.type] || Type;
                        return (
                          <div
                            key={field.id}
                            className={`question-card ${activeFieldId === field.id ? 'active' : ''}`}
                            onClick={() => setActiveFieldId(field.id)}
                          >
                            <div className="question-number">
                              {idx + 1}
                            </div>
                            <div className="question-header">
                              <div className="question-label">
                                {field.label}
                                {field.required && <span className="required-mark">*</span>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="question-type-badge">
                                  <Icon size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                  {FIELD_TYPE_LABELS[field.type]}
                                </span>
                                <div className="question-actions">
                                  <button className="btn btn-ghost btn-icon btn-xs" onClick={(e) => { e.stopPropagation(); handleMoveField(idx, -1); }}
                                    title="Mover arriba" disabled={idx === 0}>
                                    <ChevronUp size={14} />
                                  </button>
                                  <button className="btn btn-ghost btn-icon btn-xs" onClick={(e) => { e.stopPropagation(); handleMoveField(idx, 1); }}
                                    title="Mover abajo" disabled={idx === draftFields.length - 1}>
                                    <ChevronDown size={14} />
                                  </button>
                                  <button className="btn btn-ghost btn-icon btn-xs" onClick={(e) => { e.stopPropagation(); handleDuplicateField(field); }}
                                    title="Duplicar">
                                    <Copy size={14} />
                                  </button>
                                  <button className="btn btn-ghost btn-icon btn-xs" onClick={(e) => { e.stopPropagation(); handleRemoveField(field.id); }}
                                    title="Eliminar" style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <QuestionPreview field={field} />
                          </div>
                        );
                      })
                    )}

                    {/* Botón agregar al final */}
                    {!isPublished && (
                      <button className="add-question-btn" onClick={openFieldModal}>
                        <PlusCircle size={18} /> Agregar nueva pregunta
                      </button>
                    )}
                  </>
                )}

                {/* Vista de campos publicados (solo lectura) */}
                {isPublished && displayFields.length > 0 && (
                  <>
                    <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 16 }}>
                      Campos de la Versión Actual ({displayFields.length})
                    </h5>
                    {displayFields.map((field, idx) => {
                      const Icon = FIELD_ICONS[field.type] || Type;
                      return (
                        <div key={field.id} className="question-card">
                          <div className="question-number">{idx + 1}</div>
                          <div className="question-header">
                            <div className="question-label">
                              {field.label}
                              {field.required && <span className="required-mark">*</span>}
                            </div>
                            <span className="question-type-badge">
                              <Icon size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                              {FIELD_TYPE_LABELS[field.type]}
                            </span>
                          </div>
                          <QuestionPreview field={field} />
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear formulario */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3><FileText size={20} style={{ color: 'var(--primary)' }} /> Nuevo Formulario</h3>
            <div className="form-group">
              <label>Nombre del formulario</label>
              <input className="form-control" value={newFormName} onChange={e => setNewFormName(e.target.value)} placeholder="Ej: Encuesta Socioeconómica 2026" />
            </div>
            <div className="form-group">
              <label>Descripción (opcional)</label>
              <textarea className="form-control" value={newFormDesc} onChange={e => setNewFormDesc(e.target.value)} placeholder="Breve descripción del propósito del formulario" rows={3} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreateForm}>Crear Formulario</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar campo */}
      {showFieldModal && (
        <div className="modal-overlay" onClick={() => setShowFieldModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3><PlusCircle size={20} style={{ color: 'var(--primary)' }} /> Agregar Pregunta</h3>

            {/* Selector de tipo visual */}
            <div className="form-group">
              <label>Tipo de pregunta</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {Object.entries(FIELD_TYPE_LABELS).map(([k, v]) => {
                  const Icon = FIELD_ICONS[k] || Type;
                  return (
                    <div
                      key={k}
                      onClick={() => setFieldForm({...fieldForm, type: k, options: []})}
                      style={{
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${fieldForm.type === k ? 'var(--primary)' : 'var(--border)'}`,
                        background: fieldForm.type === k ? 'var(--primary-50)' : '#fff',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        transition: 'all 0.15s',
                      }}
                    >
                      <Icon size={20} style={{ color: fieldForm.type === k ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: fieldForm.type === k ? 'var(--primary)' : 'var(--text-secondary)', textAlign: 'center' }}>{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Pregunta</label>
              <input className="form-control" value={fieldForm.label} onChange={e => setFieldForm({...fieldForm, label: e.target.value})}
                placeholder="Ej: ¿Cuál es el nombre del jefe de hogar?" />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={fieldForm.required} onChange={e => setFieldForm({...fieldForm, required: e.target.checked})}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
                Campo obligatorio
              </label>
            </div>

            {needsOptions(fieldForm.type) && (
              <div className="form-group">
                <label>Opciones de respuesta</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-control" value={optionInput} onChange={e => setOptionInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
                    placeholder="Escribe una opción y presiona Enter" />
                  <button className="btn btn-primary btn-sm" onClick={addOption} type="button">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="multi-select-tags" style={{ marginTop: 10 }}>
                  {fieldForm.options.map((opt, i) => (
                    <span key={i} className="tag">{opt} <span className="remove" onClick={() => removeOption(i)}>×</span></span>
                  ))}
                </div>
                {fieldForm.options.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Agrega al menos 2 opciones para este tipo de campo</p>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowFieldModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAddField} disabled={!fieldForm.label.trim()}>
                <Check size={14} /> Agregar Pregunta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
