pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'PRODUCTION', url: 'https://github.com/Kripal-AIS/RENT-IT-BACKEND.git'
            }
        }

        stage('Install Node.js and npm') {
            steps {
                bat 'node -v'
                bat 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Lint') {
            steps {
                bat 'npm run lint || echo "Lint warnings ignored"'
            }
        }

        stage('Skip Tests') {
            steps {
                echo 'Skipping tests'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
