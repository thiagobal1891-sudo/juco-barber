export class AppointmentCreatedEvent {
  constructor(
    public readonly appointmentId: string,
    public readonly tenantId: string,
    public readonly paymentGateway?: string,
  ) {}
}
