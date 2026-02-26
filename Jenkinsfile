pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    node --version
                    npm --version
                    npm ci
                    npx playwright install --with-deps chromium
                '''
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Chromium Tests') {
                    steps {
                        sh 'npm test -- --project=chromium'
                    }
                }
                stage('Firefox Tests') {
                    steps {
                        sh 'npm test -- --project=firefox'
                    }
                }
                stage('WebKit Tests') {
                    steps {
                        sh 'npm test -- --project=webkit'
                    }
                }
            }
        }

        stage('Generate Report') {
            steps {
                sh 'npm run report:dashboard'
            }
        }
    }

    post {
        always {
            // Archive test results
            junit allowEmptyResults: true, testResults: '**/test-results/**/*.xml'
            
            // Archive HTML report
            publishHTML([
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report'
            ])
            
            // Archive screenshots and videos
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
        }

        failure {
            echo 'Tests failed! Check the Playwright report for details.'
            // Send email notification
            emailext(
                subject: "Test failed in ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                body: "Build failed. Check console output at ${env.BUILD_URL}",
                to: '${DEFAULT_RECIPIENTS}'
            )
        }

        success {
            echo 'All tests passed!'
        }
    }
}
