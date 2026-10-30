'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [datos, setDatos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  // Estados para los filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrograma, setFiltroPrograma] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    async function leerDatos() {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const items: any[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setDatos(items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    leerDatos();
  }, []);

  // Extraer programas únicos para el selector
  const programasUnicos = Array.from(new Set(datos.map(p => p.programaKey || p.programa).filter(Boolean)));

  // Lógica de filtrado en tiempo real
  const proyectosFiltrados = datos.filter(proyecto => {
    const textoBusqueda = busqueda.toLowerCase();
    const coincideTexto = busqueda === '' || 
      (proyecto.codigoInvestigacion || '').toLowerCase().includes(textoBusqueda) ||
      (proyecto.correoAutor || '').toLowerCase().includes(textoBusqueda) ||
      (proyecto.tutorPrincipal || '').toLowerCase().includes(textoBusqueda);

    const coincidePrograma = filtroPrograma === '' || proyecto.programaKey === filtroPrograma || proyecto.programa === filtroPrograma;
    
    const coincideEstado = filtroEstado === '' || 
      (filtroEstado === 'confirmado' && proyecto.consecutivoConfirmadoPorTutor) ||
      (filtroEstado === 'pendiente' && !proyecto.consecutivoConfirmadoPorTutor);

    return coincideTexto && coincidePrograma && coincideEstado;
  });

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#111', margin: 0 }}>Directorio de Proyectos</h1>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '1.1rem' }}>Facultad de Ciencias de la Educación - ULS</p>
      </header>

      {/* Barra de Filtros */}
      {!cargando && !error && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <input 
            type="text" 
            placeholder="Buscar por código, autor o tutor..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: '1 1 250px', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <select 
            value={filtroPrograma} 
            onChange={(e) => setFiltroPrograma(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: 'white' }}
          >
            <option value="">Todos los programas</option>
            {programasUnicos.map((prog: any, i) => (
              <option key={i} value={prog}>{prog}</option>
            ))}
          </select>
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: 'white' }}
          >
            <option value="">Todos los estados</option>
            <option value="confirmado">Confirmados por tutor</option>
            <option value="pendiente">Pendientes</option>
          </select>
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>Error de conexión:</strong> {error}
        </div>
      )}

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666', fontSize: '1.2rem' }}>
          Cargando proyectos desde Firebase...
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', color: '#555', fontWeight: '500' }}>
            Mostrando {proyectosFiltrados.length} proyectos
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {proyectosFiltrados.map((proyecto) => (
              <div key={proyecto.id} style={{ border
