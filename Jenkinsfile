pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        APP_NAME = 'RENT-IT-BACKEND'
        SLOT_NAME = 'production'
        PUBLISH_PROFILE = credentials('AZURE_WEBAPP_PUBLISH_PROFILE') 
        // You must store your publish profile as a Jenkins secret text credential with ID: AZURE_WEBAPP_PUBLISH_PROFILE
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'PRODUCTION', url: 'https://github.com/Kripal-AIS/RENT-IT-BACKEND.git'
            }
        }

        stage('Set up Node.js') {
            steps {
                sh """
                    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                    node -v
                    npm -v
                """
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Fix Vulnerabilities') {
            steps {
                sh 'npm audit fix || echo "No fixable vulnerabilities"'
            }
        }

        stage('Skip Tests') {
            steps {
                echo 'Skipping tests'
            }
        }

        // Optional: Build step
        // stage('Build Project') {
        //     steps {
        //         sh 'npm run build'
        //     }
        // }

        stage('Deploy to Azure App Service') {
            steps {
                sh """
                    echo "${PUBLISH_PROFILE}" > publishProfile.publishsettings
                    az webapp deployment source config-zip \
                        --name ${APP_NAME} \
                        --slot ${SLOT_NAME} \
                        --resource-group <YOUR_RESOURCE_GROUP> \
                        --src ./   \
                        --subscription <YOUR_SUBSCRIPTION_ID>
                """
            }
        }
    }

    post {
        success {
            echo '✅ Deployment completed successfully!'
        }
        failure {
            echo '❌ Deployment failed. Check the logs for errors.'
        }
    }
}
