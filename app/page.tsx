'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [pestañaActiva, setPestañaActiva] = useState('proyectos');
  
  const [datos, setDatos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  // Filtros y Formularios de Proyectos
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrograma, setFiltroPrograma] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    programa: '', codigoInvestigacion: '', correoAutor: '', tutorPrincipal: '', semestre: '1', consecutivoConfirmadoPorTutor: false
  });

  async function leerDatos() {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const items: any[] = [];
      querySnapshot.forEach((doc) => { items.push({ id: doc.id, ...doc.data() }); });
      setDatos(items);
    } catch (err: any) { setError(err.message); } finally { setCargando(false); }
  }

  useEffect(() => { leerDatos(); }, []);

  const programasUnicos = Array.from(new Set(datos.map(p => p.programaKey || p.programa).filter(Boolean)));
  const opcionesPrograma = programasUnicos.length > 0 ? programasUnicos : ['MDGEVA'];

  const proyectosFiltrados = datos.filter(proyecto => {
    const textoBusqueda = busqueda.toLowerCase();
    const coincideTexto = busqueda === '' || 
      (proyecto.codigoInvestigacion || '').toLowerCase().includes(textoBusqueda) ||
      (proyecto.correoAutor || '').toLowerCase().includes(textoBusqueda) ||
      (proyecto.tutorPrincipal || '').toLowerCase().includes(textoBusqueda);
    const coincidePrograma = filtroPrograma === '' || proyecto.programaKey === filtroPrograma || proyecto.programa === filtroPrograma;
    const coincideEstado = filtroEstado === '' || 
      (filtroEstado === 'confirmado' && proyecto.consecutivoConfirmadoPorTutor) || (filtroEstado === 'pendiente' && !proyecto.consecutivoConfirmadoPorTutor);
    return coincideTexto && coincidePrograma && coincideEstado;
  });

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    const codigoExiste = datos.some(p => (p.codigoInvestigacion || '').toLowerCase() === nuevoProyecto.codigoInvestigacion.trim().toLowerCase());
    if (codigoExiste) { alert(`⚠️ ERROR: El código "${nuevoProyecto.codigoInvestigacion}" ya existe.`); return; }
    
    setGuardando(true);
    try {
      await addDoc(collection(db, 'projects'), nuevoProyecto);
      await leerDatos();
      setMostrarFormulario(false);
      setNuevoProyecto({ programa: opcionesPrograma[0] as string, codigoInvestigacion: '', correoAutor: '', tutorPrincipal: '', semestre: '1', consecutivoConfirmadoPorTutor: false });
    } catch (err: any) { alert("Error al guardar: " + err.message); } finally { setGuardando(false); }
  };

  // Estilos de pestañas
  const estiloPestaña = (activa: boolean) => ({
    padding: '0.8rem 1.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
    border: 'none', borderBottom: activa ? '3px solid #0056b3' : '3px solid transparent',
    backgroundColor: 'transparent', color: activa ? '#0056b3' : '#666', transition: 'all 0.2s'
  });

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#111', margin: 0 }}>Directorio de Proyectos</h1>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '1.1rem' }}>Facultad de Ciencias de la Educación - ULS</p>
      </header>

      {/* MENÚ DE NAVEGACIÓN (TABS) */}
      <nav style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ddd', marginBottom: '2rem' }}>
        <button onClick={() => setPestañaActiva('proyectos')} style={estiloPestaña(pestañaActiva === 'proyectos')}>Proyectos</button>
        <button onClick={() => setPestañaActiva('maestrantes')} style={estiloPestaña(pestañaActiva === 'maestrantes')}>Maestrantes</button>
        <button onClick={() => setPestañaActiva('tutores')} style={estiloPestaña(pestañaActiva === 'tutores')}>Tutores</button>
      </nav>

      {/* ----------------- VISTA: PROYECTOS ----------------- */}
      {pestañaActiva === 'proyectos' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => { if (!nuevoProyecto.programa) setNuevoProyecto({...nuevoProyecto, programa: opcionesPrograma[0] as string}); setMostrarFormulario(true); }} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Nuevo Proyecto
            </button>
          </div>

          {!cargando && !error && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
              <input type="text" placeholder="Buscar código o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ flex: '1 1 250px', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }} />
              <select value={filtroPrograma} onChange={(e) => setFiltroPrograma(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: 'white' }}>
                <option value="">Todos los programas</option>
                {programasUnicos.map((prog: any, i) => <option key={i} value={prog}>{prog}</option>)}
              </select>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: 'white' }}>
                <option value="">Todos los estados</option>
                <option value="confirmado">Confirmados</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>
          )}

          {error && <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '1rem' }}><strong>Error:</strong> {error}</div>}
          
          {cargando ? ( <div style={{ textAlign: 'center', padding: '3rem', color: '#666', fontSize: '1.2rem' }}>Cargando proyectos...</div> ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {proyectosFiltrados.map((proyecto) => (
                <div key={proyecto.id} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0056b3', textTransform: 'uppercase' }}>{proyecto.programaKey || proyecto.programa || 'Sin Programa'}</div>
                    {proyecto.semestre && <span style={{ fontSize: '0.75rem', backgroundColor: '#eef', padding: '3px 8px', borderRadius: '12px', color: '#555' }}>Sem: {proyecto.semestre}</span>}
                  </div>
                  <h2 style={{ fontSize: '1.2rem', color: '#222', marginBottom: '1rem', lineHeight: '1.4' }}>{proyecto.codigoInvestigacion || 'Sin código'}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.95rem' }}><span style={{ color: '#666' }}>Autor:</span> <strong>{proyecto.correoAutor || 'No registrado'}</strong></div>
                    <div style={{ fontSize: '0.95rem' }}><span style={{ color: '#666' }}>Tutor:</span> <strong>{proyecto.tutorPrincipal || 'Por asignar'}</strong></div>
                  </div>
                  <div style={{ backgroundColor: '#f9f9f9', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #eee' }}>
                    {proyecto.cedulaAutor && <div style={{ marginBottom: '4px' }}><strong>Cédula:</strong> {proyecto.cedulaAutor}</div>}
                    {proyecto.autoresDetalle && Array.isArray(proyecto.autoresDetalle) && proyecto.autoresDetalle.length > 0 && ( <div style={{ marginBottom: '4px' }}><strong>Integrantes:</strong> {proyecto.autoresDetalle.map((a: any) => a.nombre).join(', ')}</div> )}
                    {proyecto.resumen ? ( <div style={{ color: '#555', fontStyle: 'italic', marginTop: '6px' }}>"{proyecto.resumen.length > 90 ? proyecto.resumen.substring(0, 90) + '...' : proyecto.resumen}"</div> ) : ( <div style={{ color: '#aaa', fontStyle: 'italic' }}>Sin resumen disponible</div> )}
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem' }}>
                    {proyecto.consecutivoConfirmadoPorTutor ? ( <span style={{ color: '#0f5132', backgroundColor: '#d1e7dd', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>✓ Confirmado</span> ) : ( <span style={{ color: '#842029', backgroundColor: '#f8d7da', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>⏳ Pendiente</span> )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ----------------- VISTA: MAESTRANTES ----------------- */}
      {pestañaActiva === 'maestrantes' && (
        <section style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '2px dashed #ddd' }}>
          <h2 style={{ color: '#555' }}>Módulo de Maestrantes</h2>
          <p style={{ color: '#777', fontSize: '1.1rem' }}>Aquí conectaremos la colección 'students' o 'maestrantes' de tu base de datos de Firebase.</p>
        </section>
      )}

      {/* ----------------- VISTA: TUTORES ----------------- */}
      {pestañaActiva === 'tutores' && (
        <section style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '2px dashed #ddd' }}>
          <h2 style={{ color: '#555' }}>Módulo de Tutores</h2>
          <p style={{ color: '#777', fontSize: '1.1rem' }}>Aquí conectaremos la colección 'tutors' de tu base de datos de Firebase.</p>
        </section>
      )}

      {/* MODAL FORMULARIO PROYECTOS (SE MANTIENE IGUAL) */}
      {mostrarFormulario && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Agregar Proyecto</h2>
            <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div><label>Programa</label><select required value={nuevoProyecto.programa} onChange={e => setNuevoProyecto({...nuevoProyecto, programa: e.target.value})} style={{ width: '100%', padding: '0.6rem' }}>{opcionesPrograma.map((prog: any, i) => <option key={i} value={prog}>{prog}</option>)}</select></div>
              <div><label>Código de Investigación</label><input required type="text" value={nuevoProyecto.codigoInvestigacion} onChange={e => setNuevoProyecto({...nuevoProyecto, codigoInvestigacion: e.target.value})} style={{ width: '100%', padding: '0.6rem' }} /></div>
              <div><label>Correo del Autor (Líder)</label><input required type="email" value={nuevoProyecto.correoAutor} onChange={e => setNuevoProyecto({...nuevoProyecto, correoAutor: e.target.value})} style={{ width: '100%', padding: '0.6rem' }} /></div>
              <div><label>Tutor Principal</label><input required type="text" value={nuevoProyecto.tutorPrincipal} onChange={e => setNuevoProyecto({...nuevoProyecto, tutorPrincipal: e.target.value})} style={{ width: '100%', padding: '0.6rem' }} /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setMostrarFormulario(false)} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#e9ecef', border: 'none', borderRadius: '6px' }}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#198754', color: 'white', border: 'none', borderRadius: '6px' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
