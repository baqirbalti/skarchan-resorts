// components/RoomCard.jsx
import AnimBlock from "./AnimBlock.jsx";

export default function RoomCard({ room, setPage, setRoomId, delay = 0 }) {
  const handleClick = () => {
    setRoomId(room.id);
    setPage("room-detail"); // Using correct page state
    window.scrollTo(0, 0);
  };

  return (
    <AnimBlock delay={delay}>
      <div 
        onClick={handleClick} 
        style={{
          background: "#FFFFFF", // Crisp white background to fix dullness
          borderRadius: "12px",  // Smooth rounded corners
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)", // Premium soft shadow
          transition: "transform 0.4s ease, box-shadow 0.4s ease",
          display: "flex",
          flexDirection: "column",
          height: "100%", 
        }}
        // Hover effect to make it feel interactive and premium
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.12)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.06)";
        }}
      >
        {/* 1. Image Section — aspect-ratio instead of a fixed pixel height so
            it scales proportionally on mobile instead of stretching vertically */}
        <div style={{ position: "relative" }}>
          <img
            src={room.heroImg}
            alt={room.name}
            loading="lazy"
            style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
          />
          {/* Category Badge */}
          <div style={{
            position: "absolute", top: 16, right: 16,
            background: "#984A1C", color: "#FFFFFF",
            fontSize: 11, fontFamily: "Lato, sans-serif",
            letterSpacing: 2, padding: "6px 14px", borderRadius: "4px",
            fontWeight: 700, boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}>
            {room.category ? room.category.toUpperCase() : "ROOM"}
          </div>
        </div>

        {/* 2. Content Section */}
        <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>

          {/* Big, Prominent Room Name */}
          <h3 style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 30,
            color: "#1C1209",
            margin: "0 0 12px",
            fontWeight: 600,
            lineHeight: 1.1
          }}>
            {room.name}
          </h3>

          {/* Minimal Quick Stats (Clean and simple) */}
          <div style={{
            display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "24px",
            fontFamily: "Lato, sans-serif", fontSize: 13, color: "#7A6652"
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>🛏 {room.beds || "Beds N/A"}</span>
            <span style={{ color: "#E0D8C8" }}>|</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>📐 {room.size || "Size N/A"}</span>
          </div>

          {/* Spacer to push the bottom elements down if cards are different heights */}
          <div style={{ flexGrow: 1 }}></div>

          {/* Light Divider Line */}
          <div style={{ height: 1, background: "#F0EBE1", marginBottom: 20 }}></div>

          {/* 3. Price & Action Button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "#8C7B6B", fontFamily: "Lato, sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>
                Starting from
              </p>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, color: "#984A1C", fontWeight: 700 }}>
                {room.price}
              </span>
            </div>

            {/* Solid, attention-grabbing button */}
            <button style={{
              background: "#984A1C",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              fontFamily: "Lato, sans-serif",
              fontSize: 12,
              letterSpacing: 1,
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background 0.3s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "#7A3B16"}
            onMouseOut={e => e.currentTarget.style.background = "#984A1C"}
            >
              VIEW ROOM
            </button>
          </div>

        </div>
      </div>
    </AnimBlock>
  );
}
