// Definición del Pipeline Declarativo
pipeline {
    // 1. Agente: Ejecuta en cualquier agente disponible (tu contenedor Docker de Jenkins)
    agent any
    
    // Opcional: Define herramientas (Tools) si necesitas versiones específicas de Maven o JDK
    tools {
        // Asumiendo que has configurado 'Maven 3.8.6' y 'JDK 17' en 'Manage Jenkins -> Tools'
        // Si no lo has hecho, puedes comentar estas líneas por ahora:
        // maven 'Maven 3.8.6'
        // jdk 'JDK 17'
    }

    // 2. Etapas de Ejecución
    stages {
        
        stage('Checkout') {
            steps {
                // Clona el código de la rama 'abel-branch' (usa la configuración del Job, incluyendo el PAT)
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                // Compila el proyecto, pero salta las pruebas para que el 'Build' sea rápido
                sh 'echo "Iniciando compilación (mvn clean install -DskipTests)"'
                sh 'mvn clean install -DskipTests'
            }
        }

        stage('Test') {
            steps {
                // Ejecuta solo las pruebas unitarias. Si fallan, el Pipeline se detiene aquí.
                sh 'echo "Ejecutando pruebas unitarias..."'
                sh 'mvn test'
            }
        }
        
        stage('Archive') {
            steps {
                // Guarda el artefacto JAR/WAR generado y los reportes de prueba
                archiveArtifacts artifacts: 'target/*.jar, target/*.war, target/surefire-reports/*'
                junit 'target/surefire-reports/*.xml' // Publica los resultados de las pruebas Junit
            }
        }
        
        stage('Deploy') {
            steps {
                // SIMULACIÓN: Aquí iría el comando real para desplegar en tu servidor
                sh 'echo "Despliegue simulado en el entorno de Staging/Testing"'
                // Ejemplo: sh 'scp target/tu-aplicacion.war user@servidor:/var/www/app'
            }
        }
    }
}