"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

type IncomeSource = 'employment_income' | 'self_employment_income' | 'private_pension_income' | 'state_pension';

type GrowthFactors = {
  employment_income_yoy: number | null;
  mixed_income_yoy: number | null;
  non_labour_income_yoy: number | null;
  consumer_price_index_yoy: number | null;
};

type Adult = {
  age: number;
  is_married: boolean;
  income_source: IncomeSource;
  income_amount: number;
};

type Child = {
  age: number;
};

type Household = {
  age: number;
  is_married: boolean;
  income_source: IncomeSource;
  income_amount: number;
  num_children: number;
};

type ForecastResult = {
  income_2025: number;
  income_2030_obr: number;
  income_2030_autumn: number;
  income_2030_custom?: number;
  absolute_change_obr: number;
  percentage_change_obr: number;
  forecast_difference: number;
  forecast_percentage_difference: number;
  absolute_change_custom?: number;
  percentage_change_custom?: number;
};

// Default OBR growth rates (calculated from 2025 to 2030 values)
const AUTUMN_2024_OBR_GROWTH = {
  employment_income_yoy: 2.6,
  mixed_income_yoy: 5.5,
  non_labour_income_yoy: 5.0,
  consumer_price_index_yoy: 2.0
};

// Spring 2025 OBR growth rates - will be updated after the forecast release
// Currently the same as Autumn 2024
const SPRING_2025_OBR_GROWTH = {
  employment_income_yoy: 2.6,
  mixed_income_yoy: 5.5,
  non_labour_income_yoy: 5.0,
  consumer_price_index_yoy: 2.0
};

const HouseholdForm: React.FC = () => {
  const [forecastDetailsOpen, setForecastDetailsOpen] = useState(false);
  const [household, setHousehold] = useState<Household>({
    age: 35,
    is_married: false,
    income_source: 'employment_income',
    income_amount: 30000,
    num_children: 0
  });
  // No longer using custom growth factors
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHousehold = (field: keyof Household, value: any) => {
    setHousehold(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Growth factor updates have been removed

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/calculate', household);
      setResult(response.data);
    } catch (err) {
      setError('Failed to calculate forecast. Please check your inputs and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 font-sans">
      <header className="flex items-center gap-4 mb-8">
        <img src="/blue.svg" alt="Policy Engine Logo" className="h-12 w-auto" />
        <h1 className="text-[#0C1A27] text-xl font-medium">Calculate how the OBR forecast affects me</h1>
      </header>
      <form onSubmit={submitForm} className="space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100" style={{ borderRadius: "12px" }}>
          <h2 className="text-[#0C1A27] text-2xl font-medium mb-6">Household Information</h2>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-[#2C6496] text-white">
                  <label className="block text-base font-medium">
                    Age
                  </label>
                </div>
                <div className="p-4">
                  <input 
                    type="number" 
                    min="16" 
                    max="100"
                    value={household.age} 
                    onChange={(e) => updateHousehold('age', parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:border-[#2C6496] focus:ring focus:ring-[#D8E6F3] focus:ring-opacity-50 transition-all duration-200 text-lg"
                    required
                  />
                </div>
              </div>
              
              {/* Marital Status */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-[#2C6496] text-white">
                  <label className="block text-base font-medium">
                    Marital Status
                  </label>
                </div>
                <div className="p-4">
                  <label className="flex items-center cursor-pointer bg-gray-50 p-3 rounded-md border border-gray-200">
                    <input 
                      type="checkbox" 
                      checked={household.is_married} 
                      onChange={(e) => updateHousehold('is_married', e.target.checked)}
                      className="h-5 w-5 text-[#2C6496] focus:ring-[#2C6496] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-[#0C1A27] text-lg">Married</span>
                  </label>
                </div>
              </div>
              
              {/* Income Source */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-[#2C6496] text-white">
                  <label className="block text-base font-medium">
                    Primary Income Source
                  </label>
                </div>
                <div className="p-4">
                  <select
                    value={household.income_source}
                    onChange={(e) => updateHousehold('income_source', e.target.value as IncomeSource)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white focus:border-[#2C6496] focus:ring focus:ring-[#D8E6F3] focus:ring-opacity-50 transition-all duration-200 text-lg"
                    required
                  >
                    <option value="employment_income">Employment Income</option>
                    <option value="self_employment_income">Self-Employment Income</option>
                    <option value="private_pension_income">Pension Income</option>
                    <option value="state_pension">State Pension</option>
                  </select>
                </div>
              </div>
              
              {/* Income Amount */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-[#2C6496] text-white">
                  <label className="block text-base font-medium">
                    Income Amount (£/year)
                  </label>
                </div>
                <div className="p-4">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-lg text-gray-600">£</span>
                    <input 
                      type="number" 
                      min="0"
                      step="100"
                      value={household.income_amount} 
                      onChange={(e) => updateHousehold('income_amount', parseFloat(e.target.value) || 0)}
                      className="w-full p-3 pl-8 border border-gray-300 rounded-md focus:border-[#2C6496] focus:ring focus:ring-[#D8E6F3] focus:ring-opacity-50 transition-all duration-200 text-lg"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Number of Children */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm md:col-span-2">
                <div className="px-4 py-3 bg-[#2C6496] text-white">
                  <label className="block text-base font-medium">
                    Number of Children
                  </label>
                </div>
                <div className="p-4">
                  <div className="flex items-center">
                    <button 
                      type="button" 
                      onClick={() => updateHousehold('num_children', Math.max(0, household.num_children - 1))}
                      className="px-4 py-2 bg-gray-200 rounded-l-md text-lg font-bold hover:bg-gray-300 transition-colors"
                    >-</button>
                    <input 
                      type="number" 
                      min="0" 
                      max="10"
                      value={household.num_children} 
                      onChange={(e) => updateHousehold('num_children', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border-t border-b border-gray-300 text-center text-lg"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => updateHousehold('num_children', Math.min(10, household.num_children + 1))}
                      className="px-4 py-2 bg-gray-200 rounded-r-md text-lg font-bold hover:bg-gray-300 transition-colors"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* OBR forecast information */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <button 
                onClick={() => setForecastDetailsOpen(!forecastDetailsOpen)}
                className="w-full px-4 py-3 bg-[#2C6496] text-white flex justify-between items-center focus:outline-none transition-colors hover:bg-[#235381]"
              >
                <h3 className="text-lg font-medium">OBR Forecast Comparison</h3>
                <span className="transform transition-transform duration-200 ease-in-out">
                  {forecastDetailsOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </button>
              
              <AnimatePresence>
                {forecastDetailsOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="bg-[#D8E6F3] rounded-lg p-4 mb-6">
                        <p className="text-[#0C1A27] mb-0">
                          This calculator compares income projections using OBR economic forecasts
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col">
                              <h4 className="text-base font-medium text-[#0C1A27]">Autumn 2024 Forecast</h4>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Employment Income:</span>
                                  <span className="text-sm font-medium">{AUTUMN_2024_OBR_GROWTH.employment_income_yoy}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Mixed Income:</span>
                                  <span className="text-sm font-medium">{AUTUMN_2024_OBR_GROWTH.mixed_income_yoy}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Non-Labour Income:</span>
                                  <span className="text-sm font-medium">{AUTUMN_2024_OBR_GROWTH.non_labour_income_yoy}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Consumer Price Index:</span>
                                  <span className="text-sm font-medium">{AUTUMN_2024_OBR_GROWTH.consumer_price_index_yoy}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col">
                              <h4 className="text-base font-medium text-[#0C1A27]">Spring 2025 Forecast</h4>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Employment Income:</span>
                                  <span className="text-sm font-medium">{SPRING_2025_OBR_GROWTH.employment_income_yoy}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Mixed Income:</span>
                                  <span className="text-sm font-medium">{SPRING_2025_OBR_GROWTH.mixed_income_yoy}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Non-Labour Income:</span>
                                  <span className="text-sm font-medium">{SPRING_2025_OBR_GROWTH.non_labour_income_yoy}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">Consumer Price Index:</span>
                                  <span className="text-sm font-medium">{SPRING_2025_OBR_GROWTH.consumer_price_index_yoy}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-[#F0F5FB] rounded-lg p-4 text-sm">
                          <p className="text-[#2C6496] font-medium">Note:</p>
                          <p className="text-gray-700">The Spring 2025 forecast values will be updated after the forecast release.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <motion.button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#2C6496] text-white py-4 px-6 rounded-md font-medium text-lg hover:bg-[#17354F] shadow-md transition-colors duration-200 ease-in-out disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#2C6496] focus:ring-opacity-50"
            whileHover={{ y: -4 }}
            whileTap={{ y: 0 }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </span>
            ) : (
              'Calculate how the OBR forecast affects me'
            )}
          </motion.button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-[#FFE8D1] border border-[#FF9D42] rounded-md text-[#0C1A27]">
          {error}
        </div>
      )}

      {result && (
        <motion.div 
          className="mt-12" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100" style={{ borderRadius: "12px" }}>
            <h2 className="text-2xl font-medium mb-6 text-[#0C1A27]">Your Income Forecast Results</h2>
            
            {/* Main Results Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2025 Income */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-[#2C6496] text-white">
                  <h3 className="text-lg font-medium">Current Net Income</h3>
                  <p className="text-xs text-gray-100">2025</p>
                </div>
                <div className="p-6 flex items-center justify-center">
                  <p className="text-3xl font-bold text-[#0C1A27]">{formatCurrency(result.income_2025)}</p>
                </div>
              </div>
              
              {/* OBR Forecast 2030 */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm relative">
                <div className="absolute top-0 right-0 mt-2 mr-2 bg-[#D8E6F3] text-[#0C1A27] text-xs px-2 py-1 rounded-full font-medium">
                  Spring 2025
                </div>
                <div className="px-4 py-3 bg-[#2C6496] text-white">
                  <h3 className="text-lg font-medium">Forecast Net Income</h3>
                  <p className="text-xs text-gray-100">2030 (Spring 2025 forecast)</p>
                </div>
                <div className="p-6 flex flex-col items-center justify-center space-y-2">
                  <p className="text-3xl font-bold text-[#0C1A27]">{formatCurrency(result.income_2030_obr)}</p>
                  <div className="flex items-center space-x-1">
                    <span className={`text-sm font-medium ${result.percentage_change_obr >= 0 ? 'text-[#2C6496]' : 'text-[#FF9D42]'}`}>
                      {result.percentage_change_obr >= 0 ? '+' : ''}{result.percentage_change_obr.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 text-sm">from 2025</span>
                  </div>
                </div>
              </div>
              
              {/* Autumn 2024 Forecast 2030 */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm relative">
                <div className="absolute top-0 right-0 mt-2 mr-2 bg-[#D8E6F3] text-[#0C1A27] text-xs px-2 py-1 rounded-full font-medium">
                  Autumn 2024
                </div>
                <div className="px-4 py-3 bg-[#39C6C0] text-white">
                  <h3 className="text-lg font-medium">Forecast Net Income</h3>
                  <p className="text-xs text-gray-100">2030 (Autumn 2024 forecast)</p>
                </div>
                <div className="p-6 flex flex-col items-center justify-center space-y-2">
                  <p className="text-3xl font-bold text-[#0C1A27]">{formatCurrency(result.income_2030_autumn)}</p>
                  <div className="flex items-center space-x-1">
                    <span className={`text-sm font-medium ${(result.income_2030_autumn - result.income_2025) >= 0 ? 'text-[#2C6496]' : 'text-[#FF9D42]'}`}>
                      {(result.income_2030_autumn - result.income_2025) >= 0 ? '+' : ''}{((result.income_2030_autumn - result.income_2025) / result.income_2025 * 100).toFixed(1)}%
                    </span>
                    <span className="text-gray-500 text-sm">from 2025</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Forecast Comparison */}
            <div className="mt-8 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-[#8A5CF7] text-white">
                <h3 className="text-lg font-medium">Comparison: Spring 2025 vs Autumn 2024 Forecast</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#39C6C0] flex items-center justify-center text-white font-bold">
                      A24
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Autumn 2024 Forecast</p>
                      <p className="text-xl font-semibold text-[#0C1A27]">{formatCurrency(result.income_2030_autumn)}</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:block w-20 h-0.5 bg-gray-200"></div>
                  
                  <div className="flex flex-row md:flex-col items-center gap-1 md:gap-0">
                    <div className={`text-lg font-bold ${result.forecast_difference >= 0 ? 'text-[#2C6496]' : 'text-[#FF9D42]'}`}>
                      {result.forecast_difference >= 0 ? '+' : ''}
                      {formatCurrency(result.forecast_difference)}
                    </div>
                    <div className={`text-sm font-medium ${result.forecast_difference >= 0 ? 'text-[#2C6496]' : 'text-[#FF9D42]'}`}>
                      ({result.forecast_percentage_difference >= 0 ? '+' : ''}{result.forecast_percentage_difference.toFixed(1)}%)
                    </div>
                  </div>
                  
                  <div className="hidden md:block w-20 h-0.5 bg-gray-200"></div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2C6496] flex items-center justify-center text-white font-bold">
                      S25
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Spring 2025 Forecast</p>
                      <p className="text-xl font-semibold text-[#0C1A27]">{formatCurrency(result.income_2030_obr)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 mt-4 flex flex-col">
                  <div className="text-[#0C1A27] text-sm font-medium">What this means:</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on the Spring 2025 OBR forecast, your 2030 net income would be {result.forecast_difference >= 0 ? 'higher' : 'lower'} than the Autumn 2024 forecast 
                    by {formatCurrency(Math.abs(result.forecast_difference))} 
                    ({Math.abs(result.forecast_percentage_difference).toFixed(1)}%).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* CSS Animation */}
    </div>
  );
};

export default HouseholdForm;