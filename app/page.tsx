'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  // Estados Proyectos
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrograma, setFiltroPrograma] = useState('');
  const [mostrarModalProyecto, setMostrarModalProyecto] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({ programa: 'MDGEVA', codigoInvestigacion: '', correoAutor: '', tutorPrincipal: '', semestre: '1', consecutivoConfirmadoPorTutor: false });

  async function leerDatos() {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const items: any[] = [];
      querySnapshot.forEach((doc) => { items.push({ id: doc.id, ...doc.data() }); });
      setDatos(items);
    } catch (err: any) { console.error(err); } finally { setCargando(false); }
  }

  useEffect(() => { leerDatos(); }, []);

  const proyectosFiltrados = datos.filter(p => 
    (p.codigoInvestigacion || '').toLowerCase().includes(busqueda.toLowerCase()) || 
    (p.correoAutor || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.titulo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.nombreAutor || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 1. TOP BAR */}
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
          <button onClick={() => setMostrarModalProyecto(true)} style={{ backgroundColor: '#1f2937', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>+ Nuevo Proyecto</button>
        </div>
      </div>

      {/* 2. NAVEGACIÓN */}
      <div style={{ backgroundColor: 'white', padding: '1rem 2rem', borderBottom: '2px solid #e5e7eb', display: 'flex', gap: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'inicio', label: 'Inicio', tag: 'Portal' },
          { id: 'proyectos', label: 'Proyectos', count: datos.length },
          { id: 'tutores', label: 'Tutores', count: 78 },
          { id: 'maestrantes', label: 'Maestrantes', count: 807 }
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
            {item.count !== undefined && <span style={{ backgroundColor: vistaActiva === item.id ? '#3b82f6' : '#f3f4f6', color: vistaActiva === item.id ? 'white' : '#111', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>{item.count}</span>}
            {item.tag && <span style={{ backgroundColor: vistaActiva === item.id ? '#3b82f6' : '#fef08a', color: vistaActiva === item.id ? 'white' : '#854d0e', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>{item.tag}</span>}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        
        {/* ================= VISTA: INICIO (Oculta para resumir código, pero activa) ================= */}
        {vistaActiva === 'inicio' && (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '16px' }}>
             <h1 style={{ fontSize: '2.5rem', color: '#0f172a' }}>Portal Institucional Activo</h1>
             <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Navega a la pestaña "Proyectos" para ver el nuevo diseño de las fichas.</p>
             <button onClick={() => setVistaActiva('proyectos')} style={{ marginTop: '2rem', backgroundColor: '#be123c', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Explorar Proyectos →</button>
          </div>
        )}

        {/* ================= VISTA: PROYECTOS (NUEVAS FICHAS) ================= */}
        {vistaActiva === 'proyectos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Directorio de Proyectos</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Buscar título, código o autor..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '300px' }} />
                <button onClick={() => setMostrarModalProyecto(true)} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Nuevo Proyecto</button>
              </div>
            </div>
            
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando desde Firebase...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {proyectosFiltrados.map(proyecto => (
                  <div key={proyecto.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Badges superiores */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ backgroundColor: '#4338ca', color: 'white', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {proyecto.programaKey || proyecto.programa || 'PROG'}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '16px', fontWeight: '600', fontSize: '0.8rem' }}>
                          {proyecto.estado || 'En Curso'}
                        </span>
                        <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '16px', fontWeight: '500', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
                          {proyecto.codigoInvestigacion || 'Sin código'}
                        </span>
                        {proyecto.consecutivoConfirmadoPorTutor && (
                          <span style={{ backgroundColor: '#dcfce7', color: '#166534', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✓</span>
                        )}
                      </div>
                    </div>

                    {/* Título en rojo oscuro */}
                    <h3 style={{ color: '#7f1d1d', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 1.5rem 0', lineHeight: '1.4' }}>
                      {proyecto.titulo || proyecto.resumen || 'Título de la investigación no registrado en la base de datos...'}
                    </h3>

                    {/* Caja de Autores Gris */}
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Maestrante / Autor:</span>
                        <span style={{ color: '#047857', fontWeight: 'bold', fontSize: '0.95rem', textAlign: 'right' }}>
                          {proyecto.nombreAutor || proyecto.correoAutor || 'Autor principal'}
                        </span>
                      </div>
                      
                      {proyecto.autoresDetalle && proyecto.autoresDetalle.length > 0 && (
                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                          Coautores: {proyecto.autoresDetalle.map((a: any) => a.nombre).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Tutor y Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Tutor Asignado:</span>
                      <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '0.95rem' }}>{proyecto.tutorPrincipal || 'No asignado'}</span>
                    </div>

                    <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        🔬 {proyecto.enfoque || proyecto.metodologia || 'Investigación Cualitativa'}
                      </span>
                    </div>

                    {/* Footer de la tarjeta */}
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      <span style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>
                        Semestre {proyecto.semestre || 'I'} {proyecto.semestre === 'III' ? '(Sustentación)' : ''}
                      </span>
                      <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ✏️ Actualizar Ficha
                      </button>
                    </div>
                  </div>
                ))}
                {proyectosFiltrados.length === 0 && <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', border: '1px dashed #ccc', color: '#666' }}>No hay proyectos que coincidan.</div>}
              </div>
            )}
          </div>
        )}

        {(vistaActiva === 'tutores' || vistaActiva === 'maestrantes') && (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #ccc' }}>
            <h2>Módulo de {vistaActiva} en construcción</h2>
            <button onClick={() => setVistaActiva('inicio')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Volver al Inicio</button>
          </div>
        )}
      </div>
    </div>
  );
}
