export interface MonthlySalesRequest {
    startDate: string;
  endDate: string;
  city?: string;
  make?: string;
  model?: string;
  salesPersonName?: string;
  leadName?: string;
  }