pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        echo 'Building last Blockly version'
        sh './build.sh'
      }
    }

    stage('Debug') {
      steps {
        sh 'ls -la'
      }
    }

  }
}