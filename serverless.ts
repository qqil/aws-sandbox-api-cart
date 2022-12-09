import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'cart-service',
  frameworkVersion: '3',
  configValidationMode: 'error',
  plugins: ['serverless-offline', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    profile: 'default',
    region: 'eu-central-1',
    stage: 'dev',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iam: {
      role: {
        managedPolicies: [
          'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
        ],
      },
    },
  },
  functions: {
    appHandler: {
      handler: 'dist/main.appHandler',
      events: [
        {
          http: {
            method: 'ANY',
            path: '/',
          },
        },
        {
          http: {
            method: 'ANY',
            path: '{proxy+}',
          },
        },
      ],
    },
  },
  resources: {
    Resources: {},
  },
  package: {
    patterns: ['!**/*', 'dist/**', 'node_modules/**'],
  },
};

module.exports = serverlessConfiguration;
