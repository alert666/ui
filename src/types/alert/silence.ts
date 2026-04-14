export interface CreateAlertSilenceRequest {
  cluster: string;
  type: number;
  status: number;
  fingerprint: string;
  startsAt: number;
  endsAt: number;
  comment: string;
  createdBy: string;
}
