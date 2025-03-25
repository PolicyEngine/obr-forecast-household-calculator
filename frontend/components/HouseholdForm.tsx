"use client";

import React, { useState } from 'react';
import axios from 'axios';

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
  custom_growth_factors?: GrowthFactors;
};

type ForecastResult = {
  income_2025: number;
  income_2030_obr: number;
  income_2030_custom?: number;
  absolute_change_obr: number;
  percentage_change_obr: number;
  absolute_change_custom?: number;
  percentage_change_custom?: number;
};

// Default OBR growth rates (calculated from 2025 to 2030 values)
const DEFAULT_OBR_GROWTH = {
  employment_income_yoy: 2.6,
  mixed_income_yoy: 5.5,
  non_labour_income_yoy: 5.0,
  consumer_price_index_yoy: 2.0
};

const HouseholdForm: React.FC = () => {
  const [household, setHousehold] = useState<Household>({
    age: 35,
    is_married: false,
    income_source: 'employment_income',
    income_amount: 30000,
    num_children: 0,
    custom_growth_factors: {
      employment_income_yoy: DEFAULT_OBR_GROWTH.employment_income_yoy,
      mixed_income_yoy: DEFAULT_OBR_GROWTH.mixed_income_yoy,
      non_labour_income_yoy: DEFAULT_OBR_GROWTH.non_labour_income_yoy,
      consumer_price_index_yoy: DEFAULT_OBR_GROWTH.consumer_price_index_yoy
    }
  });
  // Always use custom growth factors with default OBR values
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHousehold = (field: keyof Household, value: any) => {
    setHousehold(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const updateGrowthFactor = (field: keyof GrowthFactors, value: number | null) => {
    setHousehold(prev => ({
      ...prev,
      custom_growth_factors: {
        ...prev.custom_growth_factors!,
        [field]: value
      }
    }));
  };

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
      <h1 className="text-[#0C1A27] text-3xl font-medium mb-8">OBR Forecast Household Calculator</h1>
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
            
            {/* Growth Factors */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-[#2C6496] text-white">
                <h3 className="text-lg font-medium">Growth Factors (2025-2030)</h3>
              </div>
              <div className="p-6">
                <div className="bg-[#D8E6F3] rounded-lg p-4 mb-6">
                  <p className="text-[#0C1A27] mb-0">
                    Adjust annual percentage growth (%) for each factor from 2025 to 2030
                  </p>
                </div>
                
                <div className="space-y-8">
                
                {/* Employment Income Growth */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
                    <div>
                      <label className="text-base font-medium text-[#0C1A27]">
                        Employment Income
                      </label>
                      <div className="text-sm text-gray-500">Annual growth rate</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-[#2C6496]">
                        {household.custom_growth_factors?.employment_income_yoy?.toFixed(1)}%
                      </span>
                      <div className="px-2 py-1 bg-[#D8E6F3] rounded text-xs font-medium text-[#0C1A27]">
                        OBR: {DEFAULT_OBR_GROWTH.employment_income_yoy}%
                      </div>
                      <button 
                        type="button" 
                        className="p-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-[#0C1A27] transition-colors duration-200"
                        onClick={() => updateGrowthFactor('employment_income_yoy', DEFAULT_OBR_GROWTH.employment_income_yoy)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#0C1A27] inline-block py-1 px-2 rounded bg-gray-100">-2%</span>
                        <span className="text-xs font-medium text-[#0C1A27] inline-block py-1 px-2 rounded bg-gray-100">10%</span>
                      </div>
                      <input 
                        type="range" 
                        min="-2"
                        max="10"
                        step="0.1"
                        value={household.custom_growth_factors?.employment_income_yoy ?? DEFAULT_OBR_GROWTH.employment_income_yoy}
                        onChange={(e) => updateGrowthFactor('employment_income_yoy', parseFloat(e.target.value))}
                        className="w-full h-3 mt-1 bg-[#D8E6F3] rounded-lg appearance-none cursor-pointer accent-[#2C6496]"
                      />
                      <div className="w-full h-2 mt-2 flex justify-between items-center">
                        {[-2, 0, 2, 4, 6, 8, 10].map(value => (
                          <div key={value} className="h-1 w-px bg-gray-300"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mixed Income Growth */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
                    <div>
                      <label className="text-base font-medium text-[#0C1A27]">
                        Mixed Income
                      </label>
                      <div className="text-sm text-gray-500">Annual growth rate</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-[#2C6496]">
                        {household.custom_growth_factors?.mixed_income_yoy?.toFixed(1)}%
                      </span>
                      <div className="px-2 py-1 bg-[#D8E6F3] rounded text-xs font-medium text-[#0C1A27]">
                        OBR: {DEFAULT_OBR_GROWTH.mixed_income_yoy}%
                      </div>
                      <button 
                        type="button" 
                        className="p-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-[#0C1A27] transition-colors duration-200"
                        onClick={() => updateGrowthFactor('mixed_income_yoy', DEFAULT_OBR_GROWTH.mixed_income_yoy)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#0C1A27] inline-block py-1 px-2 rounded bg-gray-100">-2%</span>
                        <span className="text-xs font-medium text-[#0C1A27] inline-block py-1 px-2 rounded bg-gray-100">10%</span>
                      </div>
                      <input 
                        type="range" 
                        min="-2"
                        max="10"
                        step="0.1"
                        value={household.custom_growth_factors?.mixed_income_yoy ?? DEFAULT_OBR_GROWTH.mixed_income_yoy}
                        onChange={(e) => updateGrowthFactor('mixed_income_yoy', parseFloat(e.target.value))}
                        className="w-full h-3 mt-1 bg-[#D8E6F3] rounded-lg appearance-none cursor-pointer accent-[#2C6496]"
                      />
                      <div className="w-full h-2 mt-2 flex justify-between items-center">
                        {[-2, 0, 2, 4, 6, 8, 10].map(value => (
                          <div key={value} className="h-1 w-px bg-gray-300"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Non-Labour Income Growth */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
                    <div>
                      <label className="text-base font-medium text-[#0C1A27]">
                        Non-Labour Income
                      </label>
                      <div className="text-sm text-gray-500">Annual growth rate</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-[#2C6496]">
                        {household.custom_growth_factors?.non_labour_income_yoy?.toFixed(1)}%
                      </span>
                      <div className="px-2 py-1 bg-[#D8E6F3] rounded text-xs font-medium text-[#0C1A27]">
                        OBR: {DEFAULT_OBR_GROWTH.non_labour_income_yoy}%
                      </div>
                      <button 
                        type="button" 
                        className="p-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-[#0C1A27] transition-colors duration-200"
                        onClick={() => updateGrowthFactor('non_labour_income_yoy', DEFAULT_OBR_GROWTH.non_labour_income_yoy)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#0C1A27] inline-block py-1 px-2 rounded bg-gray-100">-2%</span>
                        <span className="text-xs font-medium text-[#0C1A27] inline-block py-1 px-2 rounded bg-gray-100">10%</span>
                      </div>
                      <input 
                        type="range" 
                        min="-2"
                        max="10"
                        step="0.1"
                        value={household.custom_growth_factors?.non_labour_income_yoy ?? DEFAULT_OBR_GROWTH.non_labour_income_yoy}
                        onChange={(e) => updateGrowthFactor('non_labour_income_yoy', parseFloat(e.target.value))}
                        className="w-full h-3 mt-1 bg-[#D8E6F3] rounded-lg appearance-none cursor-pointer accent-[#2C6496]"
                      />
                      <div className="w-full h-2 mt-2 flex justify-between items-center">
                        {[-2, 0, 2, 4, 6, 8, 10].map(value => (
                          <div key={value} className="h-1 w-px bg-gray-300"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Consumer Price Index Growth */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
                    <div>
                      <label className="text-base font-medium text-[#0C1A27]">
                        Consumer Price Index
                      </label>
                      <div className="text-sm text-gray-500">Annual growth rate</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-[#2C6496]">
                        {household.custom_growth_factors?.consumer_price_index_yoy?.toFixed(1)}%
                      </span>
                      <div className="px-2 py-1 bg-[#D8E6F3] rounded text-xs font-medium text-[#0C1A27]">
                        OBR: {DEFAULT_OBR_GROWTH.consumer_price_index_yoy}%
                      </div>
                      <button 
                        type="button" 
                        className="p-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-[#0C1A27] transition-colors duration-200"
                        onClick={() => updateGrowthFactor('consumer_price_index_yoy', DEFAULT_OBR_GROWTH.consumer_price_index_yoy)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#0C1A27] inline-block py-1 px-2 rounded bg-gray-100">-2%</span>
                        <span className="text-xs font-medium text-[#0C1A27] inline-block py-1 px-2 rounded bg-gray-100">10%</span>
                      </div>
                      <input 
                        type="range" 
                        min="-2"
                        max="10"
                        step="0.1"
                        value={household.custom_growth_factors?.consumer_price_index_yoy ?? DEFAULT_OBR_GROWTH.consumer_price_index_yoy}
                        onChange={(e) => updateGrowthFactor('consumer_price_index_yoy', parseFloat(e.target.value))}
                        className="w-full h-3 mt-1 bg-[#D8E6F3] rounded-lg appearance-none cursor-pointer accent-[#2C6496]"
                      />
                      <div className="w-full h-2 mt-2 flex justify-between items-center">
                        {[-2, 0, 2, 4, 6, 8, 10].map(value => (
                          <div key={value} className="h-1 w-px bg-gray-300"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#2C6496] text-white py-4 px-6 rounded-md font-medium text-lg hover:bg-[#17354F] transform hover:translate-y-[-2px] shadow-md transition-all duration-200 ease-in-out disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#2C6496] focus:ring-opacity-50"
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
              'Calculate Income Forecast'
            )}
          </button>
        </div>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-[#FFE8D1] border border-[#FF9D42] rounded-md text-[#0C1A27]">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-12 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
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
                  OBR Forecast
                </div>
                <div className="px-4 py-3 bg-[#2C6496] text-white">
                  <h3 className="text-lg font-medium">Forecast Net Income</h3>
                  <p className="text-xs text-gray-100">2030</p>
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
              
              {/* Custom Forecast 2030 */}
              {result.income_2030_custom && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm relative">
                  <div className="absolute top-0 right-0 mt-2 mr-2 bg-[#D8E6F3] text-[#0C1A27] text-xs px-2 py-1 rounded-full font-medium">
                    Custom Forecast
                  </div>
                  <div className="px-4 py-3 bg-[#39C6C0] text-white">
                    <h3 className="text-lg font-medium">Forecast Net Income</h3>
                    <p className="text-xs text-gray-100">2030 with your adjustments</p>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center space-y-2">
                    <p className="text-3xl font-bold text-[#0C1A27]">{formatCurrency(result.income_2030_custom)}</p>
                    <div className="flex items-center space-x-1">
                      <span className={`text-sm font-medium ${result.percentage_change_custom! >= 0 ? 'text-[#2C6496]' : 'text-[#FF9D42]'}`}>
                        {result.percentage_change_custom! >= 0 ? '+' : ''}{result.percentage_change_custom!.toFixed(1)}%
                      </span>
                      <span className="text-gray-500 text-sm">from 2025</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Detailed Comparison */}
            {result.income_2030_custom && (
              <div className="mt-8 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-[#8A5CF7] text-white">
                  <h3 className="text-lg font-medium">Comparison: Your Forecast vs OBR Forecast</h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2C6496] flex items-center justify-center text-white font-bold">
                        OBR
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">OBR Forecast (2030)</p>
                        <p className="text-xl font-semibold text-[#0C1A27]">{formatCurrency(result.income_2030_obr)}</p>
                      </div>
                    </div>
                    
                    <div className="hidden md:block w-20 h-0.5 bg-gray-200"></div>
                    
                    <div className="flex flex-row md:flex-col items-center gap-1 md:gap-0">
                      <div className={`text-lg font-bold ${(result.income_2030_custom - result.income_2030_obr) >= 0 ? 'text-[#2C6496]' : 'text-[#FF9D42]'}`}>
                        {(result.income_2030_custom - result.income_2030_obr) >= 0 ? '+' : ''}
                        {formatCurrency(result.income_2030_custom - result.income_2030_obr)}
                      </div>
                      <div className={`text-sm font-medium ${(result.income_2030_custom - result.income_2030_obr) >= 0 ? 'text-[#2C6496]' : 'text-[#FF9D42]'}`}>
                        ({((result.income_2030_custom - result.income_2030_obr) / result.income_2030_obr * 100).toFixed(1)}%)
                      </div>
                    </div>
                    
                    <div className="hidden md:block w-20 h-0.5 bg-gray-200"></div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#39C6C0] flex items-center justify-center text-white font-bold">
                        YOU
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Your Forecast (2030)</p>
                        <p className="text-xl font-semibold text-[#0C1A27]">{formatCurrency(result.income_2030_custom)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 mt-4 flex flex-col">
                    <div className="text-[#0C1A27] text-sm font-medium">What this means:</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Based on your custom growth factors, your 2030 net income would be {(result.income_2030_custom - result.income_2030_obr) >= 0 ? 'higher' : 'lower'} than the OBR forecast 
                      by {formatCurrency(Math.abs(result.income_2030_custom - result.income_2030_obr))} 
                      ({Math.abs(((result.income_2030_custom - result.income_2030_obr) / result.income_2030_obr * 100)).toFixed(1)}%).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* CSS Animation */}
    </div>
  );
};

export default HouseholdForm;