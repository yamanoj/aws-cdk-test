const cdk = require('@aws-cdk/core');
const s3 = require('@aws-cdk/aws-s3');
const s3Deploy = require('@aws-cdk/aws-s3-deployment');
const fs = require('fs');
const ejs = require('ejs');

class CdkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const loadSoftphone = new cdk.CfnParameter(this, "loadSoftphone", {
      type: "String",
      default : "true",
      description: "Load Softphone (true/false)?"});

    const loadAgentAssist = new cdk.CfnParameter(this, "loadAgentAssist", {
      type: "String",
      default : "true",
      description: "Load Agent Assist (true/false)?"});

    const operataStaticServer = new cdk.CfnParameter(this, "operataStaticServer", {
      type: "String",
      description: "Operata Static Server? eg: https://static.operata.io"});

    const operataAPIServer = new cdk.CfnParameter(this, "operataAPIServer", {
      type: "String",
      description: "Operata API Server? eg: https://api.operata.io"});


    let vars = {
      CONNECT_RTC_VERSION:'v1.1.7',
      CONNECT_STREAMS_VERSION:'1.5.1',
      OPERATA_STATIC_SERVER: operataStaticServer.valueAsString,
      OPERATA_API_SERVER: operataAPIServer.valueAsString,
      OPERATA_GROUP_ID:'0841f5f7-e9c0-4454-8cb3-0eb3230e899b',
      OPERATA_GROUP_SECRET:'LnfgDsc3WD9F3qNf',
      GROUP_CCP_URL:'https://operata.awsapps.com/connect/ccp-v2',
      LOAD_SOFTPHONE: loadSoftphone.valueAsString,
      LOAD_AGENT_ASSIST: loadAgentAssist.valueAsString};

    const template = fs.readFileSync('softphone.tmpl.html').toString();
    const content = ejs.render(template, vars);

    fs.writeFileSync('dist/index.html', content);

    const softphoneBucket = new s3.Bucket(this, 'SoftphneBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    new s3Deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3Deploy.Source.asset('../dist')],
      destinationBucket: softphoneBucket
    });

  }
}

module.exports = { CdkStack }
