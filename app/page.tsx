'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [datos, setDatos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

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

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#111', margin: 0 }}>Directorio de Proyectos</h1>
        <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '1.1rem' }}>Facultad de Ciencias de la Educación - ULS</p>
      </header>

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {datos.map((proyecto) => (
            <div key={proyecto.id} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0056b3', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {proyecto.programaKey || proyecto.programa || 'Programa sin definir'}
              </div>
              <h2 style={{ fontSize: '1.2rem', color: '#222', marginBottom: '1rem', lineHeight: '1.4' }}>
                {proyecto.codigoInvestigacion || 'Registro sin código'}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.95rem' }}>
                  <span style={{ color: '#666' }}>Autor:</span> <strong>{proyecto.correoAutor || 'No registrado'}</strong>
                </div>
                <div style={{ fontSize: '0.95rem' }}>
                  <span style={{ color: '#666' }}>Tutor:</span> <strong>{proyecto.tutorPrincipal || 'Por asignar'}</strong>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem' }}>
                {proyecto.consecutivoConfirmadoPorTutor ? (
                  <span style={{ color: '#0f5132', backgroundColor: '#d1e7dd', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>✓ Confirmado por tutor</span>
                ) : (
                  <span style={{ color: '#842029', backgroundColor: '#f8d7da', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>⏳ Pendiente de confirmación</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
