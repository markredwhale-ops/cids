pipeline {
    // 1. Указываем, где запускать билд. 
    // "agent any" означает: выполни этот код на любом свободном сервере (агенте) Jenkins.

    //test
    agent any
    
    // 2. Инструменты (Tools). 
    // Чтобы Jenkins понимал команду 'npm', мы просим его заранее подготовить Node.js.
    // 'NodeJS-18' — это название версии, которое должно быть настроено в Global Tool Configuration Jenkins.
    tools {
        nodejs 'NodeJS-18'
    }
    
    // 3. Переменные окружения.
    // CI = 'true' — это стандарт для многих инструментов (включая Playwright), 
    // означает что работа идет не на компьютере человека, а внутри робота-автоматизатора - сервера.
    environment {
        CI = 'true'
    }
    
    stages {
        // ЭТАП 1: Получение кода
        stage('Checkout') {
            steps {
                // 'checkout scm' — универсальная команда. 
                // Она говорит Jenkins: "Возьми настройки репозитория (Git) из самой джобы и скачай код".
                checkout scm
            }
        }

        // ЭТАП 2: Подготовка операционной системы (Linux)
        stage('Install System Dependencies') {
            steps {
                // Playwright - это браузер в данном контексте, а браузеру 
                // в Linux нужны системные библиотеки (.dll аналоги в Linux).
                // Мы запускаем их установку через apt-get. 
                // ' true' в конце — это хитрость, 
                // чтобы билд не упал, если база пакетов уже обновлена.
                sh '''
                    apt-get update  true
                    apt-get install -y libglib2.0-0 libnss3 libatk-bridge2.0-0 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libxshmfence-dev libxrandr2 libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 libatk1.0-0 libcups2 libdbus-1-3 libxcb1 libxkbcommon0 || true
                '''
            }
        }
        
        // ЭТАП 3: Установка библиотек проекта
        stage('Install Dependencies') {
            steps {
                // 'npm ci' — это как 'npm install', но для роботов. Она устанавливает пакеты строго по файлу package-lock.json.
                sh 'npm ci'
                // Устанавливаем сам браузер Chromium, в котором Playwright будет «тыкать» кнопки.
                sh 'npx playwright install chromium'
            }
        }
        
        // ЭТАП 4: Запуск тестов
        stage('Run Tests') {
            steps {
                // Запуск тестов и создание красивого HTML-отчета.
                sh 'npx playwright test --reporter=html'
            }
            // Локальный post внутри стадии: выполняется сразу после тестов.
            post {
                always {
                    // Сохраняем папку с отчетом в интерфейс Jenkins.
                    // 'allowEmptyArchive: true' — чтобы билд не падал, если тесты даже не успели создать отчет.
                    archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                }
            }
        }
    }
    
    // Глобальный POST: выполняется в самом конце всего пайплайна.
    post {
        always {
            // 'cleanWs()' — "чистка за собой". 
            // Удаляет все скачанные файлы и папки с диска сервера, чтобы не забивать место.
            cleanWs()
        }
    }
}