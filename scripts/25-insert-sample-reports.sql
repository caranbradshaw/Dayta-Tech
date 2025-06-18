-- Insert sample reports for demonstration
-- This helps new users see what reports look like

-- First, let's create a sample user profile if it doesn't exist
INSERT INTO profiles (
    id,
    email,
    full_name,
    company,
    industry,
    role,
    company_size,
    region,
    trial_status,
    trial_start_date,
    trial_end_date,
    email_verified,
    created_at,
    updated_at
) VALUES (
    'b047443a-4f7c-4c9d-9397-a2117131a215',
    'demo@daytatech.ai',
    'Demo User',
    'DaytaTech Demo',
    'technology',
    'business_analyst',
    '11-50',
    'global',
    'active',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    true,
    NOW() - INTERVAL '5 days',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();

-- Create sample analysis record
INSERT INTO analyses (
    id,
    user_id,
    file_name,
    file_type,
    file_size,
    status,
    summary,
    insights,
    recommendations,
    analysis_role,
    industry,
    processing_started_at,
    processing_completed_at,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b047443a-4f7c-4c9d-9397-a2117131a215',
    'sample_sales_data.csv',
    'text/csv',
    245760,
    'completed',
    'Comprehensive analysis of sales performance data reveals strong growth trends with opportunities for regional expansion. The dataset shows 94% data quality with excellent completeness across all key metrics.',
    '{
        "ai_insights": [
            {
                "type": "trend",
                "title": "Revenue Growth Acceleration",
                "content": "Sales revenue shows consistent 23% month-over-month growth with Q4 showing exceptional performance.",
                "confidence_score": 0.94
            },
            {
                "type": "opportunity",
                "title": "Regional Market Expansion",
                "content": "Western region shows 45% higher conversion rates, indicating strong expansion potential.",
                "confidence_score": 0.89
            },
            {
                "type": "risk",
                "title": "Customer Concentration Risk",
                "content": "Top 3 customers represent 67% of revenue, suggesting need for diversification.",
                "confidence_score": 0.91
            }
        ],
        "data_quality": 94,
        "processing_time_ms": 3420,
        "ai_provider": "openai",
        "analysis_type": "standard"
    }',
    '{
        "recommendations": [
            {
                "title": "Expand Western Region Operations",
                "description": "Increase sales team and marketing spend in western region to capitalize on high conversion rates.",
                "impact": "High",
                "effort": "Medium",
                "category": "growth"
            },
            {
                "title": "Diversify Customer Base",
                "description": "Implement customer acquisition strategy to reduce dependency on top 3 customers.",
                "impact": "High",
                "effort": "High",
                "category": "risk_management"
            },
            {
                "title": "Optimize Pricing Strategy",
                "description": "Analyze pricing elasticity to maximize revenue per customer.",
                "impact": "Medium",
                "effort": "Medium",
                "category": "optimization"
            }
        ],
        "generated_by": "openai",
        "generated_at": "2024-01-15T10:30:00Z"
    }',
    'business_analyst',
    'technology',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 55 minutes',
    '{
        "industry": "technology",
        "role": "business_analyst",
        "plan_type": "pro",
        "file_size": 245760,
        "file_type": "text/csv",
        "processing_time_ms": 3420
    }',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 55 minutes'
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();

-- Insert sample reports
INSERT INTO reports (
    id,
    user_id,
    analysis_id,
    title,
    description,
    report_type,
    content,
    summary,
    insights,
    recommendations,
    file_name,
    analysis_role,
    industry,
    status,
    created_at,
    updated_at
) VALUES 
(
    'r1a2b3c4-d5e6-f789-0abc-def123456789',
    'b047443a-4f7c-4c9d-9397-a2117131a215',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'BUSINESS ANALYST Analysis: sample_sales_data.csv',
    'AI-powered sales performance analysis revealing growth opportunities and risk factors',
    'analysis_report',
    '{
        "summary": "Comprehensive analysis of sales performance data reveals strong growth trends with opportunities for regional expansion. The dataset shows 94% data quality with excellent completeness across all key metrics.",
        "insights": [
            {
                "type": "trend",
                "title": "Revenue Growth Acceleration",
                "content": "Sales revenue shows consistent 23% month-over-month growth with Q4 showing exceptional performance.",
                "confidence_score": 0.94
            },
            {
                "type": "opportunity", 
                "title": "Regional Market Expansion",
                "content": "Western region shows 45% higher conversion rates, indicating strong expansion potential.",
                "confidence_score": 0.89
            }
        ],
        "recommendations": [
            {
                "title": "Expand Western Region Operations",
                "description": "Increase sales team and marketing spend in western region to capitalize on high conversion rates.",
                "impact": "High",
                "effort": "Medium",
                "category": "growth"
            }
        ],
        "data_quality": 94,
        "processing_time": 3420,
        "ai_provider": "openai"
    }',
    'Comprehensive analysis of sales performance data reveals strong growth trends with opportunities for regional expansion. The dataset shows 94% data quality with excellent completeness across all key metrics.',
    '[
        {
            "type": "trend",
            "title": "Revenue Growth Acceleration", 
            "content": "Sales revenue shows consistent 23% month-over-month growth with Q4 showing exceptional performance.",
            "confidence_score": 0.94
        },
        {
            "type": "opportunity",
            "title": "Regional Market Expansion",
            "content": "Western region shows 45% higher conversion rates, indicating strong expansion potential.", 
            "confidence_score": 0.89
        },
        {
            "type": "risk",
            "title": "Customer Concentration Risk",
            "content": "Top 3 customers represent 67% of revenue, suggesting need for diversification.",
            "confidence_score": 0.91
        }
    ]',
    '[
        {
            "title": "Expand Western Region Operations",
            "description": "Increase sales team and marketing spend in western region to capitalize on high conversion rates.",
            "impact": "High", 
            "effort": "Medium",
            "category": "growth"
        },
        {
            "title": "Diversify Customer Base",
            "description": "Implement customer acquisition strategy to reduce dependency on top 3 customers.",
            "impact": "High",
            "effort": "High", 
            "category": "risk_management"
        },
        {
            "title": "Optimize Pricing Strategy",
            "description": "Analyze pricing elasticity to maximize revenue per customer.",
            "impact": "Medium",
            "effort": "Medium",
            "category": "optimization"
        }
    ]',
    'sample_sales_data.csv',
    'business_analyst',
    'technology',
    'generated',
    NOW() - INTERVAL '1 hour 50 minutes',
    NOW() - INTERVAL '1 hour 50 minutes'
),
(
    'r2b3c4d5-e6f7-8901-bcde-f234567890ab',
    'b047443a-4f7c-4c9d-9397-a2117131a215',
    NULL,
    'Monthly Performance Dashboard',
    'Executive summary of key business metrics and performance indicators',
    'dashboard_report',
    '{
        "summary": "Monthly business performance shows positive trends across all key metrics with revenue up 18% and customer satisfaction at 92%.",
        "kpis": [
            {"metric": "Revenue", "value": "$2.4M", "change": "+18%", "trend": "up"},
            {"metric": "New Customers", "value": "1,247", "change": "+12%", "trend": "up"},
            {"metric": "Customer Satisfaction", "value": "92%", "change": "+3%", "trend": "up"},
            {"metric": "Churn Rate", "value": "2.1%", "change": "-0.5%", "trend": "down"}
        ]
    }',
    'Monthly business performance shows positive trends across all key metrics with revenue up 18% and customer satisfaction at 92%.',
    '[
        {
            "type": "performance",
            "title": "Strong Revenue Growth",
            "content": "Revenue increased 18% month-over-month driven by new customer acquisition and expansion.",
            "confidence_score": 0.96
        },
        {
            "type": "customer",
            "title": "Improved Customer Retention", 
            "content": "Churn rate decreased to 2.1%, indicating improved customer satisfaction and product-market fit.",
            "confidence_score": 0.93
        }
    ]',
    '[
        {
            "title": "Scale Customer Success Team",
            "description": "Hire additional customer success managers to maintain low churn rates as we scale.",
            "impact": "High",
            "effort": "Medium", 
            "category": "scaling"
        }
    ]',
    'monthly_metrics.json',
    'executive',
    'technology',
    'generated',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();

-- Insert file upload record for the sample
INSERT INTO file_uploads (
    id,
    user_id,
    analysis_id,
    file_name,
    file_size,
    file_type,
    upload_status,
    upload_started_at,
    upload_completed_at,
    created_at,
    updated_at
) VALUES (
    'f1a2b3c4-d5e6-f789-0abc-def123456789',
    'b047443a-4f7c-4c9d-9397-a2117131a215',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'sample_sales_data.csv',
    245760,
    'text/csv',
    'completed',
    NOW() - INTERVAL '2 hours 5 minutes',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours 5 minutes',
    NOW() - INTERVAL '2 hours'
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();

COMMENT ON TABLE reports IS 'Sample reports inserted for demonstration purposes';
