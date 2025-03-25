from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pydantic import BaseModel
from typing import List, Optional, Dict
from policyengine_uk import Simulation, Microsimulation
from policyengine_core.data import Dataset

microdata = Microsimulation(dataset="hf://policyengine/policyengine-uk-data/enhanced_frs_2022_23.h5").calculate_dataframe([
    "age", 
    "employment_income",
    "relation_type",
    "benunit_count_children",
    "employment_income",
    "self_employment_income",
    "private_pension_income",
    "state_pension",
    "dividend_income",
    "savings_interest_income",
    "property_income",
    "person_id",
    "benunit_id",
    "household_id",
    "state_id",
    "person_state_id",
    "person_benunit_id",
    "person_household_id",
    "household_weight",
    "adult_index",
    "child_index",
])

# Autumn 2024 OBR Forecast
AUTUMN_24_OBR_FORECAST = {
    "gov.obr.employment_income": {
        "year:2025:1": 1215.6,
        "year:2026:1": 1246.5,
        "year:2027:1": 1277.7,
        "year:2028:1": 1312.9,
        "year:2029:1": 1352.9,
        "year:2030:1": 1380.36,
        "year:2031:1": 1407.82,
        "year:2032:1": 1435.28,
        "year:2033:1": 1462.74,
        "year:2034:1": 1490.2,
    },
    "gov.obr.mixed_income": {
        "year:2025:1": 177.6,
        "year:2026:1": 196.7,
        "year:2027:1": 205.3,
        "year:2028:1": 214.6,
        "year:2029:1": 225.0,
        "year:2030:1": 232.34,
        "year:2031:1": 239.68,
        "year:2032:1": 247.02,
        "year:2033:1": 254.36,
        "year:2034:1": 261.7,
    },
    "gov.obr.non_labour_income": {
        "year:2025:1": 460.8,
        "year:2026:1": 512.7,
        "year:2027:1": 535.0,
        "year:2028:1": 554.0,
        "year:2029:1": 571.8,
        "year:2030:1": 588.38,
        "year:2031:1": 604.96,
        "year:2032:1": 621.54,
        "year:2033:1": 638.12,
        "year:2034:1": 654.7,
    },
    "gov.obr.consumer_price_index": {
        "year:2025:1": 138.1,
        "year:2026:1": 141.1,
        "year:2027:1": 144.1,
        "year:2028:1": 147.1,
        "year:2029:1": 150.1,
        "year:2030:1": 152.5,
        "year:2031:1": 154.9,
        "year:2032:1": 157.3,
        "year:2033:1": 159.7,
        "year:2034:1": 162.1,
    },
}

# Spring 2025 OBR Forecast - Default to Autumn 2024 values, update these when the new forecast is released
SPRING_25_OBR_FORECAST = {
    "gov.obr.employment_income": {
        "year:2025:1": 1215.6,
        "year:2026:1": 1246.5,
        "year:2027:1": 1277.7,
        "year:2028:1": 1312.9,
        "year:2029:1": 1352.9,
        "year:2030:1": 1380.36,
        "year:2031:1": 1407.82,
        "year:2032:1": 1435.28,
        "year:2033:1": 1462.74,
        "year:2034:1": 1490.2,
    },
    "gov.obr.mixed_income": {
        "year:2025:1": 177.6,
        "year:2026:1": 196.7,
        "year:2027:1": 205.3,
        "year:2028:1": 214.6,
        "year:2029:1": 225.0,
        "year:2030:1": 232.34,
        "year:2031:1": 239.68,
        "year:2032:1": 247.02,
        "year:2033:1": 254.36,
        "year:2034:1": 261.7,
    },
    "gov.obr.non_labour_income": {
        "year:2025:1": 460.8,
        "year:2026:1": 512.7,
        "year:2027:1": 535.0,
        "year:2028:1": 554.0,
        "year:2029:1": 571.8,
        "year:2030:1": 588.38,
        "year:2031:1": 604.96,
        "year:2032:1": 621.54,
        "year:2033:1": 638.12,
        "year:2034:1": 654.7,
    },
    "gov.obr.consumer_price_index": {
        "year:2025:1": 138.1,
        "year:2026:1": 141.1,
        "year:2027:1": 144.1,
        "year:2028:1": 147.1,
        "year:2029:1": 150.1,
        "year:2030:1": 152.5,
        "year:2031:1": 154.9,
        "year:2032:1": 157.3,
        "year:2033:1": 159.7,
        "year:2034:1": 162.1,
    },
}

app = FastAPI(title="OBR Forecast Household Calculator")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
static_files_dir = os.environ.get("STATIC_FILES_DIR", "../frontend/out")
if os.path.exists(static_files_dir):
    app.mount("/", StaticFiles(directory=static_files_dir, html=True), name="static")

# Data models
class GrowthFactors(BaseModel):
    employment_income_yoy: Optional[float] = None
    mixed_income_yoy: Optional[float] = None
    non_labour_income_yoy: Optional[float] = None
    consumer_price_index_yoy: Optional[float] = None

class Household(BaseModel):
    age: int
    is_married: bool
    income_source: str
    income_amount: float
    num_children: int
    custom_growth_factors: Optional[GrowthFactors] = None

class ForecastResult(BaseModel):
    income_2025: float
    income_2030_obr: float
    income_2030_autumn: float
    income_2030_custom: Optional[float] = None
    absolute_change_obr: float
    percentage_change_obr: float
    forecast_difference: float
    forecast_percentage_difference: float
    absolute_change_custom: Optional[float] = None
    percentage_change_custom: Optional[float] = None

# Simple calculation functions
def get_simulation_input(household: Household) -> dict:
    # Simplified calculation - in reality would be more complex
    microdata_subset = microdata[
        (microdata["age"] // 10 == household.age // 10) &
        (microdata["relation_type"] == ("COUPLE" if household.is_married else "SINGLE")) &
        (microdata["benunit_count_children"] == household.num_children)
    ]

    income_sources = [
        "employment_income",
        "self_employment_income",
        "private_pension_income",
        "state_pension",
        "savings_interest_income",
        "dividend_income",
        "property_income",
    ]

    microdata_subset = microdata_subset[(microdata_subset[household.income_source] - household.income_amount).abs() < 15e3]
    random_household_id = microdata_subset.household_id.sample(weights=microdata_subset.household_weight).values[0]
    random_household = microdata[microdata["household_id"] == random_household_id]

    main_adult = random_household[random_household["adult_index"] == 1]
    
    situation = {
        "people": {
            "you": {
                "age": {2025: household.age},
            },
        },
    }
    for variable in income_sources:
        situation["people"]["you"][variable] = {2025: float(main_adult[variable].values[0])}
    situation["people"]["you"][household.income_source] = {
        2025: household.income_amount,
    }

    if household.is_married:
        spouse = {}
        for variable in income_sources:
            spouse[variable] = {2025: float(random_household[random_household["adult_index"] == 2][variable].values[0])}
        situation["people"]["your partner"] = spouse
    
    for i in range(household.num_children):
        child = random_household[random_household["child_index"] == i + 1]
        situation["people"][f"child {i + 1}"] = {
            "age": {2025: int(child["age"].values[0])},
        }
        for variable in income_sources:
            situation["people"][f"child {i + 1}"][variable] = {2025: float(child[variable].values[0])}

    return situation

def calculate_household(situation: dict, reform: dict = {}, year: int = 2030) -> float:
    simulation = Simulation(
        situation=situation,
        reform=reform,
    )
    result = simulation.calculate("household_net_income", year)[0]

    return result

def create_custom_growth_factors(custom_factors: GrowthFactors) -> dict:
    # Create a copy of the original OBR forecast
    custom_forecast = {key: value.copy() for key, value in AUTUMN_24_OBR_FORECAST.items()}
    
    # Get the base values for 2025
    base_values = {
        "gov.obr.employment_income": AUTUMN_24_OBR_FORECAST["gov.obr.employment_income"]["year:2025:1"],
        "gov.obr.mixed_income": AUTUMN_24_OBR_FORECAST["gov.obr.mixed_income"]["year:2025:1"],
        "gov.obr.non_labour_income": AUTUMN_24_OBR_FORECAST["gov.obr.non_labour_income"]["year:2025:1"],
        "gov.obr.consumer_price_index": AUTUMN_24_OBR_FORECAST["gov.obr.consumer_price_index"]["year:2025:1"],
    }
    
    # Apply custom YoY growth rates if provided
    if custom_factors.employment_income_yoy is not None:
        current = base_values["gov.obr.employment_income"]
        for year in range(2026, 2035):
            current *= (1 + custom_factors.employment_income_yoy / 100)
            custom_forecast["gov.obr.employment_income"][f"year:{year}:1"] = current
    
    if custom_factors.mixed_income_yoy is not None:
        current = base_values["gov.obr.mixed_income"]
        for year in range(2026, 2035):
            current *= (1 + custom_factors.mixed_income_yoy / 100)
            custom_forecast["gov.obr.mixed_income"][f"year:{year}:1"] = current
    
    if custom_factors.non_labour_income_yoy is not None:
        current = base_values["gov.obr.non_labour_income"]
        for year in range(2026, 2035):
            current *= (1 + custom_factors.non_labour_income_yoy / 100)
            custom_forecast["gov.obr.non_labour_income"][f"year:{year}:1"] = current
    
    if custom_factors.consumer_price_index_yoy is not None:
        current = base_values["gov.obr.consumer_price_index"]
        for year in range(2026, 2035):
            current *= (1 + custom_factors.consumer_price_index_yoy / 100)
            custom_forecast["gov.obr.consumer_price_index"][f"year:{year}:1"] = current
    
    return custom_forecast

@app.get("/")
def read_root():
    return {"message": "OBR Forecast Household Calculator API"}

@app.post("/calculate", response_model=ForecastResult)
def calculate_forecast(household: Household):
    if household.age < 16:
        raise HTTPException(status_code=400, detail="Age must be at least 16")
    
    # Get the situation for simulation
    situation = get_simulation_input(household)
    
    # Calculate income for 2025
    income_2025 = float(calculate_household(situation, reform=AUTUMN_24_OBR_FORECAST, year=2025))
    
    # Calculate income for 2030 using Autumn 2024 OBR forecast
    income_2030_autumn = float(calculate_household(situation, reform=AUTUMN_24_OBR_FORECAST, year=2030))
    
    # Calculate income for 2030 using Spring 2025 OBR forecast
    income_2030_spring = float(calculate_household(situation, reform=SPRING_25_OBR_FORECAST, year=2030))
    
    # Calculate changes for OBR forecast
    absolute_change_obr = income_2030_spring - income_2025
    percentage_change_obr = (absolute_change_obr / income_2025 * 100) if income_2025 > 0 else 0
    
    # Calculate difference between forecasts
    forecast_difference = income_2030_spring - income_2030_autumn
    forecast_percentage_difference = (forecast_difference / income_2030_autumn * 100) if income_2030_autumn > 0 else 0
    
    result = ForecastResult(
        income_2025=round(income_2025, 2),
        income_2030_obr=round(income_2030_spring, 2),
        income_2030_autumn=round(income_2030_autumn, 2),
        absolute_change_obr=round(absolute_change_obr, 2),
        percentage_change_obr=round(percentage_change_obr, 2),
        forecast_difference=round(forecast_difference, 2),
        forecast_percentage_difference=round(forecast_percentage_difference, 2)
    )
    
    # If custom growth factors are provided, calculate using those too
    if household.custom_growth_factors:
        custom_forecast = create_custom_growth_factors(household.custom_growth_factors)
        income_2030_custom = float(calculate_household(situation, reform=custom_forecast, year=2030))
        
        absolute_change_custom = income_2030_custom - income_2025
        percentage_change_custom = (absolute_change_custom / income_2025 * 100) if income_2025 > 0 else 0
        
        result.income_2030_custom = round(income_2030_custom, 2)
        result.absolute_change_custom = round(absolute_change_custom, 2)
        result.percentage_change_custom = round(percentage_change_custom, 2)
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)