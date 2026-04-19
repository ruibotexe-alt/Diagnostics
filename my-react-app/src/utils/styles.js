export const W = {
  minHeight: "100vh",
  background: "#080810",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Courier New',monospace",
  padding: "20px 16px"
};

export function getCardStyle(fade) {
  return {
    width: "100%",
    maxWidth: 600,
    background: "#0e0e1c",
    border: "1px solid #1c1c34",
    borderRadius: 4,
    padding: "30px 26px",
    opacity: fade ? 1 : 0,
    transform: fade ? "translateY(0)" : "translateY(6px)",
    transition: "opacity 0.22s ease,transform 0.22s ease"
  };
}

export const DIV = { height: 1, background: "#1c1c34", margin: "22px 0" };

export const T1 = { color: "#e8eaf6" };
export const T2 = { color: "#b0b4d8" };
export const T3 = { color: "#7880b0" };
export const T4 = { color: "#44486a" };

export function btnSt(a, col) {
  col = col || "#00ff88";
  return {
    padding: "11px 24px",
    background: a ? col : "#131326",
    border: "1px solid " + (a ? col : "#1c1c34"),
    borderRadius: 3,
    color: a ? "#080810" : "#44486a",
    fontSize: 10,
    letterSpacing: 3,
    cursor: a ? "pointer" : "default",
    fontFamily: "'Courier New',monospace",
    textTransform: "uppercase",
    fontWeight: "bold",
    transition: "all 0.15s"
  };
}
