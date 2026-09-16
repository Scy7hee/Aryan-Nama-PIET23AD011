import { useState } from "react";
import { useApp } from "../context/AppContext";

function Equipment() {
  const {
    equipment,
    getAvailableQuantity,
  } = useApp();

  const [search, setSearch] = useState("");

  const filteredEquipment = equipment.filter((item) =>
    item.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>

      <div className="page-heading">
        <div>
          <h2>Equipment</h2>
          <p>
            View current inventory and availability.
          </p>
        </div>

        <input
          className="search-input"
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="equipment-grid">

        {filteredEquipment.map((item) => {
          const available =
            getAvailableQuantity(item.id);

          const isAvailable = available > 0;

          return (
            <div
              className="equipment-card"
              key={item.id}
            >

              <div className="equipment-card-top">

                <div className="equipment-icon">
                  {item.name.charAt(0)}
                </div>

                <span
                  className={
                    isAvailable
                      ? "equipment-status"
                      : "equipment-status unavailable"
                  }
                >
                  {isAvailable
                    ? "Available"
                    : "Fully Booked"}
                </span>

              </div>

              <h3>{item.name}</h3>

              <div className="equipment-details">
                <span>Total Units</span>
                <strong>
                  {item.totalUnits}
                </strong>
              </div>

              <div className="equipment-details">
                <span>Available</span>
                <strong className="available">
                  {available}
                </strong>
              </div>

              <div className="equipment-details">
                <span>Late Fee / Day</span>
                <strong>
                  ₹{item.lateFeePerDay}
                </strong>
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Equipment;