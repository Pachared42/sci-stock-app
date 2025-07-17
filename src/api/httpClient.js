import api from './axiosInstance';

export function apiFetch(path, options = {}) {
  const method = options.method || 'get';

  return api({
    url: path,
    method,
    data: options.body ? JSON.parse(options.body) : undefined,
    headers: options.headers,
  });
}

