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

  const proyectosFiltrados = datos.filter(p => (p.codigoInvestigacion || '').toLowerCase().includes(busqueda.toLowerCase()) || (p.correoAutor || '').toLowerCase().includes(busqueda.toLowerCase()));

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
        
        {/* ================= VISTA: INICIO COMPLETA ================= */}
        {vistaActiva === 'inicio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* HERO INSTITUCIONAL */}
            <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', color: 'white', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ padding: '4rem 3rem' }}>
                <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px' }}>Facultad de Ciencias de la Educación • Universidad de La Salle</div>
                <h1 style={{ fontSize: '2.8rem', lineHeight: '1.2', marginBottom: '1.5rem', maxWidth: '900px' }}>Sistema Integrado de Gestión y Seguimiento de Investigaciones de Maestrías <span style={{ color: '#fbbf24' }}>(BDMaestrías)</span></h1>
                <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', marginBottom: '2.5rem', lineHeight: '1.6' }}>Plataforma institucional para la consulta, caracterización y gobernanza académica de los proyectos de grado, asignaciones de tutoría y núcleos problémicos de las maestrías en Educación.</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setVistaActiva('proyectos')} style={{ backgroundColor: '#be123c', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Explorar Proyectos ({datos.length}) →</button>
                  <button onClick={() => setVistaActiva('tutores')} style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Directorio Docente (78)</button>
                </div>
              </div>
              <div style={{ backgroundColor: '#1e293b', padding: '2rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', borderTop: '1px solid #334155' }}>
                {[
                  { title: 'INVESTIGACIONES', value: datos.length, sub: '335 fichas al día' },
                  { title: 'CUERPO DE TUTORES', value: '78', sub: '60 caracterizados' },
                  { title: 'MAESTRANTES', value: '807', sub: 'Fichas protegidas' },
                  { title: 'PROGRAMAS PEP', value: '4', sub: 'MDO, MDL, MDGEVA, MLGE' },
                  { title: 'TESAURO', value: '58', sub: 'UNESCO / ERIC Oficial' }
                ].map((stat, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem' }}>{stat.title}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ {stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN RUTAS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#111' }}>¿Cómo deseas interactuar hoy? Selecciona tu ruta</h2>
                  <p style={{ color: '#666', margin: 0 }}>Accesos guiados optimizados según tu rol en la comunidad de Maestrías.</p>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>4 perfiles de navegación</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {/* Ruta Maestrante */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#ecfdf5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#10b981', fontWeight: 'bold' }}>🎓</div>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Estudiante Maestrante</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', flex: 1 }}>Consulta tu ficha de seguimiento, tutor asignado, proyecto de tesis y actualiza tus datos protegidos por tu documento de identidad.</p>
                  <button onClick={() => setVistaActiva('maestrantes')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#065f46', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.5rem' }}>Módulo Maestrantes</button>
                  <button onClick={() => setVistaActiva('proyectos')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}>Buscar Investigaciones</button>
                </div>
                {/* Ruta Tutor */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#fef2f2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#ef4444', fontWeight: 'bold' }}>👥</div>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Docente Tutor / Director</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', flex: 1 }}>Registra o actualiza tu perfil docente, líneas temáticas activas, enlaces CvLAC/ORCID y consulta los proyectos bajo tu asesoría.</p>
                  <button onClick={() => setVistaActiva('tutores')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#991b1b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.5rem' }}>Módulo Tutores</button>
                  <button onClick={() => setVistaActiva('proyectos')} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}>Ver Proyectos Asesorados</button>
                </div>
                {/* Ruta Coordinación */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#fffbeb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#f59e0b', fontWeight: 'bold' }}>📊</div>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Coordinación & Comités</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', flex: 1 }}>Supervisa la cobertura de núcleos de formación, mallas curriculares, distribución de cargas de asesoría y estadísticas globales.</p>
                  <button style={{ width: '100%', padding: '0.8rem', backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.5rem' }}>Dashboard de Métricas</button>
                  <button style={{ width: '100%', padding: '0.8rem', backgroundColor: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}>Mallas y PEP</button>
                </div>
                {/* Ruta Gestión */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#3b82f6', fontWeight: 'bold' }}>🗄️</div>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Gestión & Acreditación</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', flex: 1 }}>Accede a la matriz unificada tipo hoja de cálculo, consulta de auditoría institucional e historiales con seguridad.</p>
                  <button style={{ width: '100%', padding: '0.8rem', backgroundColor: '#111827', color: '#fbbf24', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.5rem' }}>Bitácora de Auditoría (Admin)</button>
                  <button style={{ width: '100%', padding: '0.8rem', backgroundColor: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}>Hoja de Cálculo / Matriz</button>
                </div>
              </div>
            </div>

            {/* SECCIÓN DIRECCIÓN & CONTACTO */}
            <div style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ flex: '1 1 600px' }}>
                <div style={{ display: 'inline-block', backgroundColor: '#334155', color: '#fbbf24', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>CANALES INSTITUCIONALES FCE</div>
                <span style={{ marginLeft: '1rem', color: '#fca5a5', fontSize: '0.8rem', backgroundColor: '#451a03', padding: '4px 12px', borderRadius: '4px' }}>Dependencia: Maestrías, PEP y Mallas</span>
                <h2 style={{ color: 'white', margin: '0.5rem 0 1rem 0' }}>Dirección de Maestrías, Asistentes y Secretaría</h2>
                <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>Consulte la información de contacto oficial de la Dirección de Maestrías y el personal de secretaría y asistentes: datos, correos institucionales, líneas de atención, salas virtuales y ventanilla de trámites académicos. El personal de Dirección diligencia y actualiza estos datos directamente en la plataforma con su clave oficial institucional.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '250px' }}>
                <button style={{ padding: '1rem', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Ver Ficha Oficial de Contacto →</button>
                <button style={{ padding: '1rem', backgroundColor: 'transparent', color: '#93c5fd', border: '1px solid #3b82f6', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Diligenciar (Clave Dirección)</button>
              </div>
            </div>

            {/* SECCIÓN ARQUITECTURA */}
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#111' }}>Arquitectura de Datos Centralizada y Sincronización Automática</h3>
                <button style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '20px', cursor: 'pointer' }}>Ver Cómo Funciona →</button>
              </div>
              <p style={{ color: '#666', marginTop: '-1rem', marginBottom: '2rem', fontSize: '0.95rem' }}>Conectado directamente a la nube institucional: tus datos se guardan y reflejan al instante para todos los docentes sin necesidad de descargar o enviar archivos.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                  <div style={{ color: '#4f46e5', fontWeight: 'bold', marginBottom: '0.5rem' }}>Acceso Directo Multidispositivo</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>Cualquier profesor abre el enlace desde computador, tablet o celular sin pasos previos ni instalaciones.</div>
                </div>
                <div style={{ padding: '1.5rem', border: '1px solid #10b981', borderRadius: '8px', backgroundColor: '#ecfdf5' }}>
                  <div style={{ color: '#059669', fontWeight: 'bold', marginBottom: '0.5rem' }}>Base Central en la Nube Activa</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>Toda actualización se persiste inmediatamente en Firestore para toda la comunidad académica.</div>
                </div>
                <div style={{ padding: '1.5rem', border: '1px solid #f59e0b', borderRadius: '8px', backgroundColor: '#fffbeb' }}>
                  <div style={{ color: '#d97706', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cero Dispersión de Archivos</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>No requiere cargar ni descargar planillas. Descargas y respaldos reservados exclusivamente al administrador.</div>
                </div>
              </div>
            </div>

            {/* SECCIÓN PROGRAMAS DE MAESTRÍA */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#111' }}>Maestrías Oficiales de la Facultad</h3>
                <button style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: 'transparent', color: '#4b5563', cursor: 'pointer', fontWeight: 'bold' }}>Ver Mallas y PEP →</button>
              </div>
              <p style={{ color: '#666', marginTop: '-1rem', marginBottom: '2rem' }}>Estructura curricular, núcleos problémicos y líneas de investigación de los 4 programas oficiales de la FCE.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {[
                  { sigla: 'MDO', nombre: 'Maestría en Docencia', desc: 'Pedagogía reflexiva, investigación-acción educativa, docencia situada y ética lasallista en contextos socioeducativos diversos.', cred: '41 créditos', num: 2 },
                  { sigla: 'MDL', nombre: 'Maestría en Didáctica de las Lenguas', desc: 'Enfoque sociocultural, semiótico e intercultural del lenguaje, con énfasis en la didáctica reflexiva y la investigación de aula.', cred: '45 créditos', num: 2 },
                  { sigla: 'MLGE', nombre: 'Maestría en Liderazgo y Gestión Educativa', desc: 'Liderazgo transformacional, gestión integral escolar, procesos de mentoría y acompañamiento fraterno, e investigación...', cred: '47 créditos', num: 4 },
                  { sigla: 'MDGEVA', nombre: 'Maestría en Diseño y Gestión de Escenarios Virtuales de Aprendizaje', desc: 'Investigación Basada en Diseño (IBD), mediaciones tecnopedagógicas críticas, diseño de recursos educativos digitales y evaluación...', cred: '49 créditos', num: 4 }
                ].map((prog, i) => (
                  <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ border: '1px solid #d1d5db', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', color: '#4b5563' }}>{prog.sigla}</span>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{prog.cred}</span>
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#111' }}>{prog.nombre}</h4>
                    <p style={{ color: '#666', fontSize: '0.9rem', flex: 1 }}>{prog.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{prog.num} núcleos problémicos</span>
                      <button onClick={() => { setFiltroPrograma(prog.sigla); setVistaActiva('proyectos'); }} style={{ border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>Proyectos →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN MMEE & EXTRAS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Maestría Externa */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ backgroundColor: '#047857', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>MMEE • MAESTRÍA EXTERNA</span>
                    <h3 style={{ margin: 0, color: '#064e3b' }}>Maestría Externa</h3>
                    <span style={{ border: '1px solid #34d399', backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Código Consecutivo Oficial: MMEE-2026-XXX</span>
                  </div>
                  <p style={{ color: '#065f46', fontSize: '0.9rem', margin: 0, maxWidth: '800px' }}>Espacio oficial para registrar y hacer seguimiento a docentes tutores, maestrantes e investigaciones no asociados a las 4 maestrías oficiales de la Facultad. Opera bajo el consecutivo institucional MMEE con registro temporal previo y aprobación por el tutor designado.</p>
                </div>
                <button style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Ver Maestría Externa →</button>
              </div>

              {/* Compromiso Datos */}
              <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#111', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981' }}>✓</span> Compromiso de Protección de Datos y Rigor Epistemológico
                  </h4>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Aplicación de la Ley 1581 de 2012 (Habeas Data) con enmascaramiento de documentos de identidad, normalización de palabras clave según el Tesauro UNESCO/ERIC y claves restringidas de actualización.</p>
                </div>
                <button style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>Política Habeas Data</button>
              </div>

              {/* Valoración Académica */}
              <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: '#fef3c7', padding: '0.8rem', borderRadius: '8px', color: '#d97706', fontWeight: 'bold' }}>🏅</div>
                  <div>
                    <span style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>ESPACIO PARTICIPATIVO Y FORMATIVO</span>
                    <h4 style={{ margin: '0.25rem 0', color: '#111' }}>Valoración Académica y Reconocimiento Institucional</h4>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, maxWidth: '700px' }}>Espacio participativo y formativo para registrar valoraciones pedagógicas, dictamen metodológico y recomendaciones sobre la plataforma curricular y de investigación de la Facultad de Ciencias de la Educación.</p>
                  </div>
                </div>
                <button style={{ backgroundColor: '#1e3a8a', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Emitir Reconocimiento / Calificación</button>
              </div>
            </div>

            {/* FOOTER */}
            <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', color: '#4b5563', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 'bold' }}>Maestrías FCE-ULS • Universidad de La Salle</span>
                <span>Insumos</span>
                <span>Preguntas frecuentes</span>
                <span>Dashboard Facultad</span>
                <span>Habeas Data</span>
                <span>Dirección y Secretarías</span>
                <span style={{ color: '#d97706' }}>Oráculo Pedagógico</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Desarrollado por <strong>Jairo Alberto Galindo Cuesta</strong></span>
                <button style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Calificar / Enviar Reconocimiento</button>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>© 2026 Jairo Alberto Galindo Cuesta. Todos los derechos reservados de conformidad con la Ley 23 de 1982 y la Decisión Andina 351 de 1993.</div>
            </footer>

          </div>
        )}

        {/* ================= VISTA: PROYECTOS ================= */}
        {vistaActiva === 'proyectos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#111' }}>Directorio de Proyectos</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Buscar código o correo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', minWidth: '250px' }} />
                <button onClick={() => setMostrarModalProyecto(true)} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Nuevo Proyecto</button>
              </div>
            </div>
            
            {cargando ? <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando desde Firebase...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {proyectosFiltrados.map(proyecto => (
                  <div key={proyecto.id} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0056b3' }}>{proyecto.programaKey || 'Sin Programa'}</div>
                    <h3 style={{ margin: '0.5rem 0', color: '#222' }}>{proyecto.codigoInvestigacion}</h3>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}><strong>Autor:</strong> {proyecto.correoAutor}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}><strong>Tutor:</strong> {proyecto.tutorPrincipal}</div>
                  </div>
                ))}
                {proyectosFiltrados.length === 0 && <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', border: '1px dashed #ccc', color: '#666' }}>No hay proyectos que coincidan con la búsqueda.</div>}
              </div>
            )}
          </div>
        )}

        {/* VISTAS EN CONSTRUCCIÓN (Maestrantes / Tutores) */}
        {(vistaActiva === 'tutores' || vistaActiva === 'maestrantes') && (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #ccc' }}>
            <h2>Módulo de {vistaActiva} en construcción</h2>
            <p>Aquí conectaremos la colección correspondiente de Firebase en el próximo paso.</p>
            <button onClick={() => setVistaActiva('inicio')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Volver al Inicio</button>
          </div>
        )}
      </div>
    </div>
  );
}
