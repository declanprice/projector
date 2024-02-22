import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CoreResources } from './core.resource'
import { CommandResources } from './command.resources'
import { QueryResources } from './query.resources'
import { EventResources } from './event.resources'

export class AppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const core = new CoreResources(this, 'Core')

        new CommandResources(this, 'Command', core)

        new QueryResources(this, 'Query', core)

        new EventResources(this, 'Event', core)
    }
}
