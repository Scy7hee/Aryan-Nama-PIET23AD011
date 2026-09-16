import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [equipment, setEquipment] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // LOAD DATA FROM SUPABASE
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: equipmentData, error: equipmentError } =
        await supabase
          .from("equipment")
          .select("*")
          .order("id");

      const { data: loansData, error: loansError } =
        await supabase
          .from("loans")
          .select("*")
          .order("id");

      if (equipmentError) {
        console.error(
          "Equipment loading error:",
          equipmentError
        );
      }

      if (loansError) {
        console.error(
          "Loans loading error:",
          loansError
        );
      }

      setEquipment(
        (equipmentData || []).map((item) => ({
          id: item.id,
          name: item.name,
          totalUnits: item.total_units,
          lateFeePerDay: Number(item.late_fee_per_day),
        }))
      );

      setLoans(
        (loansData || []).map((loan) => ({
          id: loan.id,
          borrower: loan.borrower,
          equipmentId: loan.equipment_id,
          quantity: loan.quantity,
          borrowDate: loan.borrow_date,
          dueDate: loan.due_date,
          returnDate: loan.return_date,
          deposit: Number(loan.deposit),
          lateDays: loan.late_days || 0,
          lateFee: Number(loan.late_fee || 0),
          refund: Number(loan.refund || 0),
          status: loan.status,
        }))
      );

      setLoading(false);
    };

    loadData();
  }, []);

  // GET EQUIPMENT
  const getEquipment = (equipmentId) => {
    return equipment.find(
      (item) => item.id === Number(equipmentId)
    );
  };

  // GET BORROWED QUANTITY
  const getBorrowedQuantity = (equipmentId) => {
    return loans
      .filter(
        (loan) =>
          loan.equipmentId === Number(equipmentId) &&
          loan.status === "active"
      )
      .reduce(
        (total, loan) => total + loan.quantity,
        0
      );
  };

  // GET AVAILABLE QUANTITY
  const getAvailableQuantity = (equipmentId) => {
    const item = getEquipment(equipmentId);

    if (!item) return 0;

    return (
      item.totalUnits -
      getBorrowedQuantity(equipmentId)
    );
  };

  // GET BORROWER'S ACTIVE ITEMS
  const getBorrowerActiveItems = (borrower) => {
    return loans
      .filter(
        (loan) =>
          loan.borrower.toLowerCase() ===
            borrower.toLowerCase() &&
          loan.status === "active"
      )
      .reduce(
        (total, loan) => total + loan.quantity,
        0
      );
  };

  // BORROW EQUIPMENT
  const borrowEquipment = ({
    borrower,
    equipmentId,
    quantity,
    borrowDate,
    dueDate,
    deposit,
  }) => {
    const available =
      getAvailableQuantity(equipmentId);

    if (quantity > available) {
      return {
        success: false,
        message: `Only ${available} unit(s) are currently available.`,
      };
    }

    const activeItems =
      getBorrowerActiveItems(borrower);

    if (activeItems + Number(quantity) > 5) {
      return {
        success: false,
        message:
          "Borrowing limit exceeded. Maximum 5 active units per borrower.",
      };
    }

    if (
      new Date(dueDate) <=
      new Date(borrowDate)
    ) {
      return {
        success: false,
        message:
          "Return date must be after the borrowing date.",
      };
    }

    const newLoan = {
      borrower: borrower.trim(),
      equipment_id: Number(equipmentId),
      quantity: Number(quantity),
      borrow_date: borrowDate,
      due_date: dueDate,
      deposit: Number(deposit) || 0,
      status: "active",
    };

    // Save to Supabase
    supabase
      .from("loans")
      .insert([newLoan])
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error(
            "Borrow database error:",
            error
          );
          return;
        }

        if (data) {
          const formattedLoan = {
            id: data.id,
            borrower: data.borrower,
            equipmentId: data.equipment_id,
            quantity: data.quantity,
            borrowDate: data.borrow_date,
            dueDate: data.due_date,
            returnDate: data.return_date,
            deposit: Number(data.deposit),
            lateDays: data.late_days || 0,
            lateFee: Number(data.late_fee || 0),
            refund: Number(data.refund || 0),
            status: data.status,
          };

          setLoans((current) => [
            ...current,
            formattedLoan,
          ]);
        }
      });

    return {
      success: true,
      message:
        "Equipment borrowed successfully.",
    };
  };

  // RETURN EQUIPMENT
  const returnEquipment = (
    loanId,
    returnDate
  ) => {
    const loan = loans.find(
      (item) => item.id === loanId
    );

    if (!loan) {
      return {
        success: false,
        message: "Loan not found.",
      };
    }

    if (
      new Date(returnDate) <
      new Date(loan.borrowDate)
    ) {
      return {
        success: false,
        message:
          "Return date cannot be before the borrowing date.",
      };
    }

    const equipmentItem =
      getEquipment(loan.equipmentId);

    if (!equipmentItem) {
      return {
        success: false,
        message: "Equipment not found.",
      };
    }

    const due = new Date(loan.dueDate);
    const returned = new Date(returnDate);

    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    let lateDays = Math.ceil(
      (returned - due) /
        millisecondsPerDay
    );

    if (lateDays < 0) {
      lateDays = 0;
    }

    const lateFee =
      lateDays *
      equipmentItem.lateFeePerDay;

    const refund = Math.max(
      0,
      loan.deposit - lateFee
    );

    // Update local state immediately
    setLoans((current) =>
      current.map((item) =>
        item.id === loanId
          ? {
              ...item,
              status: "returned",
              returnDate,
              lateDays,
              lateFee,
              refund,
            }
          : item
      )
    );

    // Update Supabase
    supabase
      .from("loans")
      .update({
        status: "returned",
        return_date: returnDate,
        late_days: lateDays,
        late_fee: lateFee,
        refund: refund,
      })
      .eq("id", loanId)
      .then(({ error }) => {
        if (error) {
          console.error(
            "Return database error:",
            error
          );
        }
      });

    return {
      success: true,
      lateDays,
      lateFee,
      refund,
    };
  };

  // TRANSFER ACTIVE LOAN
  const transferLoan = (
    loanId,
    newBorrower
  ) => {
    const loan = loans.find(
      (item) => item.id === loanId
    );

    if (!loan) {
      return {
        success: false,
        message: "Loan not found.",
      };
    }

    if (loan.status !== "active") {
      return {
        success: false,
        message:
          "Only active loans can be transferred.",
      };
    }

    const borrowerName =
      newBorrower.trim();

    if (!borrowerName) {
      return {
        success: false,
        message:
          "Please enter a new borrower name.",
      };
    }

    if (
      borrowerName.toLowerCase() ===
      loan.borrower.toLowerCase()
    ) {
      return {
        success: false,
        message:
          "New borrower must be different from the current borrower.",
      };
    }

    const activeItems =
      getBorrowerActiveItems(
        borrowerName
      );

    if (
      activeItems + loan.quantity >
      5
    ) {
      return {
        success: false,
        message:
          "Transfer failed. New borrower would exceed the 5-unit borrowing limit.",
      };
    }

    // Update local state
    setLoans((current) =>
      current.map((item) =>
        item.id === loanId
          ? {
              ...item,
              borrower: borrowerName,
            }
          : item
      )
    );

    // Update Supabase
    supabase
      .from("loans")
      .update({
        borrower: borrowerName,
      })
      .eq("id", loanId)
      .then(({ error }) => {
        if (error) {
          console.error(
            "Transfer database error:",
            error
          );
        }
      });

    return {
      success: true,
      message: `Loan successfully transferred to ${borrowerName}.`,
    };
  };

  const value = {
    equipment,
    loans,
    loading,
    getEquipment,
    getBorrowedQuantity,
    getAvailableQuantity,
    getBorrowerActiveItems,
    borrowEquipment,
    returnEquipment,
    transferLoan,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}