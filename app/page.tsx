'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  // Estados de la vista Proyectos
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

  const proyectosFiltrados = datos.filter(p => (p.codigoInvestigacion || '').toLowerCase().includes(busqueda.toLowerCase()) || (p.correoAutor || '').toLowerCase().includes(busqueda.toLowerCase()));

  // ---------------- RENDERIZADO ----------------
  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 1. TOP BAR ACCIONES */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#111', color: 'white', padding: '0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>ULS</div>
          <div>
            <div style={{ fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1' }}>Maestrías FCE-ULS</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Facultad de Ciencias de la Educación</div>
          </div>
          <span style={{ fontSize: '0.7rem', border: '1px solid #93c5fd', color: '#2563eb', padding: '2px 8px', borderRadius: '12px', marginLeft: '1rem' }}>EN LÍNEA</span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>+ Nuevo Tutor</button>
          <button style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>+ Nuevo Maestrante</button>
          <button onClick={() => setMostrarModalProyecto(true)} style={{ backgroundColor: '#1f2937', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>+ Nuevo Proyecto</button>
          <button style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer' }}>Dashboard Directivo</button>
        </div>
      </div>

      {/* 2. SUB BAR ESTADO */}
      <div style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '0.5rem 2rem', fontSize: '0.8rem', color: '#4b5563', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span><strong>Base de Datos Central Institucional Activa</strong></span>
          <span style={{ border: '1px solid #d1d5db', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'white' }}>Tiempo Real ({datos.length} Proyectos · 78 Tutores · 807 Maestrantes)</span>
        </div>
        <button style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: '4px', padding: '2px 8px', fontSize: '0.8rem' }}>Herramientas Admin</button>
      </div>

      {/* 3. MENÚ DE NAVEGACIÓN PRINCIPAL */}
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
        
        {/* ================= VISTA: INICIO (HERO) ================= */}
        {vistaActiva === 'inicio' && (
          <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', color: 'white', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '4rem 3rem' }}>
              <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px' }}>Facultad de Ciencias de la Educación • Universidad de La Salle</div>
              <h1 style={{ fontSize: '2.8rem', lineHeight: '1.2', marginBottom: '1.5rem', maxWidth: '900px' }}>Sistema Integrado de Gestión y Seguimiento de Investigaciones de Maestrías <span style={{ color: '#fbbf24' }}>(BDMaestrías)</span></h1>
              <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', marginBottom: '2.5rem', lineHeight: '1.6' }}>Plataforma institucional para la consulta, caracterización y gobernanza académica de los proyectos de grado, asignaciones de tutoría y núcleos problémicos de las maestrías en Educación.</p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => setVistaActiva('proyectos')} style={{ backgroundColor: '#be123c', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Explorar Proyectos ({datos.length}) →</button>
                <button onClick={() => setVistaActiva('tutores')} style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Directorio Docente (78)</button>
                <button style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Dashboard Analítico</button>
              </div>
            </div>
            
            <div style={{ backgroundColor: '#1e293b', padding: '2rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2rem', borderTop: '1px solid #334155' }}>
              {[
                { title: 'INVESTIGACIONES', value: datos.length, sub: '335 fichas al día' },
                { title: 'CUERPO DE TUTORES', value: '78', sub: '60 caracterizados' },
                { title: 'MAESTRANTES', value: '807', sub: 'Fichas protegidas' },
                { title: 'PROGRAMAS PEP', value: '4', sub: 'MDO, MDL, MDGEVA, MLGE' },
                { title: 'TESAURO NORMALIZADO', value: '58', sub: 'UNESCO / ERIC Oficial' }
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem' }}>{stat.title}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ {stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= VISTA: PROYECTOS (Tu grilla actual) ================= */}
        {vistaActiva === 'proyectos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Directorio de Proyectos</h2>
              <input type="text" placeholder="Buscar código o correo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', width: '300px' }} />
            </div>
            
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {proyectosFiltrados.map(proyecto => (
                  <div key={proyecto.id} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'white' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0056b3' }}>{proyecto.programaKey || 'Sin Programa'}</div>
                    <h3 style={{ margin: '0.5rem 0', color: '#222' }}>{proyecto.codigoInvestigacion}</h3>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}><strong>Autor:</strong> {proyecto.correoAutor}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}><strong>Tutor:</strong> {proyecto.tutorPrincipal}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTAS EN CONSTRUCCIÓN */}
        {(vistaActiva === 'tutores' || vistaActiva === 'maestrantes') && (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #ccc' }}>
            <h2>Módulo de {vistaActiva} en construcción</h2>
            <p>Aquí conectaremos la colección correspondiente de Firebase en el próximo paso.</p>
          </div>
        )}

      </div>
    </div>
  );
}
