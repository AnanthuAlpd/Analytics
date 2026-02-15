export interface KpiSummary {
  totalProducts: number;
  totalPredictedSales: number;
  previousActualSales: number;
  averageGrowth: number;
  totalBacklogs: number;
  predictionAccuracy: number;
}

export interface KpiSummaryNew {
  growthRate: any;
  currentMonthSales: any;
  totalProducts: number;
  totalPredictedSales: number;
  predictedSales?: number; // Added to match usage
  currentGrowthRate: number;
  predictedGrowthRate: number;
  averageGrowth?: number; // Added to match usage
  monthly_avg_backorder: number;
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
// Vibrant palette from Expenses Component
export const COLOR_SCHEME = {
  domain: ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981']
};

// Premium Blue-Teal Palette for Forecasts (Professional & Trustworthy)
export const FORECAST_COLOR_SCHEME = {
  domain: ['#2563eb', '#06b6d4', '#4ade80', '#6366f1', '#8b5cf6']
};

// Purple-Finance Palette for Growth (Modern & Tech)
export const GROWTH_COLOR_SCHEME = {
  domain: ['#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0', '#f72585']
};

// Enhanced Business Analytics Interfaces
export interface RevenueMetrics {
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  profit_margin: number;
  avg_order_value: number;
  total_units_sold: number;
  revenue_growth_yoy: number;
}

export interface CategoryPerformance {
  name: string;
  value: number;
  extra?: {
    revenue: number;
  };
}

export interface BusinessAlert {
  type: 'warning' | 'success' | 'info' | 'error';
  category: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  action: string;
}

export interface TopPerformer {
  product_name: string;
  units_sold: number;
  revenue: number;
}

export interface InventoryHealth {
  total_inventory_value_cost: number;
  total_inventory_value_sale: number;
  at_risk_products: { name: string; stock: number }[];
  status: string;
}
