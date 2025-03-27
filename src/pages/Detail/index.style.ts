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

// Keyframes
const shake = keyframes`
  0% { transform: translate(0, 0) rotate(0); }
  20% { transform: translate(-10px, 0) rotate(-20deg); }
  30% { transform: translate(10px, 0) rotate(20deg); }
  50% { transform: translate(-10px, 0) rotate(-10deg); }
  60% { transform: translate(10px, 0) rotate(10deg); }
  100% { transform: translate(0, 0) rotate(0); }
`;

const chargePlayer = keyframes`
  0% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 0 #ff0); }
  50% { transform: scale(1.1); filter: brightness(1.5) drop-shadow(0 0 10px #ff0); }
  100% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 5px #ff0); }
`;

const slashPlayer = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); filter: brightness(1); }
  20% { transform: translate(80px, -20px) rotate(15deg); filter: brightness(1.5) drop-shadow(0 0 15px #ff0); }
  40% { transform: translate(150px, 0) rotate(0deg); filter: brightness(2) drop-shadow(0 0 20px #ff0); }
  60% { transform: translate(80px, 20px) rotate(-15deg); filter: brightness(1.5); }
  100% { transform: translate(0, 0) rotate(0deg); filter: brightness(1); }
`;

const chargeEnemy = keyframes`
  0% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 0 #f00); }
  50% { transform: scale(1.1); filter: brightness(1.5) drop-shadow(0 0 10px #f00); }
  100% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 5px #f00); }
`;

const slashEnemy = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); filter: brightness(1); }
  20% { transform: translate(-80px, -20px) rotate(-15deg); filter: brightness(1.5) drop-shadow(0 0 15px #f00); }
  40% { transform: translate(-150px, 0) rotate(0deg); filter: brightness(2) drop-shadow(0 0 20px #f00); }
  60% { transform: translate(-80px, 20px) rotate(15deg); filter: brightness(1.5); }
  100% { transform: translate(0, 0) rotate(0deg); filter: brightness(1); }
`;

const hitShake = keyframes`
  0% { transform: translate(0, 0); }
  25% { transform: translate(-5px, 5px); }
  50% { transform: translate(5px, -5px); }
  75% { transform: translate(-5px, 5px); }
  100% { transform: translate(0, 0); }
`;

const hitGlow = keyframes`
  0% { filter: brightness(1) drop-shadow(0 0 0 #fff); }
  50% { filter: brightness(1.5) drop-shadow(0 0 20px #fff); }
  100% { filter: brightness(1) drop-shadow(0 0 0 #fff); }
`;

const faint = keyframes`
  0% { transform: translate(0, 0) scale(1); opacity: 1; filter: brightness(1); }
  50% { transform: translate(0, 40px) scale(0.9); opacity: 0.5; filter: brightness(0.7) grayscale(50%); }
  100% { transform: translate(0, 80px) scale(0.7); opacity: 0; filter: brightness(0.5) grayscale(100%); }
`;

const criticalHit = keyframes`
  0% { transform: scale(1); filter: brightness(1); }
  20% { transform: scale(1.3); filter: brightness(2) drop-shadow(0 0 25px #ff0); }
  40% { transform: scale(1.1); filter: brightness(1.5); }
  60% { transform: scale(1.4); filter: brightness(2.5) drop-shadow(0 0 20px #ff0); }
  100% { transform: scale(1); filter: brightness(1); }
`;

const dodgeAura = keyframes`
  0% { filter: brightness(1) drop-shadow(0 0 5px rgba(0, 255, 0, 0.5)); }
  50% { filter: brightness(1.2) drop-shadow(0 0 15px rgba(0, 255, 0, 0.8)); }
  100% { filter: brightness(1) drop-shadow(0 0 5px rgba(0, 255, 0, 0.5)); }
`;

const battleStart = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
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

// Battle Styles
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
  alignItems: "center",
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
  padding: "0 40px",
  flex: 1,
});

const PokemonBattleWrapper = styled("div")<{
  isAttacking: "player" | "enemy" | "faint" | "critical" | "dodge" | "charge" | "slash" | null;
  isFainted: boolean;
  isDodging: boolean;
}>(({ isAttacking, isFainted, isDodging }) => ({
  position: "relative",
  transition: "transform 0.1s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  "&:first-of-type": { // Pemain
    ...(isAttacking === "charge" && {
      animation: `${chargePlayer} 0.5s ease-in-out`,
    }),
    ...(isAttacking === "slash" && {
      animation: `${slashPlayer} 1s ease-in-out`,
    }),
    ...(isAttacking === "player" && !isFainted && { // Pemain diserang
      animation: `${hitShake} 0.3s ease-in-out, ${hitGlow} 0.5s ease-in-out`,
    }),
    ...(isAttacking === "faint" && isFainted && {
      animation: `${faint} 1s ease-in-out forwards`,
    }),
    ...(isAttacking === "critical" && !isFainted && {
      animation: `${criticalHit} 1s ease-in-out`,
    }),
    ...(isAttacking === "dodge" && !isFainted && {
      animation: `${dodgeAura} 1s ease-in-out`,
    }),
    ...(isDodging && !isAttacking && {
      animation: `${dodgeAura} 1.5s infinite ease-in-out`,
    }),
  },
  "&:last-of-type": { // Musuh
    ...(isAttacking === "charge" && {
      animation: `${chargeEnemy} 0.5s ease-in-out`,
    }),
    ...(isAttacking === "slash" && {
      animation: `${slashEnemy} 1s ease-in-out`,
    }),
    ...(isAttacking === "enemy" && !isFainted && { // Musuh diserang
      animation: `${hitShake} 0.3s ease-in-out, ${hitGlow} 0.5s ease-in-out`,
    }),
    ...(isAttacking === "faint" && isFainted && {
      animation: `${faint} 1s ease-in-out forwards`,
    }),
    ...(isAttacking === "critical" && !isFainted && {
      animation: `${criticalHit} 1s ease-in-out`,
    }),
    ...(isAttacking === "dodge" && !isFainted && {
      animation: `${dodgeAura} 1s ease-in-out`,
    }),
  },
  "&::after": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "20px",
    bottom: "-10px",
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: "50%",
    filter: "blur(5px)",
    zIndex: -1,
  },
}));

const BattleLog = styled("div")({
  width: "100%",
  maxWidth: "800px",
  maxHeight: "150px",
  overflowY: "auto",
  background: "rgba(0, 0, 0, 0.8)",
  border: "4px solid #fff",
  borderRadius: "10px",
  padding: "15px",
  margin: "20px 0",
  boxShadow: "0 0 15px rgba(255,255,255,0.3)",
  textAlign: "center",
});

const BattleControls = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "20px",
  background: "rgba(0, 0, 0, 0.6)",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(255,255,255,0.2)",
  alignItems: "center",
});

const MobileControls = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  justifyContent: "center",
  marginTop: "10px",
});

// Pokémon Selection Styles
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
  BattleLog,
  BattleControls,
  MobileControls,
  PokemonBattleWrapper,
  PokemonSelectionModal,
  PokemonSelectionGrid,
  PokemonCard,
};