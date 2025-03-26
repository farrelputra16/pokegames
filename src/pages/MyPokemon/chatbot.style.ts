import styled from "@emotion/styled";

export const PokeballContainer = styled("div")({
  position: "fixed",
  bottom: "20px",
  right: "20px",
  width: "100px", // Ukuran diperbesar dari 60px ke 100px
  height: "100px", // Ukuran diperbesar dari 60px ke 100px
  cursor: "pointer",
  zIndex: 1000,
  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  "&:hover": {
    transform: "scale(1.1)", // Efek hover tetap ada
  },
});

export const PokeballBubble = styled("div")({
  position: "absolute",
  top: "-50px", // Disesuaikan agar bubble tidak bertabrakan dengan Pokeball besar
  right: "110px", // Disesuaikan agar bubble tetap di samping kiri Pokeball besar
  padding: "8px 12px", // Sedikit diperbesar untuk proporsi
  background: "#fff",
  border: "2px solid #000",
  borderRadius: "15px",
  fontSize: "14px", // Font sedikit diperbesar untuk keseimbangan
  fontWeight: "bold",
  color: "#333",
  whiteSpace: "nowrap",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  "&:before": {
    content: '""',
    position: "absolute",
    width: "0",
    height: "0",
    borderStyle: "solid",
    borderWidth: "10px 10px 10px 0",
    borderColor: "transparent #fff transparent transparent",
    top: "50%",
    right: "-10px",
    transform: "translateY(-50%)",
  },
});

// Styling lainnya tetap sama
export const ChatbotContainer = styled("div")({
  position: "fixed",
  bottom: "20px",
  right: "20px",
  width: "400px",
  height: "450px",
  background: "#fff",
  border: "2px solid #000",
  borderRadius: "15px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  zIndex: 1000,
  overflow: "hidden",
});

export const ChatbotWrapper = styled("div")({
  display: "flex",
  height: "100%",
});

export const PokemonImage = styled("div")({
  width: "120px",
  background: "#f0f0f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRight: "2px solid #000",
  img: {
    width: "100px",
    height: "100px",
    objectFit: "contain",
  },
});

export const ChatbotContent = styled("div")({
  flex: 1,
  display: "flex",
  flexDirection: "column",
});

export const ChatbotHeader = styled("div")({
  padding: "10px",
  background: "#f0f0f0",
  borderBottom: "2px solid #000",
  textAlign: "center",
  position: "relative",
  span: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
  },
});

export const CloseButton = styled("button")({
  position: "absolute",
  top: "5px",
  right: "5px",
  width: "20px",
  height: "20px",
  background: "#ff4444",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  cursor: "pointer",
  fontSize: "12px",
  lineHeight: "20px",
  "&:hover": {
    background: "#cc0000",
  },
});

export const ChatbotSelector = styled("div")({
  padding: "10px",
  borderBottom: "1px solid #ccc",
  select: {
    width: "100%",
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    background: "#fff",
    fontSize: "14px",
  },
});

export const ChatbotMessages = styled("div")({
  flex: 1,
  padding: "10px",
  overflowY: "auto",
  background: "#f9f9f9",
});

export const MessageBubble = styled("div")<{ isUser?: boolean }>(({ isUser }) => ({
  display: "flex",
  justifyContent: isUser ? "flex-end" : "flex-start",
  margin: "10px 0",
}));

export const BubbleContent = styled("div")<{ isUser?: boolean }>(({ isUser }) => ({
  maxWidth: "70%",
  padding: "10px",
  background: isUser ? "#007bff" : "#fff",
  color: isUser ? "#fff" : "#000",
  borderRadius: "15px",
  border: isUser ? "none" : "2px solid #ccc",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  position: "relative",
  "&:before": {
    content: '""',
    position: "absolute",
    width: "0",
    height: "0",
    borderStyle: "solid",
    borderWidth: isUser ? "10px 0 10px 10px" : "10px 10px 10px 0",
    borderColor: isUser
      ? "transparent transparent transparent #007bff"
      : "transparent #fff transparent transparent",
    top: "50%",
    transform: "translateY(-50%)",
    left: isUser ? "100%" : "-10px",
  },
}));

export const ChatbotInput = styled("div")({
  padding: "10px",
  borderTop: "2px solid #000",
  display: "flex",
  gap: "5px",
  background: "#fff",
  input: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
  },
  button: {
    padding: "8px 15px",
    background: "#ffcb05",
    color: "#000",
    border: "2px solid #000",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    "&:disabled": {
      background: "#ccc",
      cursor: "not-allowed",
    },
    "&:hover:not(:disabled)": {
      background: "#ffde4d",
    },
  },
});