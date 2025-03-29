import { IsString, IsEnum } from 'class-validator';
import { SubscriptionPlan } from '../../../interfaces/subscriptions.enum';

export class CreateCheckoutSessionDto {
  @IsString()
  priceId: string;

  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}