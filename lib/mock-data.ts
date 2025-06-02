// Mock analysis data for testing and demo purposes
export const mockAnalysisData = {
  metrics: {
    totalRevenue: 2847392,
    customerCount: 15847,
    averageOrderValue: 127.45,
    conversionRate: 3.2,
    customerRetention: 85.3,
    monthlyGrowth: 12.4,
    customerLifetimeValue: 890.25,
    churnRate: 14.7,
    dataVolume: "10TB",
    processingTime: "2.5 hours",
    errorRate: "0.3%",
    throughput: "1000 records/sec",
  },
  trends: {
    revenueGrowth: "Steady 15% month-over-month growth",
    customerAcquisition: "Strong growth in Q4, seasonal patterns evident",
    regionalPerformance: "Northeast outperforming by 23%",
    productPerformance: "Premium products showing 31% higher margins",
    seasonality: "20% increase in Q4",
    volumeGrowth: "15% monthly",
    performanceDegradation: "5% over 3 months",
  },
  anomalies: {
    revenueSpike: "Unusual 47% spike in revenue during week of March 15th",
    customerBehavior: "Significant increase in cart abandonment in Southwest region",
    productReturns: "15% increase in returns for Product Category B",
    geographicOutlier: "Unexpected high performance in rural markets",
    spikeDetected: "Processing time spike on weekends",
    qualityIssues: "Missing values in customer_id field",
    unusualChurn: "High churn in segment A",
    conversionDrop: "Conversion dropped 15% last week",
  },
  correlations: {
    priceVsConversion: "Strong negative correlation (-0.73) between price increases and conversion rates",
    seasonVsRevenue: "High positive correlation (0.89) between seasonal trends and revenue",
    marketingVsAcquisition: "Moderate positive correlation (0.64) between marketing spend and customer acquisition",
    retentionVsValue: "Strong positive correlation (0.81) between customer retention and lifetime value",
    volumeVsPerformance: "Strong negative correlation",
    timeVsErrors: "Errors increase during peak hours",
  },
  insights: {
    keyFindings: [
      "Customer retention is 15% above industry average",
      "Premium product segment driving 40% of total revenue",
      "Mobile conversion rates 23% lower than desktop",
      "Email marketing showing highest ROI at 4.2x",
    ],
    opportunities: [
      "Expand successful Northeast strategies to other regions",
      "Optimize mobile experience to improve conversion",
      "Investigate and replicate March 15th success factors",
      "Develop retention programs for high-value customer segments",
    ],
    risks: [
      "High dependency on seasonal Q4 performance",
      "Increasing cart abandonment in key markets",
      "Product Category B quality issues affecting brand perception",
      "Mobile experience gap creating competitive vulnerability",
    ],
  },
  dataQuality: {
    completeness: 94.7,
    accuracy: 97.2,
    consistency: 91.8,
    timeliness: 88.5,
    validity: 95.3,
  },
  performance: {
    queryResponseTime: "1.2s average",
    dataFreshness: "Real-time to 15 minutes",
    systemUptime: "99.7%",
    processingEfficiency: "87% resource utilization",
  },
}

// Mock data for different industries
export const mockDataByIndustry = {
  retail: {
    ...mockAnalysisData,
    metrics: {
      ...mockAnalysisData.metrics,
      inventoryTurnover: 8.4,
      averageBasketSize: 3.7,
      footTraffic: 12847,
      onlineVsInStore: "65% online, 35% in-store",
    },
  },
  technology: {
    ...mockAnalysisData,
    metrics: {
      ...mockAnalysisData.metrics,
      userEngagement: "7.2 sessions/user/month",
      featureAdoption: "73% of users use core features",
      apiCallVolume: "2.3M calls/day",
      systemLatency: "145ms average",
    },
  },
  healthcare: {
    ...mockAnalysisData,
    metrics: {
      ...mockAnalysisData.metrics,
      patientSatisfaction: 4.6,
      readmissionRate: "8.3%",
      averageWaitTime: "23 minutes",
      treatmentEffectiveness: "91.2%",
    },
  },
  finance: {
    ...mockAnalysisData,
    metrics: {
      ...mockAnalysisData.metrics,
      transactionVolume: "847K transactions/day",
      fraudRate: "0.12%",
      customerSatisfactionScore: 4.4,
      complianceScore: "98.7%",
    },
  },
}

// Mock user data for testing
export const mockUserData = {
  dataScientist: {
    id: "user-ds-123",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@company.com",
    role: "data-scientist" as const,
    industry: "technology",
    membershipLevel: "basic" as const,
    features: {
      executiveSummaries: true,
      advancedVisualization: true,
      industrySpecificInsights: true,
      historicalDataLearning: true,
      allFileFormats: true,
      prioritySupport: true,
    },
  },
  dataEngineer: {
    id: "user-de-456",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@company.com",
    role: "data-engineer" as const,
    industry: "finance",
    membershipLevel: "basic" as const,
    features: {
      pipelineInsights: true,
      architectureRecommendations: true,
      transformationInsights: true,
      governanceInsights: true,
      performanceOptimization: true,
      dataCleaningRecommendations: true,
      allFileFormats: true,
    },
  },
  generalUser: {
    id: "user-gen-789",
    name: "Jordan Smith",
    email: "jordan.smith@company.com",
    role: undefined,
    industry: "retail",
    membershipLevel: "basic" as const,
    features: {
      basicAnalytics: true,
      standardReports: true,
      limitedFileFormats: true,
    },
  },
}

// Mock file upload data
export const mockFileData = {
  salesData: {
    fileName: "sales_data_2024.csv",
    fileSize: "2.3 MB",
    uploadDate: "2024-01-15T10:30:00Z",
    status: "processed",
    recordCount: 15847,
    columns: ["date", "customer_id", "product_id", "revenue", "quantity", "region"],
  },
  customerData: {
    fileName: "customer_analytics.xlsx",
    fileSize: "5.7 MB",
    uploadDate: "2024-01-14T14:22:00Z",
    status: "processed",
    recordCount: 8923,
    columns: ["customer_id", "acquisition_date", "lifetime_value", "churn_risk", "segment"],
  },
  pipelineData: {
    fileName: "data_pipeline_logs.json",
    fileSize: "12.1 MB",
    uploadDate: "2024-01-13T09:15:00Z",
    status: "processed",
    recordCount: 45231,
    columns: ["timestamp", "pipeline_id", "status", "processing_time", "error_count", "throughput"],
  },
}

// Export individual components for specific use cases
export const { metrics, trends, anomalies, correlations, insights, dataQuality, performance } = mockAnalysisData
