'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [cargando, setCargando] = useState<boolean>(true);

  // Estados de las 3 Colecciones
  const [datos, setDatos] = useState<any[]>([]); // projects
  const [tutores, setTutores] = useState<any[]>([]); // tutores
  const [maestrantes, setMaestrantes] = useState<any[]>([]); // maestrantes

  // Búsqueda general
  const [busqueda, setBusqueda] = useState('');

  async function leerDatos() {
    setCargando(true);
    let tempProyectos: any[] = [];
    let tempTutores: any[] = [];
    let tempMaestrantes: any[] = [];

    // Peticiones aisladas: Si una falla, las demás sobreviven
    try {
      const pSnap = await getDocs(collection(db, 'projects'));
      tempProyectos = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { console.error("Error cargando projects:", e); }

    try {
      const tSnap = await getDocs(collection(db, 'tutores'));
      tempTutores = tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { console.error("Error cargando tutores:", e); }

    try {
      const mSnap = await getDocs(collection(db, 'maestrantes'));
      tempMaestrantes = mSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { console.error("Error cargando maestrantes:", e); }

    setDatos(tempProyectos);
    setTutores(tempTutores);
    setMaestrantes(tempMaestrantes);
    setCargando(false);
  }

  useEffect(() => { leerDatos(); }, []);

  const proyectosFiltrados = datos.filter(p => 
    (p.codigoInvestigacion || '').toLowerCase().includes(busqueda.toLowerCase()) || 
    (p.titulo || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* TOP BAR */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#111', color: 'white', padding: '0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>ULS</div>
          <div>
            <div style={{ fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1' }}>Maestrías FCE-ULS</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Facultad de Ciencias de la Educación</div>
          </div>
          <span style={{ fontSize: '0.7rem', border: '1px solid #93c5fd', color: '#2563eb', padding: '2px 8px', borderRadius: '12px', marginLeft: '1rem' }}>EN LÍNEA</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>+ Nuevo Tutor</button>
          <button style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>+ Nuevo Maestrante</button>
          <button style={{ backgroundColor: '#1f2937', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>+ Nuevo Proyecto</button>
        </div>
      </div>

      {/* NAVEGACIÓN (TABS) */}
      <div style={{ backgroundColor: 'white', padding: '1rem 2rem', borderBottom: '2px solid #e5e7eb', display: 'flex', gap: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'inicio', label: 'Inicio', tag: 'Portal' },
          { id: 'proyectos', label: 'Proyectos', count: datos.length },
          { id: 'tutores', label: 'Tutores', count: tutores.length },
          { id: 'maestrantes', label: 'Maestrantes', count: maestrantes.length }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setVistaActiva(item.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', background: vistaActiva === item.id ? '#1e3a8a' : 'transparent', 
              color: vistaActiva === item.id ? 'white' : '#4b5563', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', 
              fontWeight: '600', cursor: 'pointer', transition: '0.2s'
            }}
          >
            {item.label} 
            <span style={{ backgroundColor: vistaActiva === item.id ? '#3b82f6' : '#f3f4f6', color: vistaActiva === item.id ? 'white' : '#111', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>{item.count !== undefined ? item.count : ''}</span>
            {item.tag && <span style={{ backgroundColor: vistaActiva === item.id ? '#3b82f6' : '#fef08a', color: vistaActiva === item.id ? 'white' : '#854d0e', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>{item.tag}</span>}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        
        {/* VISTA: INICIO COMPLETA */}
        {vistaActiva === 'inicio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', color: 'white', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ padding: '4rem 3rem' }}>
                <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px' }}>Facultad de Ciencias de la Educación • Universidad de La Salle</div>
                <h1 style={{ fontSize: '2.8rem', lineHeight: '1.2', marginBottom: '1.5rem', maxWidth: '900px' }}>Sistema Integrado de Gestión y Seguimiento de Investigaciones de Maestrías <span style={{ color: '#fbbf24' }}>(BDMaestrías)</span></h1>
                <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', marginBottom: '2.5rem', lineHeight: '1.6' }}>Plataforma institucional para la consulta, caracterización y gobernanza académica de los proyectos de grado.</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setVistaActiva('proyectos')} style={{ backgroundColor: '#be123c', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Explorar Proyectos ({datos.length}) →</button>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>🎓 Estudiante Maestrante</h3>
                <button onClick={() => setVistaActiva('maestrantes')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#065f46', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Módulo Maestrantes</button>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>👥 Docente Tutor</h3>
                <button onClick={() => setVistaActiva('tutores')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#991b1b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Módulo Tutores</button>
              </div>
            </div>
          </div>
        )}

        {/* VISTA: PROYECTOS */}
        {vistaActiva === 'proyectos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Directorio de Proyectos</h2>
              <input type="text" placeholder="Buscar título o código..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '300px' }} />
            </div>
            
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando datos...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {proyectosFiltrados.map(proyecto => (
                  <div key={proyecto.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ backgroundColor: '#4338ca', color: 'white', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.8rem' }}>{proyecto.programaKey || proyecto.programa || 'PROG'}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '16px', fontWeight: '600', fontSize: '0.8rem' }}>{proyecto.estado || 'En Curso'}</span>
                        <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '16px', fontWeight: '500', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>{proyecto.codigoInvestigacion || 'Sin código'}</span>
                      </div>
                    </div>
                    <h3 style={{ color: '#7f1d1d', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 1.5rem 0', lineHeight: '1.4' }}>{proyecto.titulo || proyecto.resumen || 'Título de la investigación no registrado'}</h3>
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Autor:</span>
                      <span style={{ color: '#047857', fontWeight: 'bold', fontSize: '0.95rem', textAlign: 'right' }}>{proyecto.nombreAutor || proyecto.correoAutor || 'No registrado'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Tutor:</span>
                      <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '0.95rem' }}>{proyecto.tutorPrincipal || 'No asignado'}</span>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      <span style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>Semestre {proyecto.semestre || 'I'}</span>
                      <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>Actualizar Ficha</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA: TUTORES */}
        {vistaActiva === 'tutores' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#111' }}>Directorio Docente (Tutores)</h2>
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando tutores...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {tutores.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #ccc' }}>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>Aún no hay tutores registrados en la colección <strong>'tutores'</strong> de Firebase.</p>
                  </div>
                ) : (
                  tutores.map(tutor => (
                    <div key={tutor.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', borderLeft: '4px solid #991b1b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#111' }}>{tutor.nombre || tutor.nombres || 'Tutor Sin Nombre'}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                        <span>📧 {tutor.correo || tutor.email || 'Sin correo institucional'}</span>
                        {tutor.cvlac && <span>🔗 CvLAC Activo</span>}
                        {tutor.lineaInvestigacion && <span style={{ marginTop: '0.5rem', backgroundColor: '#fef2f2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-block', width: 'fit-content' }}>Línea: {tutor.lineaInvestigacion}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* VISTA: MAESTRANTES */}
        {vistaActiva === 'maestrantes' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#111' }}>Directorio de Maestrantes</h2>
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando maestrantes...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {maestrantes.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #ccc' }}>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>Aún no hay estudiantes registrados en la colección <strong>'maestrantes'</strong> de Firebase.</p>
                  </div>
                ) : (
                  maestrantes.map(estudiante => (
                    <div key={estudiante.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', borderLeft: '4px solid #065f46', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{estudiante.programa || 'PROG'}</span>
                      <h3 style={{ margin: '0.5rem 0', color: '#111' }}>{estudiante.nombre || estudiante.nombres || 'Estudiante Sin Nombre'}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                        <span>📧 {estudiante.correo || estudiante.email || 'Sin correo'}</span>
                        <span>🎓 Semestre: {estudiante.semestre || 'I'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
