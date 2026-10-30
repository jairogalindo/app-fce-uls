'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [cargando, setCargando] = useState<boolean>(true);

  // Datos Firebase
  const [datos, setDatos] = useState<any[]>([]); // projects
  const [tutores, setTutores] = useState<any[]>([]); // tutors
  const [maestrantes, setMaestrantes] = useState<any[]>([]); // students

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [busquedaMaestrantes, setBusquedaMaestrantes] = useState('');
  const [busquedaTutores, setBusquedaTutores] = useState('');

  // Modales
  const [mostrarModalProyecto, setMostrarModalProyecto] = useState(false);
  const [mostrarModalMaestrante, setMostrarModalMaestrante] = useState(false);
  const [mostrarModalTutor, setMostrarModalTutor] = useState(false);
  
  // Estados para nuevos registros
  const [nuevoProyecto, setNuevoProyecto] = useState({ programa: 'MDGEVA', codigoInvestigacion: '', correoAutor: '', tutorPrincipal: '', semestre: '1', consecutivoConfirmadoPorTutor: false });
  const [nuevoMaestrante, setNuevoMaestrante] = useState({ nombre: '', correo: '', documento: '', programa: 'MDGEVA', semestre: '1', estado: 'Activo' });
  const [nuevoTutor, setNuevoTutor] = useState({ nombre: '', programaPrincipal: 'MDGEVA', formacion: '', idioma: '', nivelIdioma: 'B1', laboraEn: 'Universidad de La Salle', correo: '', grupoInvestigacion: '', lineasInteres: '', articuloDestacado: '', linkArticulo: '', modalidadColoquio: 'Presencial', temasAsesor: 0, temasJurado: 0, linkCvLAC: '', linkORCID: '' });

  async function leerDatos() {
    setCargando(true);
    try {
      const [pSnap, tSnap, mSnap] = await Promise.all([
        getDocs(collection(db, 'projects')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'tutors')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'students')).catch(() => ({ docs: [] }))
      ]);
      setDatos(pSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      setTutores(tSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      setMaestrantes(mSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error(e); } finally { setCargando(false); }
  }

  useEffect(() => { leerDatos(); }, []);

  const proyectosFiltrados = datos.filter(p => (p.codigoInvestigacion || '').toLowerCase().includes(busqueda.toLowerCase()) || (p.titulo || '').toLowerCase().includes(busqueda.toLowerCase()));
  const maestrantesFiltrados = maestrantes.filter(m => (m.nombre || '').toLowerCase().includes(busquedaMaestrantes.toLowerCase()) || (m.correo || '').toLowerCase().includes(busquedaMaestrantes.toLowerCase()));
  const tutoresFiltrados = tutores.filter(t => (t.nombre || '').toLowerCase().includes(busquedaTutores.toLowerCase()));

  const enmascararDocumento = (doc: string) => { if (!doc) return 'Sin registrar'; if (doc.length <= 4) return '***' + doc; return '***' + doc.slice(-4); };
  const obtenerIniciales = (nombre: string) => { if (!nombre) return 'AC'; const partes = nombre.split(' '); return partes.length >= 2 ? (partes[0][0] + partes[1][0]).toUpperCase() : nombre.substring(0, 2).toUpperCase(); };

  // Funciones de guardado rápido (sin try/catch completo por compresión de código)
  const guardarMaestrante = async (e: any) => { e.preventDefault(); await addDoc(collection(db, 'students'), nuevoMaestrante); leerDatos(); setMostrarModalMaestrante(false); };
  const guardarTutor = async (e: any) => { e.preventDefault(); await addDoc(collection(db, 'tutors'), nuevoTutor); leerDatos(); setMostrarModalTutor(false); };
  const guardarProyecto = async (e: any) => { e.preventDefault(); await addDoc(collection(db, 'projects'), nuevoProyecto); leerDatos(); setMostrarModalProyecto(false); };

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
        
        {/* ================= VISTA: INICIO (SUPERDISEÑO) ================= */}
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
          </div>
        )}

        {/* ================= VISTA: PROYECTOS (FICHAS NUEVAS) ================= */}
        {vistaActiva === 'proyectos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Directorio de Proyectos</h2>
              <input type="text" placeholder="Buscar título o código..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '300px' }} />
            </div>
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {proyectosFiltrados.map(p => (
                  <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ backgroundColor: '#7e22ce', color: 'white', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.8rem' }}>{p.programaKey || p.programa || 'MDGEVA'}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ backgroundColor: '#1e293b', color: '#facc15', padding: '4px 12px', borderRadius: '16px', fontWeight: '600', fontSize: '0.8rem' }}>🎓 Finalizado (Egresado)</span>
                        <span style={{ border: '1px solid #cbd5e1', color: '#475569', padding: '4px 12px', borderRadius: '16px', fontWeight: '600', fontSize: '0.8rem' }}>{p.codigoInvestigacion || 'MDGEVA-2023-006'}</span>
                      </div>
                    </div>
                    <h3 style={{ color: '#0f172a', fontSize: '1.3rem', fontWeight: 'bold', margin: '0 0 1.5rem 0', lineHeight: '1.4' }}>{p.titulo || p.resumen || 'Herramientas didácticas que mejoren los hábitos de estudio a través de las TIC'}</h3>
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Maestrante / Autor:</span>
                        <span style={{ color: '#047857', fontWeight: 'bold', fontSize: '1rem' }}>{p.nombreAutor || p.correoAutor || 'José Cifuentes'}</span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>Coautores: Karen Galeano</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Tutor Asignado:</span>
                      <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '0.95rem' }}>{p.tutorPrincipal || 'Carolina Mejía'}</span>
                    </div>
                    <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '500' }}>🔬 Cualitativa</span>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '0.9rem' }}>Egresado</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', cursor: 'pointer' }}>🗑️</span>
                        <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>✏️ Actualizar Ficha</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA: MAESTRANTES (FICHAS NUEVAS) ================= */}
        {vistaActiva === 'maestrantes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Directorio de Maestrantes</h2>
              <input type="text" placeholder="Buscar maestrante..." value={busquedaMaestrantes} onChange={e => setBusquedaMaestrantes(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '300px' }} />
            </div>
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {maestrantesFiltrados.map(m => (
                  <div key={m.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ backgroundColor: '#9333ea', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>{m.programa || 'MDGEVA'}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>🎓 Egresado</span>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Actualizado</span>
                      </div>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.4rem' }}>{m.nombre || m.nombres || 'José Cifuentes'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#4b5563', marginBottom: '1rem' }}>
                      <span style={{ color: '#d97706' }}>🔓</span> Cédula: <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{enmascararDocumento(m.documento || m.cedula)}</span>
                    </div>
                    
                    {/* Caja Proyecto Vinculado */}
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        <span>Proyecto de Grado</span><span>{m.codigoProyecto || 'MDGEVA-2023-006'}</span>
                      </div>
                      <div style={{ color: '#1e293b', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.4' }}>{m.tituloProyecto || 'Herramientas didácticas que mejoren los hábitos de estudio a través de las TIC para disminuir la tasa de pérdi...'}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Tutor:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '0.9rem' }}>{m.tutorAsignado || 'Carolina Mejía'}</span>
                          <span style={{ backgroundColor: '#fef08a', color: '#a16207', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #fde047' }}>⏳ Sin confirmar</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🏢</span> Institución Educativa Distrital (IED) (Docente de aula)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📍</span> Bogotá D.C., Bogotá D.C.</div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>📖 Ver Proyecto</span>
                      <button style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>✏️ Actualizar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA: TUTORES (FICHAS NUEVAS) ================= */}
        {vistaActiva === 'tutores' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Directorio Docente (Tutores)</h2>
              <input type="text" placeholder="Buscar tutor..." value={busquedaTutores} onChange={e => setBusquedaTutores(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '300px' }} />
            </div>
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {tutoresFiltrados.map(t => (
                  <div key={t.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#1e3a8a' }}>{obtenerIniciales(t.nombre)}</div>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ backgroundColor: '#4338ca', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>{t.programaPrincipal || 'MDL'}</span>
                          <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>✓ Autorizado Directorio</span>
                        </div>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem' }}>{t.nombre || 'Adriana Cecilia Goyes Morán'}</h3>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}><span>🎓</span><span>{t.formacion || 'Magíster en educación con énfasis en lectura y escritura • Licenciatura en Educación preescolar'}</span></div>
                      <div style={{ display: 'inline-block', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '8px', fontSize: '0.85rem', color: '#334155', width: 'fit-content' }}>
                        <span style={{ color: '#4338ca' }}>A/A</span> Idioma: <strong>{t.idioma || 'Portugués'}</strong> ({t.nivelIdioma || 'A2'})
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}><span>🏢</span><span><strong>Labora en:</strong> {t.laboraEn || 'Universidad de La Salle Sede Chapinero'}</span></div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}><span>🏠</span><span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Residencia (Directivos/Admin):</span> Carrera 17 #54a 47...</div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: '#4338ca' }}><span>✉️</span><span>{t.correo || 'agoyes@unisalle.edu.co'}</span></div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: '#92400e' }}><span>📖</span><span>Grupo: {t.grupoInvestigacion || 'REPRALEE – Representaciones y prácticas...'}</span></div>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.5rem' }}>LÍNEAS Y ÁREAS DE INTERÉS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {['Didáctica de la lectura y la escritura', 'prácticas de lectura y escritura en la universidad', 'Formación de maestros en lectura y escritura'].map((linea, i) => (
                          <span key={i} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569' }}>{linea}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>Coloquio:</span><span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Presencial</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem' }}>✓ Asesor (6 temas)</span>
                        <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem' }}>⚖️ Jurado (4 temas)</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Intereses:</strong> Práctica docente, pedagogía y proyectos educativos (+1 más)</div>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>CvLAC ↗</span>
                        <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>● ORCID</span>
                      </div>
                      <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>✏️ Actualizar Perfil</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA: MALLAS Y PEP (NUEVO DASHBOARD) ================= */}
        {vistaActiva === 'mallas' && (
          <div style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            
            {/* Top Selector */}
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ border: '2px solid #6366f1', borderRadius: '8px', padding: '1rem', minWidth: '200px', backgroundColor: 'white', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6366f1', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}><span>MDO</span><span>SNIES 12852</span></div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Maestría en Docencia</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>100% Virtual</div>
              </div>
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', minWidth: '200px', backgroundColor: 'white', opacity: 0.7, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}><span>MDL</span><span>SNIES 106100</span></div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Maestría en Didáctica...</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>Presencial</div>
              </div>
            </div>

            {/* Header PEP */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ backgroundColor: '#4338ca', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>MDO</span>
                <span style={{ fontSize: '0.9rem', color: '#475569' }}>SNIES: 12852 • Título: <strong>Magíster en Docencia</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.2rem', color: '#0f172a', margin: 0 }}>Maestría en Docencia</h1>
                  <p style={{ color: '#64748b', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>Acuerdo Consejo Académico No. 017 del 4 de diciembre de 2024 (Modificación Registro Calificado)</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button style={{ border: '1px solid #6366f1', color: '#4338ca', backgroundColor: 'transparent', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>▽ Ver Proyectos MDO</button>
                  <button style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>📝 Registrar/Actualizar Proyecto</button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { l: 'Modalidad', v: '100% Virtual' }, { l: 'Duración', v: '3 Semestres' }, 
                { l: 'Créditos Académicos', v: '41 Créditos' }, { l: 'Núcleos Problémicos PEP', v: '2 Núcleos Eje' }
              ].map((s, i) => (
                <div key={i} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>{s.l}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Tabs PEP */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem', paddingBottom: '0.5rem', overflowX: 'auto', fontWeight: '600', color: '#64748b' }}>
              <span style={{ color: '#4338ca', borderBottom: '3px solid #4338ca', paddingBottom: '0.5rem' }}>📖 PEP y Núcleos Problémicos <span style={{ backgroundColor: '#e0e7ff', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>2</span></span>
              <span>📚 Malla Curricular (3 Semestres)</span>
              <span>🎓 Perfil del Egresado y Competencias</span>
              <span>⚙️ Matriz Comparativa</span>
            </div>

            {/* Content PEP */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#4338ca', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>⚙️ Proyecto Educativo del Programa (PEP) - Maestría en Docencia</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>🎯 Misión y Propósito Formativo</h4>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>La Maestría en Docencia se fundamenta en el ethos de la Universidad de La Salle, promoviendo una educación integral y la generación de conocimiento para la transformación social... El programa concibe al educador como un agente de cambio.</p>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>📖 Enfoque Pedagógico</h4>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>Pedagogía reflexiva, investigación-acción educativa, docencia situada y ética lasallista en contextos socioeducativos diversos.</p>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#334155' }}>🔍 CAMPOS PROBLÉMICOS DEL PROGRAMA</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#475569', display: 'flex', gap: '0.5rem' }}><span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</span> 1. Práctica docente y proyectos educativos múltiples...</div>
                  <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#475569', display: 'flex', gap: '0.5rem' }}><span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</span> 2. Docencia, investigación e innovación en contextos...</div>
                </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#4338ca' }}>LÍNEAS DE INVESTIGACIÓN ASOCIADAS</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {['Saber educativo, pedagógico y didáctico.', 'Políticas públicas, calidad de la educación y territorio.', 'Cultura, fe y formación en valores.', 'Educación, lenguaje y comunicación.'].map((linea, i) => (
                    <span key={i} style={{ border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', color: '#334155' }}>• {linea}</span>
                  ))}
                </div>
              </div>

              {/* Núcleos Cards */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#0f172a' }}>Núcleos Problémicos del PEP (MDO)</h3>
                <span style={{ backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', color: '#475569' }}>2 Núcleos Definidos</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Haga clic en cualquiera de los núcleos para copiar su nombre o usarlo directamente en la ficha de proyecto.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* NP1 */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>1 MDO-NP-1</span>
                    <button style={{ color: '#4338ca', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>📋 Copiar</button>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem' }}>NP1. Práctica docente y proyectos educativos múltiples</h4>
                  <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>Reflexión y perfeccionamiento de la práctica profesional docente a partir de los saberes pedagógicos y didácticos para diseñar proyectos educativos como alternativas de transformación social.</p>
                  <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#334155', marginBottom: '1rem' }}>
                    <strong>Enfoque General:</strong> Se centra en la práctica profesional docente como objeto de reflexión... Analiza y discute las perspectivas epistemológicas que explican el desarrollo histórico...
                  </div>
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#1e3a8a' }}>
                    <strong>Articulación Institucional (PEUL):</strong> Conecta con el Proyecto Educativo Universitario Lasallista (PEUL) promoviendo la dignidad humana...
                  </div>
                </div>
                {/* NP2 */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>2 MDO-NP-2</span>
                    <button style={{ color: '#4338ca', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>📋 Copiar</button>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem' }}>NP2. Docencia, investigación e innovación en contextos socioeducativos</h4>
                  <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>Tensiones discursivas entre investigación y práctica pedagógica, abordando la figura del docente-investigador, la innovación educativa y la formación ética, moral y política ciudadana.</p>
                  <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#334155', marginBottom: '1rem' }}>
                    <strong>Enfoque General:</strong> Aborda las relaciones, tensiones y concepciones que se producen entre la investigación (sus tipos y enfoques) y su incidencia directa en la praxis docente...
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#166534' }}>
                    <strong>Dimensión Ética y Política:</strong> Busca generar conocimiento crítico sobre el papel que desempeñan la educación y el maestro en la formación moral y ciudadana...
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODALES ================= */}
      {/* Modal Maestrante */}
      {mostrarModalMaestrante && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, color: '#065f46' }}>Registrar Maestrante</h2>
            <form onSubmit={guardarMaestrante} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Nombre Completo" value={nuevoMaestrante.nombre} onChange={e => setNuevoMaestrante({...nuevoMaestrante, nombre: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <input required type="email" placeholder="Correo" value={nuevoMaestrante.correo} onChange={e => setNuevoMaestrante({...nuevoMaestrante, correo: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <div style={{ display: 'flex', gap: '1rem' }}><button type="button" onClick={() => setMostrarModalMaestrante(false)} style={{ flex: 1, padding: '0.8rem' }}>Cancelar</button><button type="submit" style={{ flex: 1, padding: '0.8rem', backgroundColor: '#065f46', color: 'white' }}>Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tutor */}
      {mostrarModalTutor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, color: '#1e3a8a' }}>Registrar Tutor</h2>
            <form onSubmit={guardarTutor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Nombre Completo" value={nuevoTutor.nombre} onChange={e => setNuevoTutor({...nuevoTutor, nombre: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <input required type="email" placeholder="Correo" value={nuevoTutor.correo} onChange={e => setNuevoTutor({...nuevoTutor, correo: e.target.value})} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }} />
              <div style={{ display: 'flex', gap: '1rem' }}><button type="button" onClick={() => setMostrarModalTutor(false)} style={{ flex: 1, padding: '0.8rem' }}>Cancelar</button><button type="submit" style={{ flex: 1, padding: '0.8rem', backgroundColor: '#1e3a8a', color: 'white' }}>Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Proyecto */}
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
