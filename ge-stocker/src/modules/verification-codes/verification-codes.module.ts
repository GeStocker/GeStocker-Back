import { Module } from '@nestjs/common';
import { VerificationCodesService } from './verification-codes.service';
import { VerificationCodesController } from './verification-codes.controller';

@Module({
  controllers: [VerificationCodesController],
  providers: [VerificationCodesService],
})
export class VerificationCodesModule {}
