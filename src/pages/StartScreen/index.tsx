import React from "react";
import { useNavigate } from "react-router-dom";

import { Text, Button } from "../../components";

import * as T from "./index.style";

const StartScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <T.Container>
      <T.Centering>
        <Text as="h1" variant="outlined" size="xl">
          POKEDEX
        </Text>
        <Button onClick={() => navigate("/pokemons")} variant="light">
          Press Start
        </Button>
        <Text variant="outlined" size="base">
          CA : (PoketD63fMajHA8Vf9QHfwRjnUHyx1Ry4apV8JvJtjD){" "}
        </Text>
      </T.Centering>
      <div
        style={{
          position: "absolute",
          bottom: 18,
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}>
        <Text variant="outlined">&copy;{new Date().getFullYear()} Pokemon On Sol Team</Text>
        <Text variant="outlined">
          | FIND US ON PUMP?{" "}
          <T.A href="" target="_blank">
            PUMPFUN
          </T.A>
        </Text>
      </div>
    </T.Container>
  );
};

export default StartScreen;
