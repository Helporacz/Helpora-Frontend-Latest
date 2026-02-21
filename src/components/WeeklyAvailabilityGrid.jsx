import React from "react";
import "./WeeklyAvailabilityGrid.css";

const WeeklyAvailabilityGrid = ({ defaultAvailability }) => {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Fixed grid times
  const hours = [
    "07–08", "08–09", "09–10", "10–11", "11–12",
    "12–13", "13–14", "14–15", "15–16", "16–17",
    "17–18", "18–19", "19–20", "20–21", "21–22", "after 22"
  ];

  const workingDays = defaultAvailability?.workingDays || [];
  const start = parseInt(defaultAvailability?.startTime?.split(":")[0], 10);
  const end = parseInt(defaultAvailability?.endTime?.split(":")[0], 10);

  const isAvailable = (dayIndex, hourIndex) => {
    if (!workingDays.includes(dayIndex)) return false;
    const hour = 7 + hourIndex; // 07 = index 0
    return hour >= start && hour < end;
  };

  return (
    <div className="availability-container">
      <table className="availability-table">
        <thead>
          <tr>
            <th></th>
            {days.map((d, i) => (
              <th key={i}>{d}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {hours.map((label, hourIndex) => (
            <tr key={hourIndex}>
              <td className="hour-label">{label}</td>

              {days.map((_, dayIndex) => {
                const available = isAvailable(dayIndex, hourIndex);

                return (
                  <td
                    key={dayIndex}
                    className={`cell ${available ? "available" : "unavailable"}`}
                  ></td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="legend">
        <div><span className="dot available"></span> Available</div>
        <div><span className="dot unavailable"></span> Unavailable</div>
      </div>
    </div>
  );
};

export default WeeklyAvailabilityGrid;
