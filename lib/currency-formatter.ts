export type Currency = "NGN" | "USD"
export type Region = "nigeria" | "america" | "global"

export interface CurrencyConfig {
  code: Currency
  symbol: string
  locale: string
  exchangeRate: number // Rate to USD
}

export const currencyConfigs: Record<Region, CurrencyConfig> = {
  nigeria: {
    code: "NGN",
    symbol: "₦",
    locale: "en-NG",
    exchangeRate: 1500, // 1 USD = 1,500 NGN (updated rate)
  },
  america: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    exchangeRate: 1,
  },
  global: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    exchangeRate: 1,
  },
}

export function formatCurrency(
  amount: number,
  region: Region = "global",
  options: {
    showSymbol?: boolean
    showCode?: boolean
    compact?: boolean
  } = {},
): string {
  const { showSymbol = true, showCode = false, compact = false } = options
  const config = currencyConfigs[region]

  // Format with proper locale
  const formatter = new Intl.NumberFormat(config.locale, {
    style: showSymbol ? "currency" : "decimal",
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  })

  let formatted = formatter.format(amount)

  // Add currency code if requested
  if (showCode && !showSymbol) {
    formatted = `${formatted} ${config.code}`
  }

  return formatted
}

export function convertCurrency(amount: number, fromRegion: Region, toRegion: Region): number {
  const fromRate = currencyConfigs[fromRegion].exchangeRate
  const toRate = currencyConfigs[toRegion].exchangeRate

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate
  return usdAmount * toRate
}

export function getPricingForRegion(region: Region) {
  const baseUSDPricing = {
    basic: { monthly: 39, annual: 390 },
    pro: { monthly: 99, annual: 990 },
    team: { monthly: 499, annual: 4990 },
    enterprise: { monthly: 0, annual: 0 },
  }

  const config = currencyConfigs[region]

  if (region === "america" || region === "global") {
    return {
      currency: config.code,
      symbol: config.symbol,
      ...baseUSDPricing,
    }
  }

  // Convert USD pricing to local currency
  return {
    currency: config.code,
    symbol: config.symbol,
    basic: {
      monthly: Math.round(baseUSDPricing.basic.monthly * config.exchangeRate),
      annual: Math.round(baseUSDPricing.basic.annual * config.exchangeRate),
    },
    pro: {
      monthly: Math.round(baseUSDPricing.pro.monthly * config.exchangeRate),
      annual: Math.round(baseUSDPricing.pro.annual * config.exchangeRate),
    },
    team: {
      monthly: Math.round(baseUSDPricing.team.monthly * config.exchangeRate),
      annual: Math.round(baseUSDPricing.team.annual * config.exchangeRate),
    },
    enterprise: {
      monthly: 0,
      annual: 0,
    },
  }
}

export function formatPricingDisplay(
  plan: "basic" | "pro" | "team" | "enterprise",
  billing: "monthly" | "annual",
  region: Region = "global",
): {
  amount: string
  period: string
  savings?: string
} {
  const pricing = getPricingForRegion(region)
  const config = currencyConfigs[region]

  if (plan === "enterprise") {
    return {
      amount: "Custom",
      period: "Contact Sales",
    }
  }

  const monthlyAmount = pricing[plan].monthly
  const annualAmount = pricing[plan].annual

  if (billing === "monthly") {
    return {
      amount: formatCurrency(monthlyAmount, region),
      period: "per month",
    }
  }

  // Annual billing
  const monthlyEquivalent = annualAmount / 12
  const savings = ((monthlyAmount - monthlyEquivalent) / monthlyAmount) * 100

  return {
    amount: formatCurrency(monthlyEquivalent, region),
    period: "per month (billed annually)",
    savings: `Save ${Math.round(savings)}%`,
  }
}

// Nigerian-specific formatting helpers
export function formatNaira(amount: number, compact = false): string {
  return formatCurrency(amount, "nigeria", { compact })
}

export function formatUSD(amount: number, compact = false): string {
  return formatCurrency(amount, "america", { compact })
}

// Exchange rate helpers
export function usdToNaira(usdAmount: number): number {
  return convertCurrency(usdAmount, "america", "nigeria")
}

export function nairaToUSD(nairaAmount: number): number {
  return convertCurrency(nairaAmount, "nigeria", "america")
}

// Pricing comparison helpers
export function getPricingComparison(region: Region) {
  const pricing = getPricingForRegion(region)
  const config = currencyConfigs[region]

  return {
    region,
    currency: config.code,
    symbol: config.symbol,
    plans: [
      {
        name: "Basic",
        monthly: formatCurrency(pricing.basic.monthly, region),
        annual: formatCurrency(pricing.basic.annual, region),
        monthlyRaw: pricing.basic.monthly,
        annualRaw: pricing.basic.annual,
      },
      {
        name: "Pro",
        monthly: formatCurrency(pricing.pro.monthly, region),
        annual: formatCurrency(pricing.pro.annual, region),
        monthlyRaw: pricing.pro.monthly,
        annualRaw: pricing.pro.annual,
        popular: true,
      },
      {
        name: "Team",
        monthly: formatCurrency(pricing.team.monthly, region),
        annual: formatCurrency(pricing.team.annual, region),
        monthlyRaw: pricing.team.monthly,
        annualRaw: pricing.team.annual,
      },
      {
        name: "Enterprise",
        monthly: "Custom",
        annual: "Custom",
        monthlyRaw: 0,
        annualRaw: 0,
      },
    ],
  }
}
