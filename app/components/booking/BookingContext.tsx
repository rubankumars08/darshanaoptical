"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface BookingContextValue {
  isOpen: boolean;
  openBooking: () => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        openBooking: () => setIsOpen(true),
        closeBooking: () => setIsOpen(false),
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}
