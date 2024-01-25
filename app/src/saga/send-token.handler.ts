import { CommandHandler, HandleCommand } from '../../../src/command'
import { Saga } from '../../../src/saga/saga'

@CommandHandler({
    path: '/token',
})
export class SendTokenHandler implements HandleCommand {
    readonly saga = new Saga('SagaHandler')

    async handle() {
        return this.saga.successToken(
            'AQBwAAAAKgAAAAMAAAAAAAAAAQm6tLCN5pR+G5HMrZIJ2LqXUpUPc3Heaa1ACqfavPVOZR7kBFBcPjF07tPS2x8O1NbAoGRjovlOMrtrI1WyydxDrTA=/MxvmkPmQFDUkTkYuNNVd8e9lDA7SdOmv0WBDshvJ8RHVACC8/X0XNY1jZTg1RYpN2cyxWEsLUZEC3KwAVuzOZD1S5WN/gFgK5CschXX9gH0UkXHGTjALKDF/WFpw8MZMZsa1j4WwrWE9xTgniDbmf1VCTJfWESP1WsZYxdClDpehTjjOVecT36gn2+rJjd0Hjpn61+lCCUJB0MFC3rG2+oPtPi45p3i+lukOh8dtt+t3kQUla1QfOMId0b75Kn+lXB/9JwBJ2MzaBvnoTvnH6BTA8/332BLuZIDUhlL6Wj0A5f2r0syl+KtTxtPtkUpne80cwBiIHaW4OkPl4fdy8nkS148+qS0zyIhVI/UV1GujrijPf+vQNsgH+vS5J4x0Y1NZbPpG1wDr0Ifbux+niAS4aqprQF40eaLvf2cT4mKKEioqhYNG1q5gnA4mNsglMOt8om5Z3n214R089LJLgRX8Y73QrkUGYoFa+v/RVAmy7XetRzSLKz5/LGVLd/Uc9af3w6hYLapI0KvMgO3'
        )
    }
}
