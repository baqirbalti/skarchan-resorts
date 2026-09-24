// BookingWidget.jsx — Date picker + guest selector → WhatsApp booking
import { useState } from "react";
import { WHATSAPP_NUMBER, buildBookingMessage, todayStr, formatDate } from "../config.js";

export default function BookingWidget({ roomName = null, compact = false }) {
  const [checkIn,  setCheckIn]  = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests,   setGuests]   = useState(2);
  const [error,    setError]    = useState("");

  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0]
    : todayStr();

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)
    : 0;

  const handleBook = () => {
    if (!checkIn)  { setError("Please select a check-in date."); return; }
    if (!checkOut) { setError("Please select a check-out date."); return; }
    setError("");
    const msg = buildBookingMessage(roomName, checkIn, checkOut, guests);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const inputStyle = {
    width: "100%", background: "#F7F3EC", border: "1px solid #B7AE9E",
    padding: "11px 14px", fontFamily: "Lato, sans-serif", fontSize: 14,
    color: "#211D19", outline: "none", borderRadius: 2,
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontFamily: "Lato, sans-serif", fontSize: 10, letterSpacing: 2,
    color: "#7D7368", display: "block", marginBottom: 6, textTransform: "uppercase",
  };

  return (
    <div style={{
      background: "#2A2622", padding: compact ? "24px 20px" : "36px 28px",
      border: "2px solid #A85A2E", borderRadius: 2,
    }}>
      <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: compact ? 20 : 24, color: "#F7F3EC", margin: "0 0 6px" }}>
        {roomName ? "Reserve This Room" : "Check Availability"}
      </h3>
      <div style={{ width: 36, height: 1, background: "#A85A2E", marginBottom: 20 }} />

      {roomName && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ ...labelStyle }}>Selected Room</p>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 17, color: "#A85A2E", margin: 0 }}>{roomName}</p>
        </div>
      )}

      {/* Check-in */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Check-in Date</label>
        <input
          type="date"
          min={todayStr()}
          value={checkIn}
          onChange={e => { setCheckIn(e.target.value); setCheckOut(""); setError(""); }}
          style={{ ...inputStyle, colorScheme: "light" }}
        />
      </div>

      {/* Check-out */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Check-out Date</label>
        <input
          type="date"
          min={minCheckOut}
          value={checkOut}
          disabled={!checkIn}
          onChange={e => { setCheckOut(e.target.value); setError(""); }}
          style={{ ...inputStyle, opacity: checkIn ? 1 : 0.5, colorScheme: "light" }}
        />
      </div>

      {/* Guests */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Number of Guests</label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setGuests(g => Math.max(1, g - 1))}
            style={{ width: 34, height: 34, background: "transparent", border: "1px solid #B7AE9E", color: "#F7F3EC", fontSize: 18, borderRadius: 2 }}
          >−</button>
          <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, color: "#F7F3EC", minWidth: 24, textAlign: "center" }}>{guests}</span>
          <button
            onClick={() => setGuests(g => Math.min(10, g + 1))}
            style={{ width: 34, height: 34, background: "transparent", border: "1px solid #B7AE9E", color: "#F7F3EC", fontSize: 18, borderRadius: 2 }}
          >+</button>
          <span style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#7D7368" }}>guest{guests > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Nights summary */}
      {nights > 0 && (
        <div style={{
          background: "rgba(196,146,42,0.12)", border: "1px solid rgba(196,146,42,0.3)",
          padding: "10px 14px", marginBottom: 16, borderRadius: 2,
        }}>
          <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#A85A2E", margin: 0 }}>
            📅 {formatDate(checkIn)} → {formatDate(checkOut)}
          </p>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, color: "#F7F3EC", margin: "4px 0 0" }}>
            {nights} night{nights > 1 ? "s" : ""} · {guests} guest{guests > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#e07070", marginBottom: 12 }}>⚠ {error}</p>
      )}

      {/* Book button */}
      <button
        onClick={handleBook}
        style={{
          width: "100%", background: "#25D366", color: "#fff",
          border: "2px solid #A85A2E", padding: "14px",
          fontFamily: "Lato, sans-serif", fontSize: 13, letterSpacing: 2,
          fontWeight: 700, borderRadius: 2, display: "flex",
          alignItems: "center", justifyContent: "center", gap: 10,
          animation: "pulse 2s infinite",
        }}
      >
        📱 {roomName ? "BOOK ON WHATSAPP" : "CHECK AVAILABILITY"}
      </button>
      <p style={{ fontFamily: "Lato, sans-serif", fontSize: 10, color: "#7D7368", textAlign: "center", margin: "10px 0 0", letterSpacing: 0.5 }}>
        Instant confirmation · No hidden fees · Reply within 1 hour
      </p>
    </div>
  );
}
