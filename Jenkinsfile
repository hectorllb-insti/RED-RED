pipeline {
    agent any
    stages {
        stage('Checkout'){ steps{ checkout scm } }
        stage('Build'){ steps{ sh 'echo "Build ejecutado"' } }
        stage('Archive'){ steps{ archiveArtifacts artifacts: '**/*' } }
        stage('Deploy'){ steps{ sh 'echo "Desplegando..."' } }
    }
}
