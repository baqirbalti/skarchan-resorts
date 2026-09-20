// components/MultiRoomBookingModal.jsx — the ONE booking route for the whole
// site. Opened bare (all quantities 0, all rooms visible) from the Navbar
// "BOOK NOW" button, or opened from a Room Detail page's "Book This Room"
// button with `primaryRoomId` + `initialQuantities` set — in that case only
// that room is shown at first (keeps the page short), with a link to expand
// and add other rooms if the guest wants to.
//
// Rooms that have both a Non-AC and an AC price (see `priceAC`/`priceACNum`
// in data/rooms.js) are shown as TWO separate rows — one per rate — each
// with its own quantity counter, so a guest can book e.g. 1 Non-AC AND
// 1 With-AC unit of the same room in one request.
//
// Any room with `maxMattress` > 0 also gets its own extra-mattress stepper
// (shown once that room's quantity is > 0), capped at that room's
// maxMattress and billed at its mattressPrice — both are plain data fields
// on the room in rooms.js, so the client asking to raise a limit or price
// later is a one-line data edit, not a code change.
import { useState, useMemo } from "react";
import { getRoomVariants } from "../data/rooms.js";
import { submitBookingToSheet, todayStr } from "../config.js";

const qtyBtnStyle = {
  width: 28, height: 28, borderRadius: "50%", border: "1px solid #C8B49A",
  background: "#FFFFFF", color: "#984A1C", fontSize: 16, fontWeight: 700,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  lineHeight: 1, flexShrink: 0,
};

const mattressBtnStyle = { ...qtyBtnStyle, width: 22, height: 22, fontSize: 12 };

const inputStyle = {
  width: "100%", padding: "12px 14px", border: "1px solid #E0D8C8", borderRadius: 6,
  fontSize: 14, fontFamily: "Lato, sans-serif", outline: "none", boxSizing: "border-box", background: "#FFF",
};
const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, fontFamily: "Lato, sans-serif" };

const formatPKR = (n) => `PKR ${Math.round(n).toLocaleString("en-PK")}`;

export default function MultiRoomBookingModal({ onClose, onSuccess, initialQuantities = {}, primaryRoomId = null }) {
  // Each ROOM can expand into 1 or 2 bookable rows (variants) — quantities
  // are tracked per variant key, e.g. "deluxe luxary suite::AC", so the
  // Non-AC and With-AC rows of the same room never share a counter.
  const variants = useMemo(() => getRoomVariants(), []);
  const [quantities, setQuantities] = useState(initialQuantities);
  // Extra mattress count per variant key — capped per-room at room.maxMattress
  const [mattresses, setMattresses] = useState({});
  // When opened for a specific room, start collapsed to just that room;
  // the guest can expand to see/add every other room.
  const [showAllRooms, setShowAllRooms] = useState(!primaryRoomId);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", whatsapp: "", checkIn: "", checkOut: "", adults: "1", children: "0",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const changeQty = (key, delta) => {
    setQuantities(q => {
      const next = Math.max(0, (q[key] || 0) + delta);
      return { ...q, [key]: next };
    });
    setError("");
  };

  const changeMattress = (key, delta, max) => {
    setMattresses(m => {
      const next = Math.min(max, Math.max(0, (m[key] || 0) + delta));
      return { ...m, [key]: next };
    });
  };

  const label = (v) => v.variantLabel ? `${v.room.name} (${v.variantLabel})` : v.room.name;

  const primaryRoomName = primaryRoomId
    ? (variants.find(v => v.roomId === primaryRoomId)?.room.name || "this room")
    : null;

  const visibleVariants = showAllRooms
    ? variants
    : variants.filter(v => v.roomId === primaryRoomId);

  const selectedVariants = useMemo(
    () => variants.filter(v => (quantities[v.key] || 0) > 0),
    [variants, quantities]
  );
  const totalRooms = selectedVariants.reduce((sum, v) => sum + (quantities[v.key] || 0), 0);

  // Nightly total = sum of (rate × quantity) + (mattress price × mattress
  // count) across every selected row.
  const nightlyTotal = selectedVariants.reduce((sum, v) => {
    const roomCost = (v.price || 0) * (quantities[v.key] || 0);
    const mattressCost = (v.room.mattressPrice || 0) * (mattresses[v.key] || 0);
    return sum + roomCost + mattressCost;
  }, 0);

  const nights = formData.checkIn && formData.checkOut
    ? Math.max(0, Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / 86400000))
    : 0;

  const estimatedTotal = nights > 0 ? nightlyTotal * nights : nightlyTotal;

  const minCheckOut = formData.checkIn
    ? new Date(new Date(formData.checkIn).getTime() + 86400000).toISOString().split("T")[0]
    : todayStr();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;

    if (selectedVariants.length === 0) {
      setError("Please select at least one room before submitting.");
      return;
    }

    setError("");
    setSubmitting(true);

    const roomSummary = selectedVariants
      .map(v => {
        const mCount = mattresses[v.key] || 0;
        const mNote = mCount > 0 ? ` +${mCount} extra mattress${mCount > 1 ? "es" : ""}` : "";
        return `${label(v)} x${quantities[v.key]}${mNote}`;
      })
      .join(", ");

    // Fire-and-forget — see config.js for why we don't await this.
    submitBookingToSheet({
      room: roomSummary,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      adults: formData.adults,
      children: formData.children,
      nights: nights || "",
      roomsCount: totalRooms,
      estimatedTotal: estimatedTotal || "",
      submittedAt: new Date().toISOString(),
    });

    setSubmitting(false);
    onSuccess();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#F9F6F0", width: "100%", maxWidth: 620, maxHeight: "92vh", borderRadius: 12, overflowY: "auto", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#fff", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontWeight: "bold", zIndex: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>✕</button>

        <div style={{ padding: "40px 32px" }}>
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 30, color: "#1C1209", margin: "0 0 4px" }}>Book Your Stay</h2>
          <p style={{ fontFamily: "Lato, sans-serif", fontSize: 13, color: "#8C7B6B", margin: "0 0 24px" }}>
            {showAllRooms
              ? "Choose any mix of rooms — different types, different quantities — then fill your details once."
              : `Booking the ${primaryRoomName}. Add an extra mattress below if needed, or add other rooms to this same request.`}
          </p>

          {/* ── Step 1: Room selection ────────────────────────── */}
          <p style={{ fontFamily: "Lato, sans-serif", fontSize: 11, letterSpacing: 2, color: "#984A1C", fontWeight: 700, textTransform: "uppercase", margin: "0 0 10px" }}>
            1. Select Rooms
          </p>
          <div style={{ border: "1px solid #EDE6D8", borderRadius: 8, padding: "4px 16px", marginBottom: 12, background: "#FFFFFF" }}>
            {visibleVariants.map(v => {
              const qty = quantities[v.key] || 0;
              const mCount = mattresses[v.key] || 0;
              return (
                <div key={v.key} style={{ padding: "14px 0", borderBottom: "1px solid #F1ECE1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <img
                      src={v.room.heroImg}
                      alt={v.room.name}
                      loading="lazy"
                      style={{ width: 64, aspectRatio: "4/3", objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontFamily: "Cormorant Garamond, serif", fontSize: 17, color: "#1C1209", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {v.room.name}
                        {v.variantLabel && (
                          <span style={{ fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, color: "#984A1C", marginLeft: 8, letterSpacing: 0.5 }}>
                            {v.variantLabel.toUpperCase()}
                          </span>
                        )}
                      </p>
                      <p style={{ margin: 0, fontFamily: "Lato, sans-serif", fontSize: 12, color: "#8C7B6B" }}>
                        {v.room.category} · Sleeps {v.room.capacity} · {formatPKR(v.price)} / night
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <button type="button" onClick={() => changeQty(v.key, -1)} style={qtyBtnStyle}>−</button>
                      <span style={{ minWidth: 16, textAlign: "center", fontFamily: "Lato, sans-serif", fontWeight: 700, color: "#1C1209" }}>
                        {qty}
                      </span>
                      <button type="button" onClick={() => changeQty(v.key, 1)} style={qtyBtnStyle}>+</button>
                    </div>
                  </div>

                  {/* Extra mattress — only offered once this room is selected */}
                  {qty > 0 && v.room.maxMattress > 0 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px dashed #EDE6D8", marginLeft: 78 }}>
                      <span style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#8C7B6B" }}>
                        + Extra mattress ({formatPKR(v.room.mattressPrice)}/night, max {v.room.maxMattress})
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <button type="button" onClick={() => changeMattress(v.key, -1, v.room.maxMattress)} style={mattressBtnStyle}>−</button>
                        <span style={{ minWidth: 14, textAlign: "center", fontFamily: "Lato, sans-serif", fontWeight: 700, fontSize: 12, color: "#1C1209" }}>
                          {mCount}
                        </span>
                        <button type="button" onClick={() => changeMattress(v.key, 1, v.room.maxMattress)} style={mattressBtnStyle}>+</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expand/collapse to the rest of the rooms */}
          {primaryRoomId && (
            <button
              type="button"
              onClick={() => setShowAllRooms(s => !s)}
              style={{ background: "none", border: "none", padding: 0, marginBottom: 20, color: "#984A1C", fontFamily: "Lato, sans-serif", fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3, cursor: "pointer", textDecoration: "underline" }}
            >
              {showAllRooms ? `− Show only ${primaryRoomName}` : "+ Add other rooms to this booking"}
            </button>
          )}

          {/* Selection summary + live estimated total */}
          {totalRooms > 0 && (
            <div style={{ background: "#FBF3E6", border: "1px solid #E7D9BE", borderRadius: 8, padding: "14px 16px", marginBottom: 24 }}>
              <p style={{ margin: "0 0 8px", fontFamily: "Lato, sans-serif", fontSize: 11, letterSpacing: 1, color: "#984A1C", fontWeight: 700, textTransform: "uppercase" }}>
                Your Selection ({totalRooms} room{totalRooms > 1 ? "s" : ""})
              </p>
              {selectedVariants.map(v => {
                const mCount = mattresses[v.key] || 0;
                return (
                  <div key={v.key} style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ margin: 0, fontFamily: "Lato, sans-serif", fontSize: 14, color: "#333" }}>
                        {label(v)} <span style={{ color: "#8C7B6B" }}>× {quantities[v.key]}</span>
                      </p>
                      <p style={{ margin: 0, fontFamily: "Lato, sans-serif", fontSize: 14, color: "#555" }}>
                        {formatPKR(v.price * quantities[v.key])}{nights > 0 ? " /night" : ""}
                      </p>
                    </div>
                    {mCount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <p style={{ margin: 0, fontFamily: "Lato, sans-serif", fontSize: 12, color: "#8C7B6B" }}>
                          + {mCount} extra mattress{mCount > 1 ? "es" : ""}
                        </p>
                        <p style={{ margin: 0, fontFamily: "Lato, sans-serif", fontSize: 12, color: "#8C7B6B" }}>
                          {formatPKR(v.room.mattressPrice * mCount)}{nights > 0 ? " /night" : ""}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ borderTop: "1px solid #E7D9BE", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ margin: 0, fontFamily: "Lato, sans-serif", fontSize: 13, color: "#1C1209", fontWeight: 700 }}>
                  Estimated Total{nights > 0 ? ` (${nights} night${nights > 1 ? "s" : ""})` : ""}
                </p>
                <p style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: 22, color: "#984A1C", fontWeight: 700 }}>
                  {formatPKR(estimatedTotal)}
                </p>
              </div>
              {nights === 0 && (
                <p style={{ margin: "6px 0 0", fontFamily: "Lato, sans-serif", fontSize: 11, color: "#8C7B6B", fontStyle: "italic" }}>
                  Per-night rate shown — select check-in &amp; check-out dates below for your full-stay total.
                </p>
              )}
            </div>
          )}

          {/* ── Step 2: Guest details ────────────────────────── */}
          <p style={{ fontFamily: "Lato, sans-serif", fontSize: 11, letterSpacing: 2, color: "#984A1C", fontWeight: 700, textTransform: "uppercase", margin: "0 0 10px" }}>
            2. Your Details
          </p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <div className="mrb-two-col">
              <div><label style={labelStyle}>First Name *</label><input required style={inputStyle} name="firstName" value={formData.firstName} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Last Name *</label><input required style={inputStyle} name="lastName" value={formData.lastName} onChange={handleChange} /></div>
            </div>
            <div className="mrb-two-col">
              <div><label style={labelStyle}>Email *</label><input required type="email" style={inputStyle} name="email" value={formData.email} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Contact Number *</label><input required style={inputStyle} name="phone" value={formData.phone} onChange={handleChange} /></div>
            </div>
            <div>
              <label style={labelStyle}>WhatsApp Number *</label>
              <input required style={inputStyle} name="whatsapp" placeholder="with country code" value={formData.whatsapp} onChange={handleChange} />
            </div>
            <div className="mrb-two-col">
              <div>
                <label style={labelStyle}>Check in Date *</label>
                <input required type="date" min={todayStr()} style={inputStyle} name="checkIn"
                  value={formData.checkIn}
                  onChange={e => setFormData({ ...formData, checkIn: e.target.value, checkOut: "" })} />
              </div>
              <div>
                <label style={labelStyle}>Check out Date *</label>
                <input required type="date" min={minCheckOut} style={inputStyle} name="checkOut" value={formData.checkOut} onChange={handleChange} disabled={!formData.checkIn} />
              </div>
            </div>
            <div className="mrb-two-col">
              <div><label style={labelStyle}>Adults *</label><input required type="number" min="1" style={inputStyle} name="adults" value={formData.adults} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Children *</label><input required type="number" min="0" style={inputStyle} name="children" value={formData.children} onChange={handleChange} /></div>
            </div>

            {error && (
              <p style={{ fontFamily: "Lato, sans-serif", fontSize: 13, color: "#C0392B", margin: 0 }}>⚠ {error}</p>
            )}

            <button type="submit" disabled={submitting} style={{ width: "100%", padding: "15px", background: submitting ? "#C9B79A" : "#C49B66", color: "#fff", border: "none", borderRadius: 6, fontWeight: "bold", fontSize: 16, marginTop: 6, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "Submitting..." : totalRooms > 0 ? `Request Booking — ${formatPKR(estimatedTotal)}` : "Request Booking"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .mrb-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 480px) {
          .mrb-two-col { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
