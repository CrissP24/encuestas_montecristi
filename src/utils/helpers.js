/**
 * Genera un ID único corto
 */
export function generateId(prefix = '') {
  return prefix + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Obtiene datos de localStorage parseados
 */
export function getStore(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda datos en localStorage
 */
export function setStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Fórmula Haversine simplificada para calcular distancia entre 2 puntos GPS
 * @returns distancia en metros
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // radio de la Tierra en metros
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Verifica si un punto está dentro de un polígono (ray casting)
 */
export function pointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Valida si un punto GPS está dentro de un sector
 */
export function validateSector(lat, lng, sector) {
  if (sector.type === 'circle') {
    const dist = haversineDistance(lat, lng, sector.center_lat, sector.center_lng);
    return dist <= sector.radius_meters;
  }
  if (sector.type === 'polygon' && sector.geojson) {
    return pointInPolygon(lat, lng, sector.geojson);
  }
  return true;
}

/**
 * Valida flags de una respuesta
 */
export function computeFlags(lat, lng, accuracy_m, sector, task, isOffline = false) {
  const now = new Date();
  const start = new Date(task.start_at);
  const end = new Date(task.end_at);
  return {
    offline_capture: isOffline,
    low_accuracy: accuracy_m > 80,
    out_of_sector: !validateSector(lat, lng, sector),
    out_of_schedule: now < start || now > end,
  };
}

/**
 * Formatea una fecha ISO a string legible
 */
export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-EC', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}
