import { App } from 'aws-cdk-lib'
import { AutothreaderStack } from './stack'

const app = new App()
new AutothreaderStack(app, 'AutothreaderStack')
