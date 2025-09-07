// Frontend\src\pages\Barbershops.jsx
import BarbershopSelector from "@/components/BarbershopSelector";
import StylistSelector from "@/components/StylistSelector";
import DateTimePicker from "@/components/DateTimePicker";
import ServiceSelector from "@/components/ServiceSelector";

export default function BookingPage() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Book a haircut</h2>
      <p className="text-gray-600 mb-8">
        Choose a barbershop to see available stylists and book your appointment.
      </p>
      <BarbershopSelector />
      <StylistSelector />
      <DateTimePicker />
      <ServiceSelector />
    </div>
  );
}
