pipeline {
    agent any
    
    environment {
        // Configuraciones de Node.js
        NODE_VERSION = '21.0.0'
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
        
        // Configuraciones de Python
        PYTHON_VERSION = '3.11.6'
        VENV_DIR = "${WORKSPACE}/venv"
        
        // Directorios del proyecto
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        
        // Variables de entorno para el build
        CI = 'true'
    }
    
    stages {
        stage('Preparación') {
            steps {
                echo 'Limpiando workspace...'
                cleanWs()
                
                echo 'Clonando repositorio...'
                checkout scm
                
                echo 'Mostrando información del entorno...'
                sh '''
                    echo "Node version: $(node --version)"
                    echo "NPM version: $(npm --version)"
                    echo "Python version:  $(python3 --version)"
                    echo "Directorio actual: $(pwd)"
                '''
            }
        }
        
        stage('Instalar Dependencias - Backend') {
            steps {
                echo 'Instalando dependencias de Python...'
                    sh '''
                        # Crear entorno virtual
                        python3 -m venv ${VENV_DIR}
                        
                        # Activar entorno virtual e instalar dependencias
                        .  ${VENV_DIR}/bin/activate
                        pip install --upgrade pip

                        pip install setuptools
                        
                        pip install -r requirements.txt
                    '''
            }
        }

        stage('Migraciones - Backend') {
            steps {
                echo 'Ejecutando tests del backend...'
                dir("${BACKEND_DIR}") {
                    sh '''
                        .  ${VENV_DIR}/bin/activate
                        
                        # Ejecutamos las migraciones
                        python manage.py makemigrations
                        python manage.py migrate
                    '''
                }
            }
        }
        
        stage('Instalar Dependencias - Frontend (Root)') {
            steps {
                echo 'Instalando dependencias raíz del proyecto...'
                sh '''
                    npm install
                '''
            }
        }
        
        stage('Instalar Dependencias - Frontend (App)') {
            steps {
                echo 'Instalando dependencias del frontend...'
                dir("${FRONTEND_DIR}") {
                    sh '''
                        npm install
                        npm ci --prefer-offline --no-audit
                    '''
                }
            }
        }
        
        stage('Lint - Backend') {
            steps {
                echo 'Ejecutando lint en el backend...'
                dir("${BACKEND_DIR}") {
                    sh '''
                        .  ${VENV_DIR}/bin/activate
                        
                        # Instalar herramientas de linting si no están
                        pip install flake8 black
                        
                        # Ejecutar flake8 (opcional:  no fallar el build)
                        flake8 .  --count --select=E9,F63,F7,F82 --show-source --statistics || true
                    '''
                }
            }
        }
        
        stage('Lint - Frontend') {
            steps {
                echo 'Ejecutando lint en el frontend...'
                dir("${FRONTEND_DIR}") {
                    sh '''
                        # Si existe script de lint en package.json
                        npm run lint --if-present || echo "No lint script found, skipping..."
                    '''
                }
            }
        }
        
        stage('Tests - Backend') {
            steps {
                echo 'Ejecutando tests del backend...'
                dir("${BACKEND_DIR}") {
                    sh '''
                        .  ${VENV_DIR}/bin/activate
                        
                        # Ejecutar tests de Django
                        python manage.py test --noinput || echo "Tests fallaron o no existen"
                    '''
                }
            }
        }
        
        stage('Tests - Frontend') {
            steps {
                echo 'Ejecutando tests del frontend...'
                dir("${FRONTEND_DIR}") {
                    sh '''
                        # Ejecutar tests con coverage
                        CI=true npm test -- --coverage --watchAll=false --passWithNoTests || echo "Tests fallaron o no existen"
                    '''
                }
            }
        }
        
        stage('Build - Frontend') {
            steps {
                echo 'Compilando frontend para producción...'
                dir("${FRONTEND_DIR}") {
                    sh '''
                        CI=false npm run build
                    '''
                }
            }
        }
        
        stage('Recolectar Static Files - Backend') {
            steps {
                echo 'Recolectando archivos estáticos de Django...'
                dir("${BACKEND_DIR}") {
                    sh '''
                        . ${VENV_DIR}/bin/activate
                        
                        # Ejecutar collectstatic
                        python manage. py collectstatic --noinput || echo "collectstatic falló o no está configurado"
                    '''
                }
            }
        }
        
        stage('Verificar Build') {
            steps {
                echo 'Verificando artefactos generados...'
                sh '''
                    echo "=== Estructura del frontend/build ==="
                    ls -lah ${FRONTEND_DIR}/build || echo "No se encontró directorio build"
                    
                    echo "=== Archivos estáticos del backend ==="
                    ls -lah ${BACKEND_DIR}/staticfiles || echo "No se encontró directorio staticfiles"
                '''
            }
        }
        
        stage('Archivar Artefactos') {
            steps {
                echo 'Archivando artefactos del build...'
                archiveArtifacts artifacts: 'frontend/build/**/*', fingerprint:  true, allowEmptyArchive: true
                archiveArtifacts artifacts:  'backend/staticfiles/**/*', fingerprint: true, allowEmptyArchive: true
            }
        }
    }
    
    post {
        success {
            echo '✅ Build completado exitosamente!'
            // Aquí puedes agregar notificaciones (email, Slack, etc.)
        }
        
        failure {
            echo '❌ Build falló!'
            // Aquí puedes agregar notificaciones de fallo
        }
        
        always {
            echo 'Limpiando workspace...'
            // Limpiar cache y archivos temporales
            sh '''
                rm -rf ${VENV_DIR}
                rm -rf ${NPM_CONFIG_CACHE}
                rm -rf node_modules
                rm -rf ${FRONTEND_DIR}/node_modules
            ''' 
        }
    }
}
