export interface KpiSummary {
  totalProducts: number;
  totalPredictedSales: number;
  previousActualSales: number;
  averageGrowth: number;
  totalBacklogs: number;
  predictionAccuracy: number;
}

export interface KpiSummaryNew {
  totalProducts: number;
  totalPredictedSales: number;
  currentGrowthRate: number;
  predictedGrowthRate:number;
  monthly_avg_backorder:number;
  predictionAccuracy: number;
}

export interface SalesSeries {
  name: string;            // e.g., '2025-01'
  value: number;           // sales value for the month
}

export interface SalesData {
  name: string;            // e.g., 'Historical Sales' or 'Predicted Sales'
  series: SalesSeries[];   // list of 12 month data
}

export interface ForecastSummary {
  product_id: number;
  product_name: string;
  current_month_sales: number;
  predicted_next_month: number;
  growth_percentage: number;
  backlog_count: number;
  confidence_score: number;
}
export const COLOR_SCHEME = {
  domain: ['#667eea', '#ff7e5f', '#4CAF50', '#FFC107', '#F44336', '#9C27B0']
};