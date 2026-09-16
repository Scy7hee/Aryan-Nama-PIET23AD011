import { useMemo } from "react";
import { useApp } from "../context/AppContext";

function Dashboard() {
  const {
    equipment,
    loans,
    getAvailableQuantity,
    getEquipment,
  } = useApp();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = useMemo(() => {
    const totalUnits = equipment.reduce(
      (total, item) => total + item.totalUnits,
      0
    );

    const borrowedUnits = loans
      .filter((loan) => loan.status === "active")
      .reduce((total, loan) => total + loan.quantity, 0);

    const availableUnits = totalUnits - borrowedUnits;

    const overdueLoans = loans.filter(
      (loan) =>
        loan.status === "active" &&
        new Date(loan.dueDate) < today
    );

    return {
      totalUnits,
      borrowedUnits,
      availableUnits,
      overdueCount: overdueLoans.length,
    };
  }, [equipment, loans]);

  const activeLoans = loans.filter(
    (loan) => loan.status === "active"
  );

  const overdueLoans = activeLoans.filter(
    (loan) => new Date(loan.dueDate) < today
  );

  const upcomingReturns = activeLoans
    .filter((loan) => new Date(loan.dueDate) >= today)
    .sort(
      (a, b) =>
        new Date(a.dueDate) - new Date(b.dueDate)
    )
    .slice(0, 5);

  const getDaysDifference = (date) => {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    return Math.ceil(
      (target - today) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="dashboard">

      {/* Statistics */}

      <div className="stats-grid">

        <div className="stat-card">
          <p className="stat-title">Total Units</p>
          <h2>{stats.totalUnits}</h2>
          <p className="stat-description">
            Across all equipment
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-title">Available</p>
          <h2>{stats.availableUnits}</h2>
          <p className="stat-description">
            Ready to borrow
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-title">Borrowed</p>
          <h2>{stats.borrowedUnits}</h2>
          <p className="stat-description">
            Currently on loan
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-title">Overdue</p>
          <h2 className="danger-number">
            {stats.overdueCount}
          </h2>
          <p className="stat-description">
            Need attention
          </p>
        </div>

      </div>

      {/* Returns */}

      <div className="dashboard-grid">

        <section className="dashboard-card">

          <div className="card-header">
            <h3>Upcoming Returns</h3>
            <p>Equipment that needs to be returned soon.</p>
          </div>

          {upcomingReturns.length === 0 ? (
            <div className="empty-small">
              No upcoming returns.
            </div>
          ) : (
            upcomingReturns.map((loan) => {
              const item = getEquipment(loan.equipmentId);
              const days = getDaysDifference(loan.dueDate);

              return (
                <div className="return-item" key={loan.id}>
                  <div>
                    <strong>{loan.borrower}</strong>
                    <span>
                      {item?.name} × {loan.quantity}
                    </span>
                  </div>

                  <span className="due-soon">
                    {days === 0
                      ? "Due today"
                      : days === 1
                      ? "Tomorrow"
                      : `${days} days`}
                  </span>
                </div>
              );
            })
          )}

        </section>

        {/* Overdue */}

        <section className="dashboard-card">

          <div className="card-header">
            <h3>Overdue Items</h3>
            <p>These items need immediate attention.</p>
          </div>

          {overdueLoans.length === 0 ? (
            <div className="empty-small">
              🎉 No overdue equipment.
            </div>
          ) : (
            overdueLoans.map((loan) => {
              const item = getEquipment(loan.equipmentId);
              const lateDays = Math.abs(
                getDaysDifference(loan.dueDate)
              );

              const estimatedFee =
                lateDays * (item?.lateFeePerDay || 0);

              return (
                <div className="return-item" key={loan.id}>
                  <div>
                    <strong>{loan.borrower}</strong>

                    <span>
                      {item?.name} × {loan.quantity}
                    </span>
                  </div>

                  <div className="overdue-info">
                    <span className="overdue">
                      {lateDays} day
                      {lateDays !== 1 ? "s" : ""} late
                    </span>

                    <small>
                      ₹{estimatedFee} fee
                    </small>
                  </div>
                </div>
              );
            })
          )}

        </section>

      </div>

      {/* Equipment */}

      <section className="dashboard-card">

        <div className="card-header">
          <h3>Equipment Overview</h3>
          <p>Current inventory availability.</p>
        </div>

        <div className="equipment-table">

          <div className="equipment-table-header">
            <span>Equipment</span>
            <span>Total</span>
            <span>Available</span>
            <span>Status</span>
          </div>

          {equipment.map((item) => {
            const available =
              getAvailableQuantity(item.id);

            const percentage =
              (available / item.totalUnits) * 100;

            return (
              <div
                className="equipment-row"
                key={item.id}
              >
                <span className="equipment-name">
                  {item.name}
                </span>

                <span>
                  {item.totalUnits}
                </span>

                <span className="available">
                  {available}
                </span>

                <span>
                  {percentage === 0 ? (
                    <span className="status-unavailable">
                      Fully booked
                    </span>
                  ) : (
                    <span className="status-available">
                      Available
                    </span>
                  )}
                </span>
              </div>
            );
          })}

        </div>

      </section>

    </div>
  );
}

export default Dashboard;