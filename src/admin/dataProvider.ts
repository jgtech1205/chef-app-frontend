import { DataProvider, fetchUtils } from 'react-admin';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface HttpClientOptions {
  method?: string;
  body?: any;
  headers?: Headers;
}

interface QueryParams {
  [key: string]: string | number | boolean;
}

const httpClient = (url: string, options: HttpClientOptions = {}) => {
  // Add auth token to all requests
  const token = localStorage.getItem('accessToken');
  if (token) {
    options.headers = new Headers({ Accept: 'application/json' });
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  return fetchUtils.fetchJson(url, options);
};

export const dataProvider: DataProvider = {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query: QueryParams = {
      page: page,
      limit: perPage,
    };
    
    if (params.filter) {
      Object.assign(query, params.filter);
    }

    const url = `${apiUrl}/restaurant/super-admin/${resource}?${new URLSearchParams(query).toString()}`;
    
    return httpClient(url).then(({ json }) => ({
      data: json.data || [],
      total: json.pagination?.total || json.data?.length || 0,
    }));
  },

  getOne: (resource, params) => {
    const url = `${apiUrl}/restaurant/super-admin/${resource}/${params.id}`;
    
    return httpClient(url).then(({ json }) => ({
      data: json.data,
    }));
  },

  getMany: (resource: string, params: { ids: string[] }) => {
    const query = {
      ids: JSON.stringify(params.ids),
    };
    const url = `${apiUrl}/restaurant/super-admin/${resource}?${fetchUtils.queryParameters(query)}`;
    
    return httpClient(url).then(({ json }) => ({
      data: json.data || [],
    }));
  },

  getManyReference: (resource: string, params: { target: string; id: string }) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };
    const url = `${apiUrl}/restaurant/super-admin/${resource}?${fetchUtils.queryParameters(query)}`;

    return httpClient(url).then(({ json }) => ({
      data: json.data || [],
      total: json.pagination?.total || 0,
    }));
  },

  update: (resource, params) =>
    httpClient(`${apiUrl}/restaurant/super-admin/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json.data })),

  updateMany: (resource: string, params: { ids: string[]; data: any }) => {
    const query = {
      ids: JSON.stringify(params.ids),
    };
    return httpClient(`${apiUrl}/restaurant/super-admin/${resource}?${fetchUtils.queryParameters(query)}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: params.ids }));
  },

  create: (resource, params) =>
    httpClient(`${apiUrl}/restaurant/super-admin/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.data.id },
    })),

  delete: (resource, params) =>
    httpClient(`${apiUrl}/restaurant/super-admin/${resource}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json })),

  deleteMany: (resource: string, params: { ids: string[] }) => {
    const query = {
      ids: JSON.stringify(params.ids),
    };
    return httpClient(`${apiUrl}/restaurant/super-admin/${resource}?${fetchUtils.queryParameters(query)}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: params.ids }));
  },
};