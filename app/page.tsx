'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [pepActivo, setPepActivo] = useState('MDO');
  const [cargando, setCargando] = useState<boolean>(true);

  // Datos Firebase
  const [datos, setDatos] = useState<any[]>([]); // projects
  const [tutores, setTutores] = useState<any[]>([]); // tutors
  const [maestrantes, setMaestrantes] = useState<any[]>([]); // students
  const [sistema, setSistema] = useState<any>(null); // system (direccion_secretarias)

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [busquedaMaestrantes, setBusquedaMaestrantes] = useState('');
  const [busquedaTutores, setBusquedaTutores] = useState('');

  // Modales
  const [mostrarModalProyecto, setMostrarModalProyecto] = useState(false);
  const [mostrarModalMaestrante, setMostrarModalMaestrante] = useState(false);
  const [mostrarModalTutor, setMostrarModalTutor] = useState(false);
  
  // Estados para nuevos registros
  const [nuevoProyecto, setNuevoProyecto] = useState({ programaKey: 'MDGEVA', codigoInvestigacion: '', correoAutor: '', tutorPrincipal: '', semestre: '1', consecutivoConfirmadoPorTutor: false, titulo: '' });
  const [nuevoMaestrante, setNuevoMaestrante] = useState({ nombreCompleto: '', correoInstitucional: '', cedula: '', programaKey: 'MDGEVA', semestre: '1', tipoEstudiante: 'Activo' });
  const [nuevoTutor, setNuevoTutor] = useState({ nombreCompleto: '', programa: 'MDGEVA', nivelFormacion: '', idiomasRefleja: '', correoInstitucional: '', grupoInvestigacion: '', modalidadColoquio: 'Presencial' });

  async function leerDatos() {
    setCargando(true);
    try {
      const [pSnap, tSnap, mSnap, sSnap] = await Promise.all([
        getDocs(collection(db, 'projects')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'tutors')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'students')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'system')).catch(() => ({ docs: [] }))
      ]);
      setDatos(pSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      setTutores(tSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      setMaestrantes(mSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      
      // Extraer datos del sistema (secretarías/dirección) si existen
      const sysDocs = sSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      const dirSec = sysDocs.find(d => d.id === 'direccion_secretarias' || d.direccion);
      if (dirSec) setSistema(dirSec);

    } catch (e) { console.error(e); } finally { setCargando(false); }
  }

  useEffect(() => { leerDatos(); }, []);

  // Filtrado ajustado a los campos reales
  const proyectosFiltrados = datos.filter(p => (p.codigoInvestigacion || '').toLowerCase().includes(busqueda.toLowerCase()) || (p.titulo || '').toLowerCase().includes(busqueda.toLowerCase()));
  const maestrantesFiltrados = maestrantes.filter(m => (m.nombreCompleto || '').toLowerCase().includes(busquedaMaestrantes.toLowerCase()) || (m.correoInstitucional || '').toLowerCase().includes(busquedaMaestrantes.toLowerCase()));
  const tutoresFiltrados = tutores.filter(t => (t.nombreCompleto || '').toLowerCase().includes(busquedaTutores.toLowerCase()));

  const enmascararDocumento = (doc: string) => { if (!doc) return 'Sin registrar'; if (doc.length <= 4) return '***' + doc; return '***' + doc.slice(-4); };
  const obtenerIniciales = (nombre: string) => { if (!nombre) return 'NA'; const partes = String(nombre).trim().split(' '); return partes.length >= 2 ? (partes[0][0] + partes[1][0]).toUpperCase() : String(nombre).substring(0, 2).toUpperCase(); };

  const guardarMaestrante = async (e: any) => { e.preventDefault(); await addDoc(collection(db, 'students'), nuevoMaestrante); leerDatos(); setMostrarModalMaestrante(false); };
  const guardarTutor = async (e: any) => { e.preventDefault(); await addDoc(collection(db, 'tutors'), nuevoTutor); leerDatos(); setMostrarModalTutor(false); };
  const guardarProyecto = async (e: any) => { e.preventDefault(); await addDoc(collection(db, 'projects'), nuevoProyecto); leerDatos(); setMostrarModalProyecto(false); };

  const programasPEP = [
    { id: 'MDO', snies: '12852', nombre: 'Maestría en Docencia', mod: '100% Virtual', cred: '41', num: 2 },
    { id: 'MDL', snies: '106100', nombre: 'Maestría en Didáctica de las Lenguas', mod: 'Presencial', cred: '45', num: 2 },
    { id: 'MLGE', snies: '110985', nombre: 'Maestría en Liderazgo y Gestión...', mod: 'Virtual', cred: '47', num: 4 },
    { id: 'MDGEVA', snies: '108342', nombre: 'Maestría en Diseño y Gestión...', mod: '100% Virtual', cred: '49', num: 4 }
  ];

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 1. TOP BAR */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#111', color: 'white', padding: '0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>ULS</div>
          <div><div style={{ fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1' }}>Maestrías FCE-ULS</div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Facultad de Ciencias de la Educación</div></div>
          <span style={{ fontSize: '0.7rem', border: '1px solid #93c5fd', color: '#2563eb', padding: '2px 8px', borderRadius: '12px', marginLeft: '1rem' }}>EN LÍNEA</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => { setVistaActiva('tutores'); setMostrarModalTutor(true); }} style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>+ Nuevo Tutor</button>
          <button onClick={() => { setVistaActiva('maestrantes'); setMostrarModalMaestrante(true); }} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>+ Nuevo Maestrante</button>
          <button onClick={() => { setVistaActiva('proyectos'); setMostrarModalProyecto(true); }} style={{ backgroundColor: '#1f2937', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>+ Nuevo Proyecto</button>
        </div>
      </div>

      {/* 2. NAVEGACIÓN */}
      <div style={{ backgroundColor: 'white', padding: '1rem 2rem', borderBottom: '2px solid #e5e7eb', display: 'flex', gap: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'inicio', label: 'Inicio', tag: 'Portal' },
          { id: 'proyectos', label: 'Proyectos', count: datos.length },
          { id: 'tutores', label: 'Tutores', count: tutores.length },
          { id: 'maestrantes', label: 'Maestrantes', count: maestrantes.length },
          { id: 'mallas', label: 'Mallas y PEP', tag: 'Académico' }
        ].map(item => (
          <button key={item.id} onClick={() => setVistaActiva(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: vistaActiva === item.id ? '#1e3a8a' : 'transparent', color: vistaActiva === item.id ? 'white' : '#4b5563', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: '600', cursor: 'pointer' }}>
            {item.label} 
            {item.count !== undefined && <span style={{ backgroundColor: vistaActiva === item.id ? '#3b82f6' : '#f3f4f6', color: vistaActiva === item.id ? 'white' : '#111', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>{item.count}</span>}
            {item.tag && <span style={{ backgroundColor: vistaActiva === item.id ? '#3b82f6' : '#fef08a', color: vistaActiva === item.id ? 'white' : '#854d0e', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>{item.tag}</span>}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        
        {/* ================= VISTA: INICIO ================= */}
        {vistaActiva === 'inicio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', color: 'white', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ padding: '4rem 3rem' }}>
                <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px' }}>Facultad de Ciencias de la Educación • Universidad de La Salle</div>
                <h1 style={{ fontSize: '2.8rem', lineHeight: '1.2', marginBottom: '1.5rem', maxWidth: '900px' }}>Sistema Integrado de Gestión y Seguimiento de Investigaciones de Maestrías <span style={{ color: '#fbbf24' }}>(BDMaestrías)</span></h1>
                <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', marginBottom: '2.5rem', lineHeight: '1.6' }}>Plataforma institucional para la consulta, caracterización y gobernanza académica.</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setVistaActiva('proyectos')} style={{ backgroundColor: '#be123c', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Explorar Proyectos ({datos.length}) →</button>
                  <button onClick={() => setVistaActiva('tutores')} style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Directorio Docente</button>
                </div>
              </div>
              <div style={{ backgroundColor: '#1e293b', padding: '2rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', borderTop: '1px solid #334155' }}>
                {[{ title: 'INVESTIGACIONES', value: datos.length }, { title: 'TUTORES', value: tutores.length }, { title: 'MAESTRANTES', value: maestrantes.length }, { title: 'PROGRAMAS PEP', value: '4' }].map((stat, i) => (
                  <div key={i}><div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{stat.title}</div><div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stat.value}</div></div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}><h3 style={{ margin: '0 0 1rem 0' }}>🎓 Estudiante Maestrante</h3><button onClick={() => setVistaActiva('maestrantes')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#065f46', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Módulo Maestrantes</button></div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}><h3 style={{ margin: '0 0 1rem 0' }}>👥 Docente Tutor</h3><button onClick={() => setVistaActiva('tutores')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#991b1b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Módulo Tutores</button></div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}><h3 style={{ margin: '0 0 1rem 0' }}>📊 Coordinación (Mallas)</h3><button onClick={() => setVistaActiva('mallas')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Ver Mallas y PEP</button></div>
            </div>

            {/* Renderizar info de Dirección si existe en Firebase (colección system) */}
            {sistema && sistema.direccion && (
              <div style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '2.5rem', marginTop: '2rem', color: 'white' }}>
                <div style={{ display: 'inline-block', backgroundColor: '#334155', color: '#fbbf24', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>CONTACTO OFICIAL FCE</div>
                <h2 style={{ margin: '0.5rem 0 1rem 0' }}>{sistema.direccion.directorCargo || 'Dirección de Maestrías'}</h2>
                <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{sistema.direccion.directorMensaje || 'Acompañamos y lideramos la formación avanzada en las maestrías de la Facultad.'}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <span>📧 {sistema.direccion.directorCorreo}</span>
                  <span>📍 {sistema.direccion.directorUbicacion}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA: PROYECTOS ================= */}
        {vistaActiva === 'proyectos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Directorio de Proyectos</h2>
              <input type="text" placeholder="Buscar título o código..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '300px' }} />
            </div>
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {proyectosFiltrados.map(p => {
                  // Mapeo ajustado a la captura de projects
                  const titulo = p.titulo || 'Título de investigación no registrado';
                  const autor = p.autorPrincipal || p.correoAutor || 'Autor no registrado';
                  const tutor = p.tutorPrincipal || 'Sin asignar';
                  const codigo = p.codigoInvestigacion || 'Sin código';
                  const programa = p.programaKey || 'PROG';
                  const coautoresStr = Array.isArray(p.autoresDetalle) ? p.autoresDetalle.filter((a:any) => !a.esAutorPrincipal).map((a:any) => a.nombre).join(', ') : p.coautores;
                  
                  return (
                    <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ backgroundColor: '#7e22ce', color: 'white', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.8rem' }}>{programa}</span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ backgroundColor: '#1e293b', color: '#facc15', padding: '4px 12px', borderRadius: '16px', fontWeight: '600', fontSize: '0.8rem' }}>🎓 {p.semestre || 'Activo'}</span>
                          <span style={{ border: '1px solid #cbd5e1', color: '#475569', padding: '4px 12px', borderRadius: '16px', fontWeight: '600', fontSize: '0.8rem' }}>{codigo}</span>
                        </div>
                      </div>
                      <h3 style={{ color: '#0f172a', fontSize: '1.3rem', fontWeight: 'bold', margin: '0 0 1.5rem 0', lineHeight: '1.4' }}>{titulo}</h3>
                      <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Maestrante / Autor:</span>
                          <span style={{ color: '#047857', fontWeight: 'bold', fontSize: '1rem' }}>{autor}</span>
                        </div>
                        {coautoresStr && <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>Coautores: {coautoresStr}</div>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Tutor Asignado:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '0.95rem' }}>{tutor}</span>
                           {p.consecutivoConfirmadoPorTutor && <span style={{ color: '#166534', fontWeight: 'bold' }}>✓</span>}
                        </div>
                      </div>
                      <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                        <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '500' }}>🔬 {p.enfoqueMetodologico || p.tipoInvestigacion || 'Metodología no definida'}</span>
                      </div>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                        <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '0.9rem' }}>Semestre {p.semestre || 'I'}</span>
                        <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>✏️ Actualizar Ficha</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA: MAESTRANTES ================= */}
        {vistaActiva === 'maestrantes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Directorio de Maestrantes</h2>
              <input type="text" placeholder="Buscar maestrante..." value={busquedaMaestrantes} onChange={e => setBusquedaMaestrantes(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '300px' }} />
            </div>
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {maestrantesFiltrados.map(m => {
                  // Mapeo ajustado a la captura de students
                  const nombre = m.nombreCompleto || 'Maestrante Sin Nombre';
                  const doc = m.cedula || '';
                  const correo = m.correoInstitucional || 'Sin correo institucional';
                  const proyecto = m.tituloProyecto || 'Proyecto no registrado';
                  const codProy = m.codigoInvestigacion || 'Sin código';
                  const tutor = m.tutorPrincipal || 'Sin asignar';
                  const programaAbr = m.programaKey || 'PROG';

                  return (
                    <div key={m.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ backgroundColor: '#9333ea', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>{programaAbr}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>🎓 Semestre {m.semestre || 'I'}</span>
                        </div>
                      </div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.4rem' }}>{nombre}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#4b5563', marginBottom: '1rem' }}>
                        <span style={{ color: '#d97706' }}>🔓</span> Cédula: <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{enmascararDocumento(doc)}</span>
                      </div>
                      
                      <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          <span>Proyecto de Grado</span><span>{codProy}</span>
                        </div>
                        <div style={{ color: '#1e293b', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.4' }}>{proyecto}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem' }}>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Tutor:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '0.9rem' }}>{tutor}</span>
                            {!m.tutorConfirmado && <span style={{ backgroundColor: '#fef08a', color: '#a16207', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #fde047' }}>⏳ Sin confirmar</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📧</span> {correo}</div>
                        {m.lugarTrabajo && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🏢</span> {m.lugarTrabajo} ({m.cargo})</div>}
                        {m.ciudad && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📍</span> {m.ciudad}</div>}
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>📖 Ver Proyecto</span>
                        <button style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>✏️ Actualizar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA: TUTORES ================= */}
        {vistaActiva === 'tutores' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Directorio Docente (Tutores)</h2>
              <input type="text" placeholder="Buscar tutor..." value={busquedaTutores} onChange={e => setBusquedaTutores(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '300px' }} />
            </div>
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {tutoresFiltrados.map(t => {
                  // Mapeo ajustado a la captura de tutors
                  const nombre = t.nombreCompleto || 'Tutor Sin Nombre';
                  const correo = t.correoInstitucional || 'Sin correo institucional';
                  
                  // Formación Académica puede estar bajo arrays en tu BD, usamos fallbacks directos
                  const formacion = t.titulos ? Object.values(t.titulos).join(' • ') : 'Formación académica no registrada';
                  const labora = t.institucion || 'Institución no registrada';
                  
                  // Extraer líneas de interés si existen en un array o string
                  let lineasArr = [];
                  if (t.lineasInvestigacion) {
                     if(Array.isArray(t.lineasInvestigacion)) lineasArr = t.lineasInvestigacion;
                     else if(typeof t.lineasInvestigacion === 'string') lineasArr = t.lineasInvestigacion.split(',');
                  }

                  // Contar temas
                  const asesorTemas = Array.isArray(t.temasAsesoria) ? t.temasAsesoria.length : 0;
                  const juradoTemas = Array.isArray(t.temasJurado) ? t.temasJurado.length : 0;

                  return (
                    <div key={t.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#1e3a8a' }}>{obtenerIniciales(nombre)}</div>
                        <div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ backgroundColor: '#4338ca', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>{t.programa || 'FCE'}</span>
                            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>✓ Autorizado</span>
                          </div>
                          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem' }}>{nombre}</h3>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}><span>🎓</span><span>{formacion}</span></div>
                        
                        {(t.idiomasRefleja) && (
                          <div style={{ display: 'inline-block', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '8px', fontSize: '0.85rem', color: '#334155', width: 'fit-content' }}>
                            <span style={{ color: '#4338ca' }}>A/A</span> Idioma: <strong>{t.idiomasRefleja}</strong>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}><span>🏢</span><span><strong>Labora en:</strong> {labora}</span></div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: '#4338ca' }}><span>✉️</span><span>{correo}</span></div>
                        
                        {t.grupoInvestigacion && (
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: '#92400e' }}><span>📖</span><span>Grupo: {t.grupoInvestigacion}</span></div>
                        )}
                      </div>
                      
                      <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.5rem' }}>LÍNEAS Y ÁREAS DE INTERÉS</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {lineasArr.length > 0 ? lineasArr.map((linea: string, i: number) => (
                            <span key={i} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569' }}>{linea.trim()}</span>
                          )) : <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Líneas no registradas</span>}
                        </div>
                      </div>
                      
                      <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>Coloquio:</span><span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{t.modalidadColoquio || 'Por definir'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                          <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem' }}>✓ Asesor ({asesorTemas} temas)</span>
                          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem' }}>⚖️ Jurado ({juradoTemas} temas)</span>
                        </div>
                      </div>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          {t.cvlac && <a href={t.cvlac} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none' }}>CvLAC ↗</a>}
                          {t.orcid && <a href={t.orcid} target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none' }}>● ORCID</a>}
                        </div>
                        <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>✏️ Actualizar Perfil</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA: MALLAS Y PEP ================= */}
        {vistaActiva === 'mallas' && (
          <div style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            
            {/* Top Selector (Ahora las 4 Maestrías son interactivas) */}
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              {programasPEP.map(prog => (
                <div key={prog.id} onClick={() => setPepActivo(prog.id)} style={{ border: pepActivo === prog.id ? '2px solid #6366f1' : '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', minWidth: '220px', backgroundColor: 'white', opacity: pepActivo === prog.id ? 1 : 0.6, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: pepActivo === prog.id ? '#6366f1' : '#64748b', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}><span>{prog.id}</span><span>SNIES {prog.snies}</span></div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{prog.nombre}</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>{prog.mod}</div>
                </div>
              ))}
            </div>

            {/* Renderizado Dinámico del PEP según la selección */}
            {programasPEP.filter(p => p.id === pepActivo).map(prog => (
              <div key={prog.id}>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ backgroundColor: '#4338ca', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>{prog.id}</span>
                    <span style={{ fontSize: '0.9rem', color: '#475569' }}>SNIES: {prog.snies}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h1 style={{ fontSize: '2.2rem', color: '#0f172a', margin: 0 }}>{prog.nombre}</h1>
                      <p style={{ color: '#64748b', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>Estructura de malla curricular y Proyecto Educativo del Programa (PEP) vigente.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => {setBusqueda(prog.id); setVistaActiva('proyectos');}} style={{ border: '1px solid #6366f1', color: '#4338ca', backgroundColor: 'transparent', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>▽ Ver Proyectos {prog.id}</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {[ { l: 'Modalidad', v: prog.mod }, { l: 'Créditos Académicos', v: `${prog.cred} Créditos` }, { l: 'Núcleos Problémicos', v: `${prog.num} Núcleos Eje` } ].map((s, i) => (
                    <div key={i} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>{s.l}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>{s.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ color: '#4338ca', marginTop: 0 }}>⚙️ Detalles del Programa - {prog.id}</h3>
                  <p style={{ color: '#475569' }}>La información detallada de los {prog.num} núcleos problémicos de este programa, así como su misión, enfoque pedagógico y líneas de investigación asociadas, se encuentran parametrizadas en el repositorio documental académico oficial.</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODALES ================= */}
      {mostrarModalMaestrante && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, color: '#065f46' }}>Registrar Maestrante</h2>
            <form onSubmit={guardarMaestrante} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Nombre Completo" value={nuevoMaestrante.nombreCompleto} onChange={e => setNuevoMaestrante({...nuevoMaestrante, nombreCompleto: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <input required type="email" placeholder="Correo Institucional" value={nuevoMaestrante.correoInstitucional} onChange={e => setNuevoMaestrante({...nuevoMaestrante, correoInstitucional: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <input required type="text" placeholder="Cédula" value={nuevoMaestrante.cedula} onChange={e => setNuevoMaestrante({...nuevoMaestrante, cedula: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <div style={{ display: 'flex', gap: '1rem' }}><button type="button" onClick={() => setMostrarModalMaestrante(false)} style={{ flex: 1, padding: '0.8rem' }}>Cancelar</button><button type="submit" style={{ flex: 1, padding: '0.8rem', backgroundColor: '#065f46', color: 'white' }}>Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalTutor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, color: '#1e3a8a' }}>Registrar Tutor</h2>
            <form onSubmit={guardarTutor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Nombre Completo" value={nuevoTutor.nombreCompleto} onChange={e => setNuevoTutor({...nuevoTutor, nombreCompleto: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <input required type="email" placeholder="Correo Institucional" value={nuevoTutor.correoInstitucional} onChange={e => setNuevoTutor({...nuevoTutor, correoInstitucional: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <div style={{ display: 'flex', gap: '1rem' }}><button type="button" onClick={() => setMostrarModalTutor(false)} style={{ flex: 1, padding: '0.8rem' }}>Cancelar</button><button type="submit" style={{ flex: 1, padding: '0.8rem', backgroundColor: '#1e3a8a', color: 'white' }}>Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalProyecto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, color: '#111' }}>Registrar Proyecto</h2>
            <form onSubmit={guardarProyecto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Código (Ej. MDGEVA-2023)" value={nuevoProyecto.codigoInvestigacion} onChange={e => setNuevoProyecto({...nuevoProyecto, codigoInvestigacion: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <input required type="email" placeholder="Correo Autor" value={nuevoProyecto.correoAutor} onChange={e => setNuevoProyecto({...nuevoProyecto, correoAutor: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <div style={{ display: 'flex', gap: '1rem' }}><button type="button" onClick={() => setMostrarModalProyecto(false)} style={{ flex: 1, padding: '0.8rem' }}>Cancelar</button><button type="submit" style={{ flex: 1, padding: '0.8rem', backgroundColor: '#111', color: 'white' }}>Guardar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
