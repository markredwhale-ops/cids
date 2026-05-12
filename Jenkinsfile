pipeline {
    agent {
    docker {
        image 'mcr.microsoft.com/playwright:v1.54.1-jammy'
    }
}

    tools {
        nodejs 'NodeJS-18'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Install Linux Dependencies') {
            steps {
                sh '''
                apt-get update
                npx playwright install-deps
                '''
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                sh 'node ./node_modules/@playwright/test/cli.js install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'node ./node_modules/@playwright/test/cli.js test'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}