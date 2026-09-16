import { useState } from "react";
import { useApp } from "../context/AppContext";

function Borrow() {
  const {
    equipment,
    getAvailableQuantity,
    borrowEquipment,
    getBorrowerActiveItems,
  } = useApp();

  const [form, setForm] = useState({
    borrower: "",
    equipmentId: "",
    quantity: 1,
    borrowDate: "",
    dueDate: "",
    deposit: "",
  });

  const [message, setMessage] = useState(null);

  const selectedEquipment = equipment.find(
    (item) => item.id === Number(form.equipmentId)
  );

  const available = selectedEquipment
    ? getAvailableQuantity(selectedEquipment.id)
    : 0;

  const activeBorrowed = form.borrower
    ? getBorrowerActiveItems(form.borrower)
    : 0;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.borrower.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a borrower name.",
      });
      return;
    }

    if (!form.equipmentId) {
      setMessage({
        type: "error",
        text: "Please select equipment.",
      });
      return;
    }

    if (Number(form.quantity) < 1) {
      setMessage({
        type: "error",
        text: "Quantity must be at least 1.",
      });
      return;
    }

    if (Number(form.quantity) > available) {
      setMessage({
        type: "error",
        text: `Only ${available} unit(s) are available.`,
      });
      return;
    }

    if (!form.borrowDate || !form.dueDate) {
      setMessage({
        type: "error",
        text: "Please select both dates.",
      });
      return;
    }

    if (new Date(form.dueDate) <= new Date(form.borrowDate)) {
      setMessage({
        type: "error",
        text: "Return date must be after the borrowing date.",
      });
      return;
    }

    if (activeBorrowed + Number(form.quantity) > 5) {
      setMessage({
        type: "error",
        text: `Borrowing limit exceeded. ${5 - activeBorrowed} unit(s) remaining for this borrower.`,
      });
      return;
    }

    if (Number(form.deposit) < 0) {
      setMessage({
        type: "error",
        text: "Deposit cannot be negative.",
      });
      return;
    }

    const result = borrowEquipment(form);

    if (result.success) {
      setMessage({
        type: "success",
        text: "✓ Equipment successfully issued.",
      });

      setForm({
        borrower: "",
        equipmentId: "",
        quantity: 1,
        borrowDate: "",
        dueDate: "",
        deposit: "",
      });
    } else {
      setMessage({
        type: "error",
        text: result.message,
      });
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>New Borrowing</h2>
          <p>
            Issue equipment to a student, faculty member, or club.
          </p>
        </div>
      </div>

      <div className="form-card">

        <div className="form-section-title">
          Borrower Information
        </div>

        <div className="form-grid">

          <div className="form-group">
            <label>Borrower Name *</label>

            <input
              name="borrower"
              value={form.borrower}
              onChange={handleChange}
              placeholder="Student or club name"
            />

            {form.borrower && (
              <small className="field-hint">
                {activeBorrowed} active unit(s) currently borrowed
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Equipment *</label>

            <select
              name="equipmentId"
              value={form.equipmentId}
              onChange={handleChange}
            >
              <option value="">
                Select equipment
              </option>

              {equipment.map((item) => {
                const availableUnits =
                  getAvailableQuantity(item.id);

                return (
                  <option
                    key={item.id}
                    value={item.id}
                    disabled={availableUnits === 0}
                  >
                    {item.name} — {availableUnits} available
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity *</label>

            <input
              type="number"
              min="1"
              max={available || 1}
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
            />

            <small className="field-hint">
              Maximum 5 active units per borrower
            </small>
          </div>

          <div className="form-group">
            <label>Security Deposit (₹)</label>

            <input
              type="number"
              min="0"
              name="deposit"
              value={form.deposit}
              onChange={handleChange}
              placeholder="e.g. 1000"
            />
          </div>

          <div className="form-group">
            <label>Borrow Date *</label>

            <input
              type="date"
              name="borrowDate"
              value={form.borrowDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Expected Return Date *</label>

            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>

        </div>

        {selectedEquipment && (
          <div className="availability-preview">

            <div>
              <strong>
                {selectedEquipment.name}
              </strong>

              <span>
                ₹{selectedEquipment.lateFeePerDay}/day late fee
              </span>
            </div>

            <strong>
              {available} available
            </strong>

          </div>
        )}

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-footer">
          <button
            className="primary-button"
            type="button"
            onClick={handleSubmit}
          >
            Confirm Borrowing
          </button>
        </div>

      </div>
    </div>
  );
}

export default Borrow;