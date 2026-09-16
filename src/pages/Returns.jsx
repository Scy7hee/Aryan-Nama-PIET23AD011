import { useState } from "react";
import { useApp } from "../context/AppContext";

function Returns() {
  const {
    loans,
    getEquipment,
    returnEquipment,
    transferLoan,
  } = useApp();

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [returnDate, setReturnDate] = useState("");
  const [result, setResult] = useState(null);

  const [transferLoanData, setTransferLoanData] = useState(null);
  const [newBorrower, setNewBorrower] = useState("");

  const activeLoans = loans.filter(
    (loan) => loan.status === "active"
  );

  const getPreview = () => {
    if (!selectedLoan || !returnDate) {
      return null;
    }

    const item = getEquipment(selectedLoan.equipmentId);

    if (!item) {
      return null;
    }

    const due = new Date(selectedLoan.dueDate);
    const returned = new Date(returnDate);

    const days = Math.ceil(
      (returned - due) /
        (1000 * 60 * 60 * 24)
    );

    const lateDays = Math.max(0, days);

    const lateFee =
      lateDays * item.lateFeePerDay;

    const refund = Math.max(
      0,
      Number(selectedLoan.deposit) - lateFee
    );

    return {
      lateDays,
      lateFee,
      refund,
    };
  };

  const preview = getPreview();

  // RETURN
  const handleReturn = () => {
    if (!selectedLoan) {
      return;
    }

    if (!returnDate) {
      setResult({
        type: "error",
        text: "Please select the return date.",
      });
      return;
    }

    const response = returnEquipment(
      selectedLoan.id,
      returnDate
    );

    if (response.success) {
      setResult({
        type: "success",
        text: `Return completed. ₹${response.refund} refunded to ${selectedLoan.borrower}.`,
      });

      setSelectedLoan(null);
      setReturnDate("");
    } else {
      setResult({
        type: "error",
        text: response.message,
      });
    }
  };

  // TRANSFER
  const handleTransfer = () => {
    if (!transferLoanData) {
      return;
    }

    const borrower = newBorrower.trim();

    if (!borrower) {
      setResult({
        type: "error",
        text: "Please enter the new borrower's name.",
      });
      return;
    }

    const response = transferLoan(
      transferLoanData.id,
      borrower
    );

    if (response.success) {
      setResult({
        type: "success",
        text: `✓ Loan successfully transferred to ${borrower}.`,
      });

      setTransferLoanData(null);
      setNewBorrower("");
    } else {
      setResult({
        type: "error",
        text: response.message,
      });
    }
  };

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="page-heading">
        <div>
          <h2>Returns</h2>
          <p>
            Process returns, late fees, deposits and loan transfers.
          </p>
        </div>
      </div>

      {/* RESULT MESSAGE */}

      {result && (
        <div className={`message ${result.type}`}>
          {result.text}
        </div>
      )}

      {/* ACTIVE LOANS */}

      {activeLoans.length === 0 ? (
        <div className="empty-state">
          <h3>No active loans</h3>
          <p>
            All equipment has been returned.
          </p>
        </div>
      ) : (
        <div className="loan-list">
          {activeLoans.map((loan) => {
            const item = getEquipment(
              loan.equipmentId
            );

            if (!item) {
              return null;
            }

            const isOverdue =
              new Date(loan.dueDate) <
              new Date();

            return (
              <div
                className="loan-card"
                key={loan.id}
              >
                <div>
                  <div className="loan-title">
                    <h3>{item.name}</h3>

                    {isOverdue && (
                      <span className="overdue-badge">
                        Overdue
                      </span>
                    )}
                  </div>

                  <p>
                    Borrower:
                    <strong>
                      {" "}
                      {loan.borrower}
                    </strong>
                  </p>

                  <p>
                    Quantity: {loan.quantity}
                  </p>

                  <p>
                    Due: {loan.dueDate}
                  </p>

                  <p>
                    Deposit: ₹{loan.deposit}
                  </p>
                </div>

                <div className="loan-actions">
                  {/* TRANSFER */}

                  <button
                    className="secondary-button"
                    onClick={() => {
                      setTransferLoanData(loan);
                      setSelectedLoan(null);
                      setResult(null);
                      setNewBorrower("");
                    }}
                  >
                    Transfer
                  </button>

                  {/* RETURN */}

                  <button
                    className="primary-button"
                    onClick={() => {
                      setSelectedLoan(loan);
                      setTransferLoanData(null);
                      setResult(null);
                      setReturnDate("");
                    }}
                  >
                    Process Return
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= RETURN MODAL ================= */}

      {selectedLoan && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Process Return</h2>

            <div className="return-summary">
              <strong>
                {getEquipment(
                  selectedLoan.equipmentId
                )?.name}
              </strong>

              <span>
                Borrower:{" "}
                {selectedLoan.borrower}
              </span>

              <span>
                Quantity:{" "}
                {selectedLoan.quantity}
              </span>
            </div>

            <div className="form-group">
              <label>
                Actual Return Date
              </label>

              <input
                type="date"
                value={returnDate}
                onChange={(e) =>
                  setReturnDate(e.target.value)
                }
              />
            </div>

            {preview && (
              <div className="refund-breakdown">
                <div>
                  <span>
                    Security Deposit
                  </span>

                  <strong>
                    ₹{selectedLoan.deposit}
                  </strong>
                </div>

                <div>
                  <span>
                    Late Days
                  </span>

                  <strong>
                    {preview.lateDays}
                  </strong>
                </div>

                <div>
                  <span>
                    Late Fee
                  </span>

                  <strong className="fee">
                    - ₹{preview.lateFee}
                  </strong>
                </div>

                <div className="refund-total">
                  <span>
                    Refund Amount
                  </span>

                  <strong>
                    ₹{preview.refund}
                  </strong>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setSelectedLoan(null);
                  setReturnDate("");
                }}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={handleReturn}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TRANSFER MODAL ================= */}

      {transferLoanData && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Transfer Loan</h2>

            <div className="return-summary">
              <strong>
                {getEquipment(
                  transferLoanData.equipmentId
                )?.name}
              </strong>

              <span>
                Current Borrower:{" "}
                {transferLoanData.borrower}
              </span>

              <span>
                Quantity:{" "}
                {transferLoanData.quantity}
              </span>

              <span>
                Original Due Date:{" "}
                {transferLoanData.dueDate}
              </span>

              <span>
                Deposit: ₹
                {transferLoanData.deposit}
              </span>
            </div>

            <div className="form-group">
              <label>
                New Borrower
              </label>

              <input
                type="text"
                value={newBorrower}
                onChange={(e) =>
                  setNewBorrower(e.target.value)
                }
                placeholder="Enter new borrower name"
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setTransferLoanData(null);
                  setNewBorrower("");
                }}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={handleTransfer}
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Returns;