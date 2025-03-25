import HouseholdForm from '@/components/HouseholdForm';

export default function Home() {
  return (
    <main className="min-h-screen py-8 bg-gray-100">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">
            OBR Forecast Household Calculator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Answer a few questions about your household and see how the latest OBR forecasts
            might affect your net income by 2030.
          </p>
        </header>
        
        <HouseholdForm />
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>This is a simplified calculator for demonstration purposes.</p>
          <p className="mt-1">
            Data based on OBR forecasts. Actual results may vary based on future policy changes.
          </p>
        </footer>
      </div>
    </main>
  );
}