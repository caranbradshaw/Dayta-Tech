import { generateRecommendations } from "./ai-service"

// Test function to verify Data Engineer features
export async function testDataEngineerFeatures() {
  const mockAnalysisData = {
    metrics: {
      dataVolume: "10TB",
      processingTime: "2.5 hours",
      errorRate: "0.3%",
      throughput: "1000 records/sec",
    },
    trends: {
      volumeGrowth: "15% monthly",
      performanceDegradation: "5% over 3 months",
    },
    anomalies: {
      spikeDetected: "Processing time spike on weekends",
      qualityIssues: "Missing values in customer_id field",
    },
    correlations: {
      volumeVsPerformance: "Strong negative correlation",
      timeVsErrors: "Errors increase during peak hours",
    },
  }

  console.log("Testing Data Engineer recommendations...")

  try {
    const recommendations = await generateRecommendations(
      "test-analysis-123",
      mockAnalysisData,
      "technology",
      "basic",
      "data-engineer",
    )

    console.log("Generated recommendations:", recommendations)

    // Check if we got engineering-specific categories
    const engineeringCategories = recommendations.filter((rec) =>
      ["pipeline", "architecture", "transformation", "governance", "performance", "cleaning"].includes(rec.category),
    )

    console.log(`Found ${engineeringCategories.length} engineering-specific recommendations`)

    return recommendations
  } catch (error) {
    console.error("Error testing Data Engineer features:", error)
    return []
  }
}

// Test function for Data Scientist features
export async function testDataScientistFeatures() {
  const mockAnalysisData = {
    metrics: {
      customerRetention: "85%",
      conversionRate: "3.2%",
      averageOrderValue: "$127",
      customerLifetimeValue: "$890",
    },
    trends: {
      seasonality: "20% increase in Q4",
      customerGrowth: "12% monthly",
    },
    anomalies: {
      unusualChurn: "High churn in segment A",
      conversionDrop: "Conversion dropped 15% last week",
    },
    correlations: {
      priceVsConversion: "Moderate negative correlation",
      seasonVsRevenue: "Strong positive correlation",
    },
  }

  console.log("Testing Data Scientist recommendations...")

  try {
    const recommendations = await generateRecommendations(
      "test-analysis-456",
      mockAnalysisData,
      "retail",
      "basic",
      "data-scientist",
    )

    console.log("Generated recommendations:", recommendations)

    return recommendations
  } catch (error) {
    console.error("Error testing Data Scientist features:", error)
    return []
  }
}
