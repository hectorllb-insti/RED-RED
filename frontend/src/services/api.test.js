import axios from 'axios';
import api from './api';
import { tokenManager } from './tokenManager';

// Hacemos mock de axios y de tokenManager para las pruebas
jest.mock('axios');
jest.mock('./tokenManager', () => ({
  tokenManager: {
    getToken: jest.fn(),
    setToken: jest.fn(),
    getRefreshToken: jest.fn(),
    clearTokens: jest.fn(),
  }
}));

describe('API Service (Axios Mock) - Pruebas de consumo externo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // axios.create retorna una función (instancia de axios) que intercepta llamadas, 
    // pero para este test podemos mockear los métodos get, post, etc en 'api'
    api.get = jest.fn();
    api.post = jest.fn();
  });

  test('debería simular una petición externa GET correctamente', async () => {
    // Configurar respuesta de mock
    const mockResponse = { data: [{ id: 1, name: 'Test Post' }] };
    api.get.mockResolvedValueOnce(mockResponse);

    const result = await api.get('/posts/');
    
    expect(api.get).toHaveBeenCalledWith('/posts/');
    expect(result.data).toEqual([{ id: 1, name: 'Test Post' }]);
  });

  test('debería simular una petición externa POST correctamente (crear post)', async () => {
    const mockPostData = { content: 'Hola mundo' };
    const mockResponse = { data: { id: 2, content: 'Hola mundo' }, status: 201 };
    
    api.post.mockResolvedValueOnce(mockResponse);

    const result = await api.post('/posts/', mockPostData);
    
    expect(api.post).toHaveBeenCalledWith('/posts/', mockPostData);
    expect(result.status).toBe(201);
    expect(result.data.content).toBe('Hola mundo');
  });

  test('debería manejar error en llamada externa', async () => {
    const mockError = new Error('Network Error');
    api.get.mockRejectedValueOnce(mockError);

    await expect(api.get('/posts/')).rejects.toThrow('Network Error');
  });
});
