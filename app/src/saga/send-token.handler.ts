import { CommandHandler, HandleCommand } from '../../../src/command'
import { Saga } from '../../../src/saga/saga'

@CommandHandler({
    path: '/token',
})
export class SendTokenHandler implements HandleCommand {
    readonly saga = new Saga('SagaHandler')

    async handle() {
        // return this.saga.failToken(
        //     'AQBwAAAAKgAAAAMAAAAAAAAAAdFWp3cF4rQmWIMmhcHZynx1Y/i23Uto2dPKwarNQ11cMY4RiJArEcnYqgG5vJvtNVNU0dTNncACYOMyROgKZWwz0OY=7YmUWl4jBDV0pmrcaEI/2iovdbtH5Vj1GlpZG0sDe8gY1iypV4GIrh4TP13Cix4ShgI4Grg1tNYfRDFwFy5dNrP9EcpdyNYghBh6bvK7qX69evvw7kSW7vkWYToV7T3JgtyDoTOCSFJrz3cZVbtcb4mA/UruK/Mgj9WvC1f+bzJnMK5Z5aL2o6xqNB4sIW4Rtet783WbaNrhfCslvA/01xQ6cYgr4XKS4ZfnGbuMcQaEQlx+ALpu6akcnhXp0P45RM2N4VeZ9X4WtjW19oBhfVmc4J/+ycDxqjyRrq7GBszAUIjs0zBAssUR5iqU7EG/Awy7Df4nTjwWNhgbn6RN9qx7BXyEAqL0JShFWaxhTwVr0wr10dVOaSWk6HK9+qFRriSyTVJFe5QHGn4ZLWzo/oTAqhIQHA3rj+pDqIajTQcuFQ/1b5cdesOWKUQMa0dxDdBfH+MA0gN5+J/k7DP5w0snxJ5cnxi9Zog1BOmOe5WFqZyDP3kU5Z5Xr4BYV4IYvgdpUviCo+uFPDOEcVTy'
        // )
    }
}
