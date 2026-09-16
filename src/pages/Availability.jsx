import { useState } from "react";
import { useApp } from "../context/AppContext";

function Availability() {
  const { equipment, loans } = useApp();

  const [equipmentId, setEquipmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState(null);

  const checkAvailability = () => {
    if (!equipmentId || !startDate || !endDate) {
      setResult({
        type: "error",
        message: "Please select equipment and both dates.",
      });
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setResult({
        type: "error",
        message: "End date must be after start date.",
      });
      return;
    }

    const item = equipment.find(
      (equipmentItem) =>
        equipmentItem.id === Number(equipmentId)
    );

    const overlappingLoans = loans.filter((loan) => {
      if (
        loan.equipmentId !== Number(equipmentId) ||
        loan.status !== "active"
      ) {
        return false;
      }

      const requestedStart = new Date(startDate);
      const requestedEnd = new Date(endDate);
      const loanStart = new Date(loan.borrowDate);
      const loanEnd = new Date(loan.dueDate);

      return loanStart <= requestedEnd && loanEnd >= requestedStart;
    });

    const bookedUnits = overlappingLoans.reduce(
      (total, loan) => total + loan.quantity,
      0
    );

    const available = item.totalUnits - bookedUnits;

    setResult({
      type: available > 0 ? "success" : "error",
      available,
      total: item.totalUnits,
      message:
        available > 0
          ? `${available} unit(s) are available for the selected period.`
          : "No units are available for the selected period.",
    });
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Check Availability</h2>
          <p>Find equipment available for a specific period.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="form-grid">
          <div className="form-group">
            <label>Equipment</label>

            <select
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
            >
              <option value="">Select equipment</option>

              {equipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <button
          className="primary-button"
          onClick={checkAvailability}
        >
          Check Availability
        </button>

        {result && (
          <div className={`availability-result ${result.type}`}>
            <h3>
              {result.available !== undefined
                ? `${result.available} / ${result.total} available`
                : "Availability Check"}
            </h3>

            <p>{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Availability;