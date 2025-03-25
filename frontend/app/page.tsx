import HouseholdForm from '@/components/HouseholdForm';

export default function Home() {
  return (
    <main className="min-h-screen py-8 bg-gray-100">
      <div className="container mx-auto px-4">
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