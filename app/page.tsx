'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [cargando, setCargando] = useState<boolean>(true);

  // Estados de Colecciones
  const [datos, setDatos] = useState<any[]>([]); // projects
  const [tutores, setTutores] = useState<any[]>([]); // tutors
  const [maestrantes, setMaestrantes] = useState<any[]>([]); // students

  // Estados de Filtros
  const [busqueda, setBusqueda] = useState('');
  const [busquedaMaestrantes, setBusquedaMaestrantes] = useState('');
  const [filtroProgramaMaestrante, setFiltroProgramaMaestrante] = useState('');
  const [filtroSemestreMaestrante, setFiltroSemestreMaestrante] = useState('');

  // Estados Formularios
  const [mostrarModalMaestrante, setMostrarModalMaestrante] = useState(false);
  const [guardandoMaestrante, setGuardandoMaestrante] = useState(false);
  const [nuevoMaestrante, setNuevoMaestrante] = useState({
    nombre: '', correo: '', documento: '', programa: 'MDGEVA', semestre: '1', estado: 'Activo'
  });

  async function leerDatos() {
    setCargando(true);
    let tempProyectos: any[] = [];
    let tempTutores: any[] = [];
    let tempMaestrantes: any[] = [];

    try {
      const pSnap = await getDocs(collection(db, 'projects'));
      tempProyectos = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { console.error("Error cargando projects:", e); }

    try {
      // Cambio a la colección exacta 'tutors'
      const tSnap = await getDocs(collection(db, 'tutors'));
      tempTutores = tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { console.error("Error cargando tutors:", e); }

    try {
      // Cambio a la colección exacta 'students'
      const mSnap = await getDocs(collection(db, 'students'));
      tempMaestrantes = mSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { console.error("Error cargando students:", e); }

    setDatos(tempProyectos);
    setTutores(tempTutores);
    setMaestrantes(tempMaestrantes);
    setCargando(false);
  }

  useEffect(() => { leerDatos(); }, []);

  // Lógica de filtrado
  const proyectosFiltrados = datos.filter(p => 
    (p.codigoInvestigacion || '').toLowerCase().includes(busqueda.toLowerCase()) || 
    (p.titulo || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const maestrantesFiltrados = maestrantes.filter(m => {
    const texto = busquedaMaestrantes.toLowerCase();
    const coincideTexto = texto === '' || 
      (m.nombre || m.nombres || '').toLowerCase().includes(texto) || 
      (m.correo || m.email || '').toLowerCase().includes(texto) ||
      (m.documento || m.cedula || '').toLowerCase().includes(texto);
    const coincidePrograma = filtroProgramaMaestrante === '' || m.programa === filtroProgramaMaestrante;
    const coincideSemestre = filtroSemestreMaestrante === '' || m.semestre === filtroSemestreMaestrante;
    return coincideTexto && coincidePrograma && coincideSemestre;
  });

  const enmascararDocumento = (doc: string) => {
    if (!doc) return 'No registrado';
    if (doc.length <= 4) return '***' + doc;
    return '***' + doc.slice(-4);
  };

  // Función Guardar Nuevo Maestrante
  const manejarEnvioMaestrante = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoMaestrante(true
