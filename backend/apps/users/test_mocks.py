import json
from unittest.mock import patch, Mock
from django.test import TestCase

# Simulación de un servicio externo (por ejemplo, validación de email vía API externa)
def check_email_spam_service(email):
    import requests
    # Simulamos una llamada a API real
    response = requests.get(f"https://api.spamchecker.example.com/verify?email={email}")
    if response.status_code == 200:
        data = response.json()
        return data.get("is_spam", False)
    return False

class ExternalServiceMockTestCase(TestCase):
    """
    Tests para verificar la simulación de comportamientos y 
    peticiones de consumo de servicios externos. (Criterios E y F)
    """

    @patch('requests.get')
    def test_mock_external_spam_api_clean(self, mock_get):
        """Verificar el comportamiento cuando la API externa dice que NO es spam"""
        
        # Configuramos la respuesta simulada (Mock)
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"is_spam": False, "score": 0.1}
        mock_get.return_value = mock_response

        # Llamamos al servicio (internamente consumirá el Mock de requests.get)
        result = check_email_spam_service('clean@example.com')

        # Verificamos que se haya llamado a la API con los parámetros correctos
        mock_get.assert_called_once_with("https://api.spamchecker.example.com/verify?email=clean@example.com")
        
        # Validamos el resultado devuelto
        self.assertFalse(result)

    @patch('requests.get')
    def test_mock_external_spam_api_spam(self, mock_get):
        """Verificar el comportamiento cuando la API externa dice que SÍ es spam"""
        
        # Configuramos la respuesta simulada (Mock)
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"is_spam": True, "score": 0.99}
        mock_get.return_value = mock_response

        # Llamamos al servicio
        result = check_email_spam_service('spam@bad-domain.com')

        # Verificamos
        self.assertTrue(result)
        
    @patch('requests.get')
    def test_mock_external_service_failure(self, mock_get):
        """Verificar comportamiento cuando la API externa falla (ej. 500)"""
        
        # Configuramos un error del servidor
        mock_response = Mock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response

        # El servicio está programado para devolver False si falla la llamada
        result = check_email_spam_service('test@example.com')

        # Verificamos
        self.assertFalse(result)
