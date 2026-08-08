pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                echo 'Installing Python dependencies...'

                bat '''
                    python --version
                    python -m pip install --upgrade pip
                    python -m pip install -r backend\\requirements.txt
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running Python tests...'

                bat '''
                    python -m compileall backend
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deployment will be configured later...'
            }
        }
    }
}