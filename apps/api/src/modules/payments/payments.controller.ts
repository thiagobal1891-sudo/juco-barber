import {
  Controller,
  Post,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Body,
  Headers,
  Req,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@barberos/types';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':appointmentId/mercadopago/checkout')
  @UseGuards(AuthGuard('jwt'))
  createMpCheckout(
    @TenantId() tenantId: string,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.paymentsService.createMercadoPagoPreference(tenantId, appointmentId);
  }

  @Post(':appointmentId/cash')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BARBER)
  @HttpCode(HttpStatus.OK)
  completeManual(
    @TenantId() tenantId: string,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.paymentsService.completeManualPayment(tenantId, appointmentId);
  }

  // ── Webhooks (Public) ─────────────────────────────────────────────────────

  @Post('webhook/mercadopago')
  @HttpCode(HttpStatus.OK)
  async handleMpWebhook(
    @Body() body: any,
    @Headers('x-signature') signature: string,
  ) {
    return this.paymentsService.handleMercadoPagoWebhook(body, signature);
  }

  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleStripeWebhook(req.rawBody as unknown as Buffer, signature);
  }
}
