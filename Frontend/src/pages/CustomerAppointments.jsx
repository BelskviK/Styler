import React, { useState, useEffect } from "react";

const CustomerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching appointments data
  useEffect(() => {
    // In a real application, this would be an API call
    const fetchAppointments = () => {
      const mockAppointments = [
        {
          id: 1,
          service: "Classic Bob",
          date: "July 20, 2024, 2:00 PM",
          specialist: "Haircut with Sarah",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB03UnRt5RZgG4AZ1jjUDvN0DZO_fPMJWum2jT_X6sMQ2-tDO3qUWbJcbt69g9Evyzw4VNtED9oY-UZ4BFEHSj0qJD7FhYcArLypi3z3wYSo2TcPQvOQHqAXewRyFKfIhNvRRciJCNmKXM5EbMUfZY8OiOx79yOo-C6cXPbUfBmzAIuYw8uZRxzUGZd-hgx3ufREAGVhfM7JIJy0MaxXLLych303FGnczS5JoBnDbrmrOEoXciVKdd1_2fqn73SNe7UKBoPL7AaoFY",
          status: "upcoming",
          action: "Reschedule",
        },
        {
          id: 2,
          service: "Balayage",
          date: "August 5, 2024, 10:00 AM",
          specialist: "Coloring with Emily",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB7QDRTekUcVZ3sQEcrapS538I81GyzmAGcofSb_b2I3qbJa7-ZdvkduEoqNCckvnZfLvdvcappDHzZvxkq49F0d6ibNCdfMEyxWaxWyvshKzVqsAEr4Z9_XcNnd43TkObNx9_jqT3Eg8SqRFDcEc7HXztNOk8wYYZkAWawXkVO-xAzfchQbQ1CSp9VIXDQAAFE4DVt3IWRvpJkE4CkkzqQIQOYE-hYrs7yGaFS4HqAmoKTPo4tWHP9R01zgeVRWyaDYnNSUS2jCHs",
          status: "upcoming",
          action: "Cancel",
        },
        {
          id: 3,
          service: "Long Layers",
          date: "June 15, 2024, 3:00 PM",
          specialist: "Haircut with Sarah",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCrRuMDbaogPvbG4Gt6T85aUSWcVtzhKFXILge37XnEB4xFnhm_gqtOZDvTr0dCSZ6M7qqp4RUxjoMWiCFhn50hLi0PaEZ62DDJN4cnAJjlxRqOcuUWn7dv4yTCV14eRFbBQAIx-YBLXggxfoJPyoP_1cCg-zmAPyrDGAUCGe8f1r8Xg_HsqPbzVZJmOYFE5s2F_Id6yPOkeVkN-8jL-T5lKuhydV9GzRex9IMHrYXxxUO-jNffu__JuBSklbQHmSbyVpGtM_h9VfE",
          status: "past",
          action: "View Details",
        },
        {
          id: 4,
          service: "Updo",
          date: "May 22, 2024, 11:00 AM",
          specialist: "Styling with Emily",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBy33jW65L8Nx1kWwuF8kwpzmh4SYIhpk7qZKhiMA0j0aID8DfNDlZ4VbNgP6DWDxwuPDMWrWLU8sqTJaErBnWFPNsr4fYR79fGOihEKu-nfc4PswiqZtifFffeaJk_owc9kEFEiYpxFGqPTRkR-vNvjIo2_W76tBgxcBgQHE1lo6eu9PipkC-GkrPEs6ulary7eB8hK8l9WYqprTG1tWDzxZAtO5sSsRMMrPVfhRsuWQd5PiyibWQi9dwh7S8mjkukoYHT_6dZRUA",
          status: "past",
          action: "Leave a Review",
        },
      ];

      setAppointments(mockAppointments);
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  const handleAction = (appointmentId, actionType) => {
    // In a real application, this would trigger the appropriate action
    console.log(`Action: ${actionType} for appointment ${appointmentId}`);

    // Example: Open a modal, navigate to a different page, etc.
    alert(`${actionType} action for appointment ${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex justify-center items-center h-64">
            <p className="text-[#49739c] text-lg">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    (app) => app.status === "upcoming"
  );
  const pastAppointments = appointments.filter((app) => app.status === "past");

  return (
    <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">
            Your Appointments
          </p>
        </div>

        {/* Upcoming Appointments Section */}
        <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Upcoming Appointments
        </h3>

        {upcomingAppointments.length === 0 ? (
          <div className="bg-slate-50 px-4 py-6 rounded-lg text-center">
            <p className="text-[#49739c]">
              You don't have any upcoming appointments
            </p>
          </div>
        ) : (
          upcomingAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex gap-4 bg-slate-50 px-4 py-3 justify-between mb-3 rounded-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[70px]"
                  style={{ backgroundImage: `url("${appointment.image}")` }}
                ></div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-[#0d141c] text-base font-medium leading-normal">
                    {appointment.service}
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    {appointment.date}
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    {appointment.specialist}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <button
                  onClick={() =>
                    handleAction(appointment.id, appointment.action)
                  }
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-fit hover:bg-[#d0d9e5] transition-colors"
                >
                  <span className="truncate">{appointment.action}</span>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Past Appointments Section */}
        <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Past Appointments
        </h3>

        {pastAppointments.length === 0 ? (
          <div className="bg-slate-50 px-4 py-6 rounded-lg text-center">
            <p className="text-[#49739c]">
              You don't have any past appointments
            </p>
          </div>
        ) : (
          pastAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex gap-4 bg-slate-50 px-4 py-3 justify-between mb-3 rounded-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[70px]"
                  style={{ backgroundImage: `url("${appointment.image}")` }}
                ></div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-[#0d141c] text-base font-medium leading-normal">
                    {appointment.service}
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    {appointment.date}
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    {appointment.specialist}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <button
                  onClick={() =>
                    handleAction(appointment.id, appointment.action)
                  }
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-fit hover:bg-[#d0d9e5] transition-colors"
                >
                  <span className="truncate">{appointment.action}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerAppointments;
