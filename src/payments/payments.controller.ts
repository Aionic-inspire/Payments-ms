import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';

import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-sesion')
  createPaymentSession(@Body() paymentSessionDto : PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: `Payment  successfull`
    }
  }

  @Get('cancel')
  findOne() {
    return {
      ok: false,
      message: `Payment cancelled`
    }
  }

  @Post('webhook')
  async stripeWebhook (@Req() req: Request, @Res() res: Response) {
    
    return this.paymentsService.stripeWebHook(req, res)
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.paymentsService.remove(+id);
  // }
}
