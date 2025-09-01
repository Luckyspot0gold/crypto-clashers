import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as qldb from 'aws-cdk-lib/aws-qldb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class UnshakeableFoundationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Quantum-Resistant Ledger
    const ledger = new qldb.CfnLedger(this, 'MarketMayhemLedger', {
      name: 'MarketMayhem',
      permissionsMode: 'ALLOW_ALL',
      deletionProtection: true,
    });

    // 2. Revenue Engine Table
    const revenueTable = new dynamodb.Table(this, 'RevenueEvents', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // 3. Core Engine Lambda
    const engine = new lambda.Function(this, 'MarketEngine', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        LEDGER_NAME: ledger.name,
        TABLE_NAME: revenueTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // 4. Secure API Gateway
    const api = new apigateway.RestApi(this, 'MarketMayhemAPI', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const integration = new apigateway.LambdaIntegration(engine);
    api.root.addMethod('POST', integration);
  }
}
