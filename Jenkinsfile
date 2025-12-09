// Definición del Pipeline Declarativo
pipeline {
    agent any

    // Define las herramientas si las necesitas (ej. Python 3.10)
    // Si ya tienes Python instalado en el contenedor Docker, puedes omitir este bloque.
    // tools {
    //     python 'Python 3.10'
    // }
    
    stages {
        
        stage('Checkout') {
            steps {
                echo "Clonando el repositorio ${env.JOB_NAME}..."
                checkout scm 
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo "Instalando dependencias de Python desde requirements.txt..."
                // Intentar instalar Python y pip usando apt (común en Debian/Ubuntu, que usa el contenedor Jenkins base)
                sh 'apt-get update && apt-get install -y python3 python3-pip'
                
                // Usar el pip recién instalado
                sh 'pip3 install -r requirements.txt' 
            }
        }

        stage('Test') {
            steps {
                // Ejecuta las pruebas. Aquí debes usar el comando de tu framework de prueba (pytest o unittest)
                echo "Ejecutando pruebas unitarias de Python..."
                // **AJUSTAR ESTA LÍNEA** si usas otro comando de prueba
                sh 'pytest' 
            }
        }
        
        stage('Archive & Report') {
            steps {
                // Si generas reportes de cobertura (ej. con pytest-cov), los archivas
                archiveArtifacts artifacts: 'build/*.whl, htmlcov/**' // Ajustar rutas según tu proyecto
                // Opcional: Si usas JUnitXML (pytest --junitxml=report.xml), puedes publicarlos
                // junit 'report.xml' 
                echo "Artefactos y reportes archivados."
            }
        }
        
        stage('Deploy') {
            steps {
                // SIMULACIÓN: Aquí iría la lógica para enviar el artefacto al servidor
                echo "Despliegue iniciado..."
                sh 'echo "Aplicación Python desplegada con éxito en entorno de Staging/Testing."'
                // sh 'scp mi_app.tar.gz user@servidor:/ruta/de/despliegue'
            }
        }
    }

    // Manejo de Notificaciones al Finalizar
    post {
        always {
            echo "El Pipeline de Python ha finalizado."
        }
        success {
            echo "CI/CD COMPLETO: ¡El Pipeline terminó con éxito! ✅"
        }
        failure {
            echo "CI/CD FALLIDO: El Pipeline falló en la etapa ${currentBuild.currentResult}. ❌"
        }
    }
}