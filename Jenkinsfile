pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        echo 'Building last Blockly version'
        sh '$WORKSPACE/build.py'
      }
    }

    stage('Debug') {
      steps {
        sh 'ls -la'
      }
    }

  }
}