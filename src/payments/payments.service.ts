import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { sign } from 'crypto';


@Injectable()
export class PaymentsService {


  private readonly stripe = new Stripe(envs.stripeSecret)

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {

    const { currency, items, orderId } = paymentSessionDto;

    const lineItems = items.map(item => {
      return {
            price_data: {
            currency: currency,
            product_data: {
              name: item.name
            },
            unit_amount: Math.round(item.price * 100 ), 
          },
          quantity: item.quantity
      }
    })
    const session = await this.stripe.checkout.sessions.create({
      //Colocar el id de la orden
      payment_intent_data: {
        metadata: {
          orderId: orderId
        }
      },
      line_items: lineItems,
      
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    },
  );
    return session;
  }

  async stripeWebHook(req: Request, res: Response){
    const sig = req.headers['stripe-signature'];
    //Testing
    // const endpointSecret = "whsec_fe0b2e1d1b72dbee185280c5e6daf1e8d976bef45ba67fbbd3d6cc1f726ac343";
    
    //Real
    const endpointSecret = envs.stripeEnpointSecret;

    let event: Stripe.Event;

    try {
      
      event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
      
    } catch (err) { 

      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
      
    }
    console.log("adsadasdad")
    console.log( {event })
    switch(event.type){
      case  'charge.succeeded': 
        const chargeSucceeded = event.data.object;
        console.log({
          metadata: chargeSucceeded.metadata,
          orderId: chargeSucceeded.metadata.orderId
        });
        break;
      default:
        console.log(`Evento ${ event.type } not handled`)
    }
    return  res.status(200).json({sig})
  }
}
