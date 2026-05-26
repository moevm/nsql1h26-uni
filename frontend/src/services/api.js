const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Ошибка запроса');
  }

  return data;
}

export async function loginAdmin(payload) {
  return request('/admins/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUniversities(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();
  return request(query ? `/universities/?${query}` : '/universities');
}

export async function getUniversity(id) {
  return request(`/universities/${id}`);
}

export async function getProgram(id) {
  return request(`/programs/${id}`);
}

export async function getPrograms(filters = {}, page = 1, limit = 10) {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('limit', String(limit));

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','));
      }
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();
  const response = await request(query ? `/programs/?${query}` : '/programs/');

  return response;
}

export async function createUniversity(payload, adminId) {
  return request('/universities/', {
    method: 'POST',
    headers: {
      'x-user-id': adminId,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteUniversity(universityId, adminId) {
  return request(`/universities/${universityId}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': adminId,
    },
  });
}

export async function updateUniversity(universityId, payload, adminId) {
  return request(`/universities/${universityId}`, {
    method: 'PUT',
    headers: {
      'x-user-id': adminId,
    },
    body: JSON.stringify(payload),
  });
}

export async function createProgram(payload, adminId) {
  return request('/programs/', {
    method: 'POST',
    headers: {
      'x-user-id': adminId,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteProgram(programId, adminId) {
  return request(`/programs/${programId}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': adminId,
    },
  });
}

export async function updateProgram(programId, payload, adminId) {
  return request(`/programs/${programId}`, {
    method: 'PUT',
    headers: {
      'x-user-id': adminId,
    },
    body: JSON.stringify(payload),
  });
}

export async function getProgramsByUniversity(universityId, filters = {}) {
  const params = new URLSearchParams({ university_id: universityId });

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','));
      }
      return;
    }

    params.set(key, String(value));
  });

  return request(`/programs/?${params.toString()}`);
}

export async function exportAllDataJson(adminId) {
  const response = await fetch(`${API_BASE_URL}/data-transfer/export/json`, {
    method: 'GET',
    headers: {
      'x-user-id': adminId,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;
    throw new Error(data?.detail || data?.message || 'Не удалось экспортировать данные');
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition') || '';
  const filenameMatch = contentDisposition.match(/filename="?([^\"]+)"?/i);
  const filename = filenameMatch?.[1] || 'nsql-export.json';

  return { blob, filename };
}

export async function exportAllDataCsv(adminId) {
  const response = await fetch(`${API_BASE_URL}/data-transfer/export/csv`, {
    method: 'GET',
    headers: {
      'x-user-id': adminId,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;
    throw new Error(data?.detail || data?.message || 'Не удалось экспортировать данные');
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition') || '';
  const filenameMatch = contentDisposition.match(/filename="?([^\"]+)"?/i);
  const filename = filenameMatch?.[1] || 'nsql-export.zip';

  return { blob, filename };
}

export async function exportAllDataXml(adminId) {
  const response = await fetch(`${API_BASE_URL}/data-transfer/export/xml`, {
    method: 'GET',
    headers: {
      'x-user-id': adminId,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;
    throw new Error(data?.detail || data?.message || 'Не удалось экспортировать данные');
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition') || '';
  const filenameMatch = contentDisposition.match(/filename="?([^\"]+)"?/i);
  const filename = filenameMatch?.[1] || 'nsql-export.xml';

  return { blob, filename };
}

export async function importAllDataJson(file, adminId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/data-transfer/import/json`, {
    method: 'POST',
    headers: {
      'x-user-id': adminId,
    },
    body: formData,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Не удалось импортировать данные');
  }

  return data;
}

export { API_BASE_URL };
