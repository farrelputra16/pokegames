import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { colors, units } from "../../utils";

const Page = styled("div")({
  "#pokeball-bg": {
    position: "fixed",
    right: "-64vw",
    top: 0,
    zIndex: -1,
    "@media (min-width: 640px)": { right: "-32vw" },
    "@media (min-width: 1024px)": { right: "-16vw" },
  },
});

const PokeName = styled("div")(
  {
    position: "relative",
    height: "40px",
    width: "65vw",
    "@media (min-width: 1024px)": { width: "32vw" },
    marginTop: units.spacing.xl,
    h1: {
      textTransform: "uppercase",
      position: "absolute",
      top: -20,
      left: 24,
      "@media (min-width: 1024px)": { left: 128 },
    },
    div: {
      position: "absolute",
      width: "100%",
      background: colors["gray-700"],
      bottom: 0,
    },
  },
  `
    div:nth-of-type(1) { height: 1.75rem; right: 20px; }
    div:nth-of-type(2) { height: 1.25rem; right: 10px; }
    div:nth-of-type(3) { height: 0.75rem; right: 0; }
  `,
);

const Content = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: units.spacing.xl,
  padding: "0 16px",
  maxWidth: "1344px",
  margin: "0 auto",
  h3: { marginBottom: units.spacing.base },
});

const ImageContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  marginBottom: "15px",
  "@media (min-width: 768px)": { marginBottom: "20px" },
});

const AbilitiesWrapper = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(1, 1fr)",
  "> div:nth-of-type(1)": { marginBottom: "20px" },
  "@media (min-width: 768px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
    "> div:nth-of-type(1)": { marginBottom: "0px" },
  },
});

const PokemonContainer = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr",
  maxWidth: "1344px",
  margin: "0 auto",
  padding: "20px 0",
  "> div.img-pokemon": { order: 1 },
  "> div.card-pxl": { margin: "0 20px", marginTop: "20px", order: 2 },
  "@media (min-width: 768px)": {
    gridTemplateColumns: "40% 1fr",
    "> div.img-pokemon": { order: 2 },
    "> div.card-pxl": { order: 1 },
  },
  "@media (min-width: 1024px)": {
    marginTop: "10px",
    gridTemplateColumns: "30% 1fr",
  },
});

const shake = keyframes`
  0% { transform: translate(0, 0) rotate(0); }
  20% { transform: translate(-10px, 0) rotate(-20deg); }
  30% { transform: translate(10px, 0) rotate(20deg); }
  50% { transform: translate(-10px, 0) rotate(-10deg); }
  60% { transform: translate(10px, 0) rotate(10deg); }
  100% { transform: translate(0, 0) rotate(0); }
`;

const faint = keyframes`
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  50% { transform: translate(0, 40px) scale(0.9); opacity: 0.5; }
  100% { transform: translate(0, 80px) scale(0.7); opacity: 0; }
`;

const battleStart = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const chatBubbleFade = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const CatchingModal = styled("div")`
  .pokeball {
    animation: ${shake} 1.25s cubic-bezier(0.36, 0.07, 0.19, 0.97) 2;
  }
`;

const PostCatchModal = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  p: { textAlign: "center" },
});

const NicknamingModal = styled("div")({
  width: "100vw",
  padding: "0 16px",
  "@media (min-width: 1024px)": { width: "32vw" },
});

const NicknamingForm = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: units.spacing.base,
});

const DescriptionLoadingWrapper = styled("div")({
  div: { justifyContent: "flex-start" },
});

const ImageLoadingWrapper = styled("div")({
  width: 256,
  height: 256,
  display: "grid",
  placeItems: "center",
  margin: "0 auto",
  "@media (max-width: 768px)": {
    width: 150,
    height: 150,
  },
});

const PokemonStatsWrapper = styled("div")({
  marginTop: "20px",
  textAlign: "left",
  "> h4": { marginBottom: "10px" },
});

const Grid = styled("div")(
  {
    display: "grid",
    columnGap: 8,
    rowGap: 0,
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  `
  @media (min-width: 640px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  @media (min-width: 1024px) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  `,
);

const AnotherWrapper = styled("div")({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  gap: 16,
});

const BattleModal = styled("div")({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundImage: "url(/static/pokemonfightbg.png)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "20px",
  zIndex: 1000,
  animation: `${battleStart} 0.5s ease-in-out`,
  boxShadow: "inset 0 0 50px rgba(0,0,0,0.7)",
});

const BattleContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  width: "100%",
  maxWidth: "1200px",
  padding: "0 20px",
  flex: 1,
  "@media (max-width: 1024px)": {
    padding: "0 10px",
  },
});

const BattleIntroContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  maxWidth: "1200px",
  padding: "0 20px",
  flex: 1,
  "@media (max-width: 1024px)": {
    padding: "0 10px",
  },
});

const PokemonBattleWrapper = styled("div")<{
  isAttacking: "player" | "enemy" | "faint" | "dodge" | "charge" | "slash" | "quick" | "heavy" | null;
  isFainted: boolean;
  isDodging: boolean;
}>(({ isFainted }) => ({
  position: "relative",
  transition: "transform 0.3s ease-out",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  "@media (max-width: 1024px)": {
    flex: 1,
  },
  ...(isFainted && {
    animation: `${faint} 1s ease-in-out forwards`,
  }),
  "&::after": {
    content: '""',
    position: "absolute",
    width: "80%",
    height: "15px",
    bottom: "-10px",
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: "50%",
    filter: "blur(5px)",
    zIndex: -1,
    transition: "width 0.3s ease-out",
  },
}));

const BattleControls = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  width: "100%",
  position: "absolute",
  bottom: "20px",
  left: "0",
  background: "transparent",
  border: "none",
});

const DesktopControls = styled("div")({
  display: "none",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  "@media (min-width: 1024px)": {
    display: "flex",
  },
});

const MobileControls = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  padding: "0 20px",
  "@media (min-width: 1024px)": {
    display: "none",
  },
});

const ChatBubble = styled("div")<{ side: "left" | "right" }>((props) => ({
  position: "absolute",
  top: "-60px",
  [props.side]: "10px",
  background: props.side === "left" ? "rgba(0, 255, 0, 0.9)" : "rgba(255, 0, 0, 0.9)",
  border: "2px solid #fff",
  borderRadius: "10px",
  padding: "10px",
  maxWidth: "200px",
  textAlign: "center",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  animation: `${chatBubbleFade} 0.5s ease-in-out`,
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-10px",
    [props.side]: "20px",
    width: "0",
    height: "0",
    borderLeft: "10px solid transparent",
    borderRight: "10px solid transparent",
    borderTop: `10px solid ${props.side === "left" ? "rgba(0, 255, 0, 0.9)" : "rgba(255, 0, 0, 0.9)"}`,
  },
  "@media (max-width: 768px)": {
    maxWidth: "150px",
    top: "-50px",
    padding: "8px",
  },
}));

const PokemonSelectionModal = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  padding: "20px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  width: "80vw",
  maxWidth: "600px",
  "@media (max-width: 768px)": {
    width: "90vw",
  },
});

const PokemonSelectionGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "15px",
});

const PokemonCard = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "10px",
  border: "2px solid #000",
  borderRadius: "8px",
  background: "#f9f9f9",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  },
});

const ComboText = styled("div")({
  position: "absolute",
  top: "-20px",
  color: "#ff0",
  fontSize: "20px",
  fontWeight: "bold",
  textShadow: "0 0 5px #000",
  animation: `${chatBubbleFade} 0.5s ease-in-out`,
});

export {
  Content,
  Page,
  PokeName,
  CatchingModal,
  PostCatchModal,
  NicknamingForm,
  NicknamingModal,
  DescriptionLoadingWrapper,
  ImageLoadingWrapper,
  Grid,
  ImageContainer,
  AnotherWrapper,
  PokemonContainer,
  PokemonStatsWrapper,
  AbilitiesWrapper,
  BattleModal,
  BattleContainer,
  BattleControls,
  DesktopControls,
  MobileControls,
  PokemonBattleWrapper,
  PokemonSelectionModal,
  PokemonSelectionGrid,
  PokemonCard,
  BattleIntroContainer,
  ChatBubble,
  ComboText,
};