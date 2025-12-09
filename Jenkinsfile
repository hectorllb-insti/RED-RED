// Definición del Pipeline Declarativo
pipeline {
    // CAMBIO CLAVE: Usamos un contenedor Docker de Python como agente.
    // Esto asegura que 'pip' y 'python' estén disponibles y que el usuario 'jenkins' tenga permisos.
    agent {
        docker {
            image 'python:3.10-slim'
            // Se asume que Docker está instalado en el host y el plugin Docker está en Jenkins.
            // Si el 'pip install' falla por permisos, descomenta la siguiente línea:
            // args '-u 1000:1000' 
        }
    }

    // Ya no es necesaria la sección 'tools' ni los comentarios, ya que Docker maneja el entorno.
    
    stages {
        
        stage('Checkout') {
            steps {
                echo "Clonando el repositorio ${env.JOB_NAME}..."
                // El SCM se configura en el Job (Paso 7), esta instrucción lo ejecuta.
                checkout scm 
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo "Instalando dependencias de Python desde requirements.txt..."
                // Ahora 'pip' funcionará dentro del contenedor 'python:3.10-slim'.
                sh 'pip install -r requirements.txt' 
            }
        }

        stage('Test') {
            steps {
                echo "Ejecutando pruebas unitarias de Python..."
                // Se ejecuta pytest dentro del contenedor Python.
                sh 'pytest' 
            }
        }
        
        stage('Archive & Report') {
            steps {
                // Publica resultados de prueba (si usas JunitXML) y archiva artefactos.
                // Si no tienes estos archivos, este paso podría fallar pero es bueno dejarlo.
                archiveArtifacts artifacts: 'build/*.whl, htmlcov/**' 
                // Opcional: junit 'report.xml' 
                echo "Artefactos y reportes archivados."
            }
        }
        
        stage('Deploy') {
            steps {
                // SIMULACIÓN: Aquí iría el despliegue real
                echo "Despliegue iniciado..."
                sh 'echo "Aplicación Python desplegada con éxito en entorno de Staging/Testing."'
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