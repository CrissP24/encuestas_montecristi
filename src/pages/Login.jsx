import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Globe, Shield, BarChart3, Map, Lock, Mail, CheckCircle, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';

const FEATURES = [
  { icon: Shield,   text: 'Roles y permisos granulares',      desc: 'Control de acceso por proyecto y empresa' },
  { icon: BarChart3,text: 'Estadísticas en tiempo real',       desc: 'Dashboards diferenciados por rol' },
  { icon: Map,      text: 'Geofencing y validación GPS',       desc: 'Sectores operativos verificados' },
  { icon: Zap,      text: 'Captura offline optimizada',        desc: 'Sincronización automática al reconectar' },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = e => {
    e.preventDefault(); setError(''); setLoading(true);
    setTimeout(() => {
      const r = login(email, password);
      if (!r.success) setError(r.error);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="login-page">
      {/* ── Left branding panel ── */}
      <div className="login-left">
        <div className="login-left-header">
          <div className="login-brand-row">
            <div className="login-brand-icon">
              <Globe size={28} color="#fff" />
            </div>
            <div>
              <div className="login-brand-label">Plataforma de Gestión</div>
              <div className="login-brand-name">TERRANALYTICS</div>
            </div>
          </div>
          <h1>Inteligencia<br /><span>Territorial</span><br />para el Sector Público</h1>
          <p>Sistema integral de recopilación, monitoreo y análisis de datos georreferenciados para organizaciones gubernamentales.</p>
        </div>

        <div className="login-features">
          {FEATURES.map((f, i) => (
            <div key={i} className="login-feature-item">
              <div className="login-feature-icon">
                <f.icon size={19} color="rgba(147,197,253,.9)" />
              </div>
              <div>
                <div className="login-feature-title">{f.text}</div>
                <div className="login-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="login-left-stats">
          {[['150+','Proyectos activos'],['2.4K','Encuestas recopiladas'],['99.9%','Disponibilidad']].map(([v,l]) => (
            <div key={l} className="login-stat"><h3>{v}</h3><span>{l}</span></div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-right">
        {/* Card */}
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 58, height: 58, borderRadius: 17, margin: '0 auto 18px',
              background: 'linear-gradient(135deg, var(--primary-50), #dbeafe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--primary-100)',
              boxShadow: '0 8px 24px rgba(37,99,235,.12)',
            }}>
              <Lock size={24} color="var(--primary)" />
            </div>
            <h1>Bienvenido</h1>
            <p className="subtitle">Ingresa tus credenciales para acceder</p>
          </div>

          {error && (
            <div className="error">
              <Shield size={13} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input className="form-control" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com" required
                  style={{ paddingLeft: 42 }} />
              </div>
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input className="form-control" type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ paddingLeft: 42, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 3, display: 'flex', alignItems: 'center' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}
              style={{ marginTop: 4 }}>
              {loading ? 'Verificando...' : <><span>Acceder al Sistema</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', marginTop: 18, fontSize: 12, color: 'var(--text-muted)' }}>
            <CheckCircle size={12} color="var(--success)" />
            <span>Conexión segura · Datos encriptados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
