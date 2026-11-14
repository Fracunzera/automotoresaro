/**
 * Ejecuta las tareas con la misma clave de a una por vez, para que dos cambios
 * simultáneos no se pisen (ej. dos clientes registrándose al mismo tiempo).
 * Funciona dentro de un mismo proceso: en el VPS, correr una sola instancia de la app.
 */
const colas = new Map<string, Promise<unknown>>();

export function conCandado<T>(clave: string, tarea: () => Promise<T>): Promise<T> {
  const anterior = colas.get(clave) ?? Promise.resolve();
  const actual = anterior.catch(() => {}).then(tarea);
  colas.set(clave, actual.catch(() => {}));
  return actual;
}
