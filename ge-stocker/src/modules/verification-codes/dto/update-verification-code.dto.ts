import { PartialType } from '@nestjs/swagger';
import { CreateVerificationCodeDto } from './create-verification-code.dto';

export class UpdateVerificationCodeDto extends PartialType(CreateVerificationCodeDto) {}
