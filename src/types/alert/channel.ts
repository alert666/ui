export interface AlertChannel {
  id: number;
  createdAt: string;
  updatedAt: string;
  Name: string;
  Type: string;
  Status: number;
  AggregationStatus: number;
  Config: Config;
  Description: string;
  AlertTemplateID: number;
}

export interface Config {
  app_id: string;
  app_secret: string;
  receive_id: string;
  receive_id_type: string;
}
