// Frontend\src\pages\Barbershops.jsx
import BarbershopSelector from "@/components/BarbershopSelector";
import StylistSelector from "@/components/StylistSelector";
import DateTimePicker from "@/components/DateTimePicker";
import ServiceSelector from "@/components/ServiceSelector";

export default function BookingPage() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <BarbershopSelector />
      <StylistSelector />
      <DateTimePicker />
      <ServiceSelector />
    </div>
  );
}
