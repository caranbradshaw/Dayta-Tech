"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, BarChart3, Check, FileText, FileUp, Lightbulb, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function DemoWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const totalSteps = 5

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)

      // Reset upload progress when moving to step 1
      if (currentStep === 0) {
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCloseDemo = () => {
    setCurrentStep(0)
    setIsUploading(false)
    setUploadProgress(0)
    document.getElementById("demo-dialog")?.close()
  }

  const handleUpload = () => {
    setIsUploading(true)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          handleNextStep()
        }, 500)
      }
    }, 300)
  }

  return (
    <dialog id="demo-dialog" className="modal w-full max-w-4xl rounded-lg shadow-lg p-0 backdrop:bg-black/50">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">DaytaTech Demo</span>
          </div>
          <button onClick={handleCloseDemo} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 pt-4">
          <div className="flex justify-between mb-2 text-sm text-gray-500">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span>{getStepTitle(currentStep)}</span>
          </div>
          <Progress value={(currentStep / (totalSteps - 1)) * 100} className="h-1" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Upload */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Upload Your Data File</h2>
              <p className="text-gray-600">
                DaytaTech accepts data from all major reporting tools. Simply upload your file and our AI will do the
                rest.
              </p>

              <div className="border-2 border-dashed rounded-lg p-6 my-8">
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileUp className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Q2_Sales_Report.csv</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2 w-full" />
                    <p className="text-sm text-gray-500">Uploading and analyzing... {uploadProgress}%</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="mb-4 rounded-full bg-purple-100 p-3">
                      <Upload className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">Upload your data file</h3>
                    <p className="mb-4 text-sm text-gray-500 max-w-md">
                      Drag and drop your file here, or click to browse. We support CSV, Excel, Power BI exports, Tableau
                      exports, and more.
                    </p>
                    <Button onClick={handleUpload}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Sample File
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 p-1">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-purple-800">Pro Tip</h3>
                    <p className="text-sm text-gray-600">
                      DaytaTech automatically detects the structure of your data, but you can also specify your industry
                      for more relevant insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Analysis in Progress */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">AI Analysis in Progress</h2>
              <p className="text-gray-600">
                Our AI is analyzing your data, identifying patterns, trends, and insights relevant to your industry.
              </p>

              <div className="border rounded-lg p-6 my-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-green-100 p-1">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Data Parsing Complete</h3>
                      <p className="text-sm text-gray-500">Your file has been successfully parsed and validated.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-green-100 p-1">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Structure Analysis Complete</h3>
                      <p className="text-sm text-gray-500">
                        We've identified the structure and relationships in your data.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="animate-pulse rounded-full bg-purple-100 p-1">
                      <div className="h-5 w-5 text-purple-600 rounded-full border-2 border-purple-600 border-t-transparent animate-spin"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">Generating Insights</h3>
                      <p className="text-sm text-gray-500">Identifying patterns, trends, and anomalies in your data.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 opacity-50">
                    <div className="rounded-full bg-gray-100 p-1">
                      <div className="h-5 w-5"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">Creating Executive Summary</h3>
                      <p className="text-sm text-gray-500">Preparing a concise summary of key findings.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 opacity-50">
                    <div className="rounded-full bg-gray-100 p-1">
                      <div className="h-5 w-5"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">Generating Recommendations</h3>
                      <p className="text-sm text-gray-500">Creating actionable recommendations based on your data.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-1">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">How It Works</h3>
                    <p className="text-sm text-gray-600">
                      DaytaTech uses advanced AI models trained on industry-specific data to identify patterns that
                      matter to your business. The more you use DaytaTech, the more it learns about your specific needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Executive Summary */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Executive Summary</h2>
              <p className="text-gray-600">
                DaytaTech provides a concise summary of the key insights from your data, highlighting what matters most.
              </p>

              <div className="border rounded-lg p-6 my-8">
                <div className="space-y-4">
                  <div className="rounded-lg bg-purple-50 p-4">
                    <h3 className="mb-2 font-semibold text-purple-800">Key Findings</h3>
                    <p className="text-gray-700">
                      This dataset shows a 24% increase in revenue for Q2 compared to Q1, with the highest growth in the
                      Northeast region (32%). Customer acquisition costs have decreased by 12% over the last 3 months,
                      while customer retention has improved by 8%.
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <h3 className="mb-2 font-semibold text-blue-800">Industry Context</h3>
                    <p className="text-gray-700">
                      Compared to industry benchmarks for SaaS companies of similar size, your revenue growth is above
                      average (industry average: 18%). Your customer acquisition cost is 15% lower than the industry
                      average.
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4">
                    <h3 className="mb-2 font-semibold text-green-800">Opportunities</h3>
                    <p className="text-gray-700">
                      Based on the data patterns, there's significant opportunity to expand in the Southwest region,
                      where your market penetration is lowest but growth potential is high.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 p-1">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-800">Why This Matters</h3>
                    <p className="text-sm text-gray-600">
                      The executive summary gives you the most important takeaways at a glance, saving you hours of
                      analysis time. It's perfect for sharing with stakeholders who need the big picture without all the
                      details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Detailed Insights */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Detailed Insights</h2>
              <p className="text-gray-600">
                Dive deeper into your data with visual insights, anomalies, and correlations.
              </p>

              <div className="border rounded-lg p-6 my-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <h3 className="text-base font-medium">Regional Performance</h3>
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-xl font-bold">Northeast +32%</div>
                    <p className="text-xs text-gray-500">Highest performing region</p>
                    <div className="mt-4 h-[120px] bg-purple-50 rounded-lg"></div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <h3 className="text-base font-medium">Anomalies Detected</h3>
                      <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="space-y-2 mt-2">
                      <div className="rounded-md bg-amber-50 p-2">
                        <div className="font-medium text-amber-800 text-sm">Southwest Region</div>
                        <div className="text-xs text-gray-600">
                          Marketing spend increased by 30% but revenue growth is only 12%.
                        </div>
                      </div>
                      <div className="rounded-md bg-green-50 p-2">
                        <div className="font-medium text-green-800 text-sm">Northeast Region</div>
                        <div className="text-xs text-gray-600">
                          Customer retention is 10% higher than company average.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-green-100 p-1">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-800">Insight Discovery</h3>
                    <p className="text-sm text-gray-600">
                      DaytaTech automatically identifies anomalies, correlations, and patterns that might otherwise go
                      unnoticed. You can click on any insight to explore it further.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Recommendations */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Actionable Recommendations</h2>
              <p className="text-gray-600">
                DaytaTech doesn't just analyze your data—it tells you what to do next with clear, actionable
                recommendations.
              </p>

              <div className="border rounded-lg p-6 my-8">
                <div className="space-y-4">
                  <div className="rounded-lg bg-purple-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-purple-100 p-1">
                        <Lightbulb className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-purple-800">AI-Generated Recommendations</h3>
                        <p className="text-sm text-gray-600">
                          These recommendations are based on patterns in your data, industry benchmarks, and historical
                          performance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg border p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">Increase content marketing in Southwest region</h3>
                          <p className="text-sm text-gray-500">
                            Based on the strong correlation between content marketing and customer retention, allocate
                            25% more budget to content in the Southwest region.
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Impact:</span>
                          <span className="font-medium text-green-600">High</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Effort:</span>
                          <span className="font-medium text-amber-600">Medium</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">Replicate Northeast customer acquisition strategy</h3>
                          <p className="text-sm text-gray-500">
                            The Northeast region has 15% lower customer acquisition costs. Document and implement their
                            approach across other regions.
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Impact:</span>
                          <span className="font-medium text-green-600">High</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Effort:</span>
                          <span className="font-medium text-amber-600">Medium</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-1">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800">Ready to Get Started?</h3>
                    <p className="text-sm text-gray-600">
                      DaytaTech makes data analysis simple and actionable. Sign up for free and start getting insights
                      from your data today.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with navigation buttons */}
        <div className="flex items-center justify-between border-t p-4">
          <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button onClick={handleNextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCloseDemo}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </dialog>
  )
}

function getStepTitle(step: number): string {
  switch (step) {
    case 0:
      return "Upload"
    case 1:
      return "Analysis"
    case 2:
      return "Summary"
    case 3:
      return "Insights"
    case 4:
      return "Recommendations"
    default:
      return ""
  }
}
