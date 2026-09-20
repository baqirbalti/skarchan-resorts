// Footer.jsx
import { IMGS } from "../assets/images.js";
import { HOTEL_NAME, HOTEL_LOCATION, HOTEL_EMAIL, HOTEL_PHONE, WHATSAPP_NUMBER } from "../config.js";

export default function Footer({ setPage }) {
  const navigate = (p) => { setPage(p); window.scrollTo(0, 0); };

  return (
    <footer style={{ background: "#1C1209", borderTop: "1px solid #C4922A", padding: "60px 32px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>

        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <img src={IMGS.skarchanlogo} alt="logo" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "1px solid #C4922A" }} />
            <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, color: "#F5EFE6", letterSpacing: 2 }}>
              {HOTEL_NAME.toUpperCase()}
            </span>
          </div>
          <p style={{ fontFamily: "Lato, sans-serif", fontSize: 13, color: "#8C7B6B", lineHeight: 1.8 }}>
            Where the mountains meet timeless luxury.<br />{HOTEL_LOCATION}
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 style={{ fontFamily: "Lato, sans-serif", fontSize: 11, letterSpacing: 3, color: "#C4922A", marginBottom: 20 }}>NAVIGATE</h4>
          {[["Home","home"],["Rooms","rooms"],["Gallery","gallery"],["Amenities","amenities"],["About","about"],["Contact","contact"]].map(([l, k]) => (
            <p key={k} onClick={() => navigate(k)} style={{ fontFamily: "Lato, sans-serif", fontSize: 13, color: "#8C7B6B", margin: "0 0 10px", cursor: "pointer" }}
              onMouseOver={e => e.target.style.color = "#C4922A"} onMouseOut={e => e.target.style.color = "#8C7B6B"}
            >{l}</p>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontFamily: "Lato, sans-serif", fontSize: 11, letterSpacing: 3, color: "#C4922A", marginBottom: 20 }}>CONTACT</h4>
          <p style={{ fontFamily: "Lato, sans-serif", fontSize: 13, color: "#8C7B6B", margin: "0 0 10px" }}>📍 {HOTEL_LOCATION}</p>
          <p style={{ fontFamily: "Lato, sans-serif", fontSize: 13, color: "#8C7B6B", margin: "0 0 10px" }}>📞 {HOTEL_PHONE}</p>
          <p style={{ fontFamily: "Lato, sans-serif", fontSize: 13, color: "#8C7B6B", margin: "0 0 10px" }}>📧 {HOTEL_EMAIL}</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, color: "#25D366", fontFamily: "Lato, sans-serif", fontSize: 13 }}>
            💬 WhatsApp Us
          </a>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(200,180,154,0.2)", paddingTop: 24, textAlign: "center" }}>
        <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#8C7B6B", margin: 0 }}>
          © {new Date().getFullYear()} {HOTEL_NAME} · {HOTEL_LOCATION} · All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
