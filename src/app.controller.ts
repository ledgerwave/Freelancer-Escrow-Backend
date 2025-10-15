import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  getTest(): object {
    return this.appService.getTest();
  }

  @Get('contract-info')
  getContractInfo(): object {
    return {
      message: 'Contract information for Yoloi Wallet integration',
      contract: {
        scriptAddress: 'addr_test1wrae375x9fq2688cfcraswnr9sgwvnr0aqvqtx77rglg33qrztgve',
        paymentAddress: 'addr_test1vpvxdtx7g8l3apv43yz2s9752zj7z94l0tu3c2c9rmg304snmrmzu',
        network: 'preprod',
        contractFile: 'escrow-contract.plutus',
        wallet: 'Yoloi Wallet'
      },
      endpoints: {
        createEscrow: 'POST /escrows',
        lockEscrow: 'POST /escrows/:id/lock',
        deliverEscrow: 'POST /escrows/:id/deliver',
        releaseEscrow: 'POST /escrows/:id/release',
        refundEscrow: 'POST /escrows/:id/refund',
        openDispute: 'POST /disputes',
        resolveDispute: 'POST /disputes/:id/resolve'
      },
      documentation: 'http://localhost:5000/docs',
      timestamp: new Date().toISOString()
    };
  }
}
