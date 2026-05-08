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

        stage('Install Playwright Browsers') {
            steps {
                sh 'node ./node_modules/@playwright/test/cli.js install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'node ./node_modules/@playwright/test/cli.js install'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}