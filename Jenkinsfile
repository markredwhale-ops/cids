pipeline {
    agent any

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
        sh 'chmod -R +x ./node_modules/.bin/'
        
        sh 'npx playwright install-deps'
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