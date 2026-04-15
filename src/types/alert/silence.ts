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

export interface AlertSilence {
  id: number;
  createdAt: string;
  updatedAt: string;
  cluster: string;
  type: number;
  status: number;
  fingerprint: string;
  startsAt: number;
  endsAt: number;
  matchers: Matcher[];
  comment: string;
  createdBy: string;
}

export interface Matcher {
  name: string;
  value: string;
  type: string;
}
