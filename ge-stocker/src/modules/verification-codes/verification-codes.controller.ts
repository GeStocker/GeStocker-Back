import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VerificationCodesService } from './verification-codes.service';
import { CreateVerificationCodeDto } from './dto/create-verification-code.dto';
import { UpdateVerificationCodeDto } from './dto/update-verification-code.dto';

@Controller('verification-codes')
export class VerificationCodesController {
  constructor(private readonly verificationCodesService: VerificationCodesService) {}
}
