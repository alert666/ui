export interface CreateAlertSilenceRequest {
  cluster: string;
  type: number;
  status: number;
  fingerprint: string;
  startsAt: string;
  endsAt: string;
  comment: string;
  createdBy: string;
}
