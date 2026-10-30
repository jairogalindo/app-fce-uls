'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [datos, setDatos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      }
    }
    leerDatos();
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Prueba de Conexión a Firebase</h2>
      {error ? (
        <p style={{ color: 'red', fontWeight: 'bold' }}>Error de Firebase: {error}</p>
      ) : (
        <pre>{JSON.stringify(datos, null, 2)}</pre>
      )}
    </main>
  );
}