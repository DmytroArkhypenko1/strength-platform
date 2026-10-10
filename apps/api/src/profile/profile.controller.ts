import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UpsertProfileDto } from './dto/upsert-profile.dto.js';
import { ProfileService } from './profile.service.js';

type AuthenticatedRequest = Request & {
  user: { userId: number; email: string };
};

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.profileService.findOne(req.user.userId);
  }

  @Patch('me')
  upsertMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpsertProfileDto,
  ) {
    return this.profileService.upsert(req.user.userId, dto);
  }
}