/* eslint-disable react-hooks/exhaustive-deps */
import toast from "react-hot-toast";
import styled from "@emotion/styled";
import { useParams, Link } from "react-router-dom";
import { clearTimeout, setTimeout } from "worker-timers";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FormEvent, ChangeEvent, useEffect, useState, createRef, useRef } from "react";
import { Joystick } from "react-joystick-component";

import { useGlobalContext } from "../../context";
import { generatePokeSummary } from "../../helpers";
import { IPokemonDetailResponse } from "../../types/pokemon";
import { Button, Navbar, Text, Loading, TypeCard, Input, Modal } from "../../components";

import "react-lazy-load-image-component/src/effects/blur.css";
import * as T from "./index.style";
import { getDetailPokemon } from "../../services/pokemon";

// Tipe kustom untuk ScreenOrientation dengan lock dan unlock
interface CustomScreenOrientation {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => Promise<void>;
  type: string;
  angle: number;
  onchange?: ((this: ScreenOrientation, ev: Event) => any) | null;
}

type TypesPokemon = { type: { name: string } };
type MovesPokemon = { move: { name: string } };

interface Stat {
  base_stat: number;
  stat: { name: string };
}

interface MyPokemon {
  name: string;
  nickname: string;
  sprite: string;
  stats?: Stat[];
  types?: string[];
}

const PokemonAvatar = styled(LazyLoadImage)`
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

const HealthBar = styled("div")<{ hp: number; maxHP: number }>`
  width: 200px;
  height: 25px;
  background: #ddd;
  border: 3px solid #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin: 15px auto;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.3);

  &::after {
    content: '';
    display: block;
    width: ${({ hp, maxHP }) => (hp / maxHP) * 100}%;
    height: 100%;
    background: ${({ hp, maxHP }) => (hp / maxHP > 0.5 ? "#4caf50" : hp / maxHP > 0.2 ? "#ff9800" : "#f44336")};
    transition: width 0.5s ease-in-out;
  }

  @media (max-width: 768px) {
    width: 120px;
    height: 20px;
  }
`;

const DetailPokemon = () => {
  const { name = "" } = useParams();
  const { setState } = useGlobalContext();
  const navRef = createRef<HTMLDivElement>();

  const catchPokemonTimeout = useRef<NodeJS.Timeout | number>(0);
  const throwBallTimeout = useRef<NodeJS.Timeout | number>(0);
  const enemyMoveTimeout = useRef<NodeJS.Timeout | number>(0);

  const [sprite, setSprite] = useState<string>("");
  const [types, setTypes] = useState<string[]>([]);
  const [moves, setMoves] = useState<string[]>([]);
  const [nickname, setNickname] = useState<string>("");
  const [navHeight, setNavHeight] = useState<number>(0);
  const [stats, setStats] = useState<Stat[]>([]);
  const [abilities, setAbilities] = useState<IPokemonDetailResponse["abilities"]>([]);

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isCaught, setIsCaught] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCatching, setIsCatching] = useState<boolean>(false);
  const [isEndPhase, setIsEndPhase] = useState<boolean>(false);
  const [nicknameModal, setNicknameModal] = useState<boolean>(false);
  const [nicknameIsValid, setNicknameIsValid] = useState<boolean>(true);

  const [isFighting, setIsFighting] = useState<boolean>(false);
  const [playerPokemon, setPlayerPokemon] = useState<MyPokemon | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [enemyHP, setEnemyHP] = useState<number>(0);
  const [playerHP, setPlayerHP] = useState<number>(0);
  const [enemyMaxHP, setEnemyMaxHP] = useState<number>(0);
  const [playerMaxHP, setPlayerMaxHP] = useState<number>(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [isAttacking, setIsAttacking] = useState<"player" | "enemy" | "faint" | "critical" | "dodge" | "charge" | "slash" | null>(null);
  const [showPokemonSelection, setShowPokemonSelection] = useState<boolean>(false);
  const [myPokemons, setMyPokemons] = useState<MyPokemon[]>([]);
  const [playerPosition, setPlayerPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [enemyPosition, setEnemyPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isDodging, setIsDodging] = useState<boolean>(false);
  const [showBattleIntro, setShowBattleIntro] = useState<boolean>(true); // State untuk intro chat
  const [currentChatIndex, setCurrentChatIndex] = useState<number>(0); // Index chat saat ini

  const typeEffectiveness: { [key: string]: { [key: string]: number } } = {
    fire: { grass: 2, water: 0.5, fire: 0.5, bug: 2, ice: 2 },
    water: { fire: 2, grass: 0.5, water: 0.5, rock: 2, ground: 2 },
    grass: { water: 2, fire: 0.5, grass: 0.5, rock: 2, ground: 2 },
    electric: { water: 2, flying: 2, ground: 0, electric: 0.5 },
    normal: { rock: 0.5, steel: 0.5 },
  };

  // Daftar chat untuk intro battle
  const battleIntroChats = [
    { speaker: "player", text: "Hey, wild Pokémon! Ready to face me?" },
    { speaker: "enemy", text: "Bring it on! I won’t go down easily!" },
    { speaker: "player", text: "Alright, let’s see who’s stronger!" },
  ];

  async function loadPokemon() {
    try {
      setIsLoading(true);
      const response = await getDetailPokemon(name);
      setTypes(response?.types.map((type: TypesPokemon) => type.type?.name));
      setMoves(response?.moves.map((move: MovesPokemon) => move.move?.name));
      setSprite(
        response?.sprites.versions?.["generation-v"]?.["black-white"].animated.front_default ||
          response?.sprites.front_default,
      );
      setStats(response?.stats as Stat[]);
      setAbilities(response?.abilities);
      const hpStat = response?.stats.find((stat: Stat) => stat.stat.name === "hp");
      setEnemyHP(hpStat?.base_stat || 100);
      setEnemyMaxHP(hpStat?.base_stat || 100);
      setIsLoading(false);
    } catch (error) {
      toast("Oops!. Fail get pokemons. Please try again!");
      setIsLoading(false);
      console.error({ error });
    }
  }

  async function loadMyPokemons() {
    const collection = JSON.parse(localStorage.getItem("pokegames@myPokemon") || "[]");
    const detailedPokemons = await Promise.all(
      collection.map(async (poke: MyPokemon) => {
        const response = await getDetailPokemon(poke.name.toLowerCase());
        return {
          ...poke,
          stats: response.stats as Stat[],
          types: response.types.map((t: TypesPokemon) => t.type.name),
        };
      }),
    );
    setMyPokemons(detailedPokemons);
  }

  const lockOrientation = async () => {
    if (window.innerWidth <= 1024 && "screen" in window && "orientation" in window.screen) {
      const orientation = window.screen.orientation as unknown as CustomScreenOrientation;
      try {
        if (orientation.lock) {
          await orientation.lock("landscape");
        }
      } catch (err) {
        toast.error("Please rotate your device to landscape mode for the best battle experience!");
        console.error("Orientation lock failed:", err);
      }
    }
  };

  const unlockOrientation = async () => {
    if (window.innerWidth <= 1024 && "screen" in window && "orientation" in window.screen) {
      const orientation = window.screen.orientation as unknown as CustomScreenOrientation;
      try {
        if (orientation.unlock) {
          await orientation.unlock();
        }
      } catch (err) {
        console.error("Orientation unlock failed:", err);
      }
    }
  };

  const selectPokemonForBattle = (pokemon: MyPokemon) => {
    setPlayerPokemon(pokemon);
    const hpStat = pokemon.stats?.find((stat) => stat.stat.name === "hp");
    setPlayerHP(hpStat?.base_stat || 100);
    setPlayerMaxHP(hpStat?.base_stat || 100);
    setShowPokemonSelection(false);
    setIsFighting(true);
    setBattleLog(["Battle started!"]);
    setIsPlayerTurn(true);
    setIsAttacking(null);
    setPlayerPosition({ x: 0, y: 0 });
    setEnemyPosition({ x: 0, y: 0 });
    setShowBattleIntro(true); // Tampilkan intro chat
    setCurrentChatIndex(0); // Mulai dari chat pertama
    lockOrientation();
  };

  // Logika untuk menampilkan chat secara berurutan
  useEffect(() => {
    if (showBattleIntro && isFighting) {
      const timer = setTimeout(() => {
        if (currentChatIndex < battleIntroChats.length - 1) {
          setCurrentChatIndex((prev) => prev + 1);
        } else {
          setShowBattleIntro(false); // Selesai menampilkan chat, mulai battle
        }
      }, 2000); // Setiap chat muncul selama 2 detik
      return () => clearTimeout(timer);
    }
  }, [showBattleIntro, currentChatIndex, isFighting]);

  const calculateDamage = (
    attackerStats: Stat[],
    defenderStats: Stat[],
    attackerType: string,
    defenderType: string,
  ) => {
    const attack = attackerStats.find((stat) => stat.stat.name === "attack")?.base_stat || 50;
    const defense = defenderStats.find((stat) => stat.stat.name === "defense")?.base_stat || 50;
    const speed = attackerStats.find((stat) => stat.stat.name === "speed")?.base_stat || 50;

    let effectiveness = 1;
    if (typeEffectiveness[attackerType]?.[defenderType]) {
      effectiveness = typeEffectiveness[attackerType][defenderType];
    }

    const basePower = 40;
    const damage = Math.floor(((attack / defense) * basePower * effectiveness) + speed / 20);
    const variance = Math.floor(Math.random() * 10 - 5);
    const isCritical = Math.random() < 0.1;
    const finalDamage = isCritical ? damage * 2 : damage + variance;
    return Math.max(10, finalDamage);
  };

  const handlePlayerAttack = async () => {
    if (!isPlayerTurn || isAttacking || !playerPokemon) return;

    setIsAttacking("charge");
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAttacking("slash");
    const damage = calculateDamage(playerPokemon.stats!, stats, playerPokemon.types![0], types[0]);
    const isCritical = damage > calculateDamage(playerPokemon.stats!, stats, playerPokemon.types![0], types[0]) * 1.5;

    const newEnemyHP = Math.max(0, enemyHP - damage);
    setEnemyHP(newEnemyHP);
    setBattleLog((prev) => [
      ...prev,
      `Your ${playerPokemon.nickname} dealt ${damage} damage!${isCritical ? " Critical hit!" : ""}`,
    ]);

    if (isCritical) {
      setIsAttacking("critical");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (newEnemyHP <= 0) {
      setIsAttacking("faint");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setBattleLog((prev) => [...prev, `Wild ${name.toUpperCase()} fainted!`]);
      toast.success("You defeated the wild Pokémon! Now you can try to catch it!");
      closeBattle();
    } else {
      setIsAttacking("enemy");
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsAttacking(null);
      setIsPlayerTurn(false);
    }
  };

  const handleEnemyAttack = async () => {
    if (isPlayerTurn || isAttacking || !playerPokemon) return;

    setIsAttacking("charge");
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAttacking("slash");
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (isDodging) {
      setIsAttacking("dodge");
      setBattleLog((prev) => [...prev, `Your ${playerPokemon.nickname} dodged the attack!`]);
    } else {
      const damage = calculateDamage(stats, playerPokemon.stats!, types[0], playerPokemon.types![0]);
      const isCritical = damage > calculateDamage(stats, playerPokemon.stats!, types[0], playerPokemon.types![0]) * 1.5;
      const newPlayerHP = Math.max(0, playerHP - damage);
      setPlayerHP(newPlayerHP);
      setBattleLog((prev) => [
        ...prev,
        `${name.toUpperCase()} dealt ${damage} damage!${isCritical ? " Critical hit!" : ""}`,
      ]);

      if (isCritical) {
        setIsAttacking("critical");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (newPlayerHP <= 0) {
        setIsAttacking("faint");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setBattleLog((prev) => [...prev, `Your ${playerPokemon.nickname} fainted!`]);
        toast.error("Your Pokémon fainted!");
        closeBattle();
      } else {
        setIsAttacking("player");
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsAttacking(null);
    if (playerHP > 0) setIsPlayerTurn(true);
  };

  useEffect(() => {
    if (!isFighting || isAttacking || showBattleIntro) return;

    const moveEnemy = () => {
      const randomMove = Math.random();
      const step = 50;
      if (randomMove < 0.3) {
        setEnemyPosition((prev) => ({ ...prev, x: Math.max(prev.x - step, -500) }));
      } else if (randomMove < 0.6) {
        setEnemyPosition((prev) => ({ ...prev, x: Math.min(prev.x + step, 500) }));
      }
      if (!isPlayerTurn && Math.random() < 0.2 && enemyHP > 0) {
        handleEnemyAttack();
      }
    };

    enemyMoveTimeout.current = setInterval(moveEnemy, 1000);
    return () => clearInterval(enemyMoveTimeout.current as number);
  }, [isFighting, isAttacking, isPlayerTurn, enemyHP, showBattleIntro]);

  const startBattle = () => {
    if (myPokemons.length === 0) {
      toast.error("You need to catch at least one Pokémon first! Catch up to 3 Pokémon to start battling.");
      return;
    }
    setShowPokemonSelection(true);
  };

  const closeBattle = () => {
    setIsFighting(false);
    setIsAttacking(null);
    setBattleLog([]);
    setEnemyHP(enemyMaxHP);
    setPlayerHP(playerMaxHP);
    setPlayerPosition({ x: 0, y: 0 });
    setEnemyPosition({ x: 0, y: 0 });
    setIsDodging(false);
    setIsPlayerTurn(true);
    setShowBattleIntro(false);
    unlockOrientation();
  };

  const handleJoystickMove = (event: any) => {
    if (isAttacking) return;
    setPlayerPosition((prev) => ({
      x: Math.min(Math.max(prev.x + event.x * 5, -500), 500),
      y: prev.y,
    }));
    if (event.y < -0.5 && !isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }
  };

  const handleJoystickStop = () => {};

  const handleDodge = () => {
    if (isAttacking) return;
    setIsDodging(true);
    setTimeout(() => setIsDodging(false), 1000);
  };

  async function catchPokemon() {
    if (catchPokemonTimeout.current) clearTimeout(catchPokemonTimeout.current as number);
    return new Promise((resolve) => {
      catchPokemonTimeout.current = setTimeout(() => {
        resolve(Math.random() < 0.5 ? false : true);
      }, 2000);
    });
  }

  async function throwPokeball() {
    const currentCollection = JSON.parse(localStorage.getItem("pokegames@myPokemon") || "[]");
    
    if (currentCollection.length < 3) {
      setIsCatching(true);
      const isCaught = await catchPokemon();
      setIsCatching(false);
      setIsEndPhase(true);

      if (isCaught) {
        setIsCaught(true);
      } else {
        setIsCaught(false);
      }

      if (throwBallTimeout.current) clearTimeout(throwBallTimeout.current as number);
      throwBallTimeout.current = setTimeout(() => {
        setIsEndPhase(false);
        if (isCaught) setNicknameModal(true);
      }, 1200);
    } else if (enemyHP > 0) {
      toast.error("You must defeat the Pokémon first! You've caught your initial 3 Pokémon.");
      return;
    } else {
      setIsCatching(true);
      const isCaught = await catchPokemon();
      setIsCatching(false);
      setIsEndPhase(true);

      if (isCaught) {
        setIsCaught(true);
      } else {
        setIsCaught(false);
      }

      if (throwBallTimeout.current) clearTimeout(throwBallTimeout.current as number);
      throwBallTimeout.current = setTimeout(() => {
        setIsEndPhase(false);
        if (isCaught) setNicknameModal(true);
      }, 1200);
    }
  }

  async function onNicknameSave(e: FormEvent) {
    e.preventDefault();
    const currentCollection = localStorage.getItem("pokegames@myPokemon");
    const parsed: MyPokemon[] = JSON.parse(currentCollection!) || [];

    let isUnique = true;
    for (const collection of parsed) {
      if (collection.nickname === nickname) {
        setNicknameIsValid(false);
        isUnique = false;
        return;
      } else {
        !nicknameIsValid && setNicknameIsValid(true);
        isUnique = true;
      }
    }

    if (isUnique) {
      parsed.push({ name: name!.toUpperCase(), nickname, sprite });
      localStorage.setItem("pokegames@myPokemon", JSON.stringify(parsed));
      setState({ pokeSummary: generatePokeSummary(parsed) });
      setIsSaved(true);
      await loadMyPokemons();
    }
  }

  useEffect(() => {
    setNavHeight(navRef.current?.clientHeight as number);
    loadPokemon();
    loadMyPokemons();
    return () => {
      setTypes([]);
      setMoves([]);
      setStats([]);
      setSprite("");
      setAbilities([]);
      unlockOrientation();
    };
  }, []);

  useEffect(() => {
    document.title = `Pokegames - ${name?.toUpperCase()}`;
    return () => {
      document.title = "Pokegames";
    };
  }, []);

  useEffect(() => {
    window.scroll({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <Modal open={showPokemonSelection} overlay="light">
        <T.PokemonSelectionModal>
          <Text as="h2" variant="outlined" size="lg">
            Choose Your Pokémon
          </Text>
          <T.PokemonSelectionGrid>
            {myPokemons.map((pokemon) => (
              <T.PokemonCard
                key={pokemon.nickname}
                onClick={() => selectPokemonForBattle(pokemon)}
              >
                <PokemonAvatar src={pokemon.sprite} alt={pokemon.nickname} width={100} height={100} />
                <Text>{pokemon.nickname}</Text>
              </T.PokemonCard>
            ))}
          </T.PokemonSelectionGrid>
        </T.PokemonSelectionModal>
      </Modal>

      {isFighting && (
        <T.BattleModal>
          {showBattleIntro ? (
            <T.BattleIntroContainer>
              <T.PokemonBattleWrapper
                isAttacking={null}
                isFainted={false}
                isDodging={false}
                style={{ transform: `translate(${playerPosition.x}px, ${playerPosition.y}px)` }}
              >
                <PokemonAvatar
                  src={playerPokemon?.sprite}
                  alt={playerPokemon?.nickname || "Your Pokémon"}
                  width={window.innerWidth <= 1024 ? 150 : 300}
                  height={window.innerWidth <= 1024 ? 150 : 300}
                />
                {battleIntroChats[currentChatIndex].speaker === "player" && (
                  <T.ChatBubble side="left">
                    <Text variant="outlined">{battleIntroChats[currentChatIndex].text}</Text>
                  </T.ChatBubble>
                )}
              </T.PokemonBattleWrapper>
              <T.PokemonBattleWrapper
                isAttacking={null}
                isFainted={false}
                isDodging={false}
                style={{ transform: `translate(${enemyPosition.x}px, ${enemyPosition.y}px)` }}
              >
                <PokemonAvatar
                  src={sprite}
                  alt={`Wild ${name}`}
                  width={window.innerWidth <= 1024 ? 150 : 300}
                  height={window.innerWidth <= 1024 ? 150 : 300}
                />
                {battleIntroChats[currentChatIndex].speaker === "enemy" && (
                  <T.ChatBubble side="right">
                    <Text variant="outlined">{battleIntroChats[currentChatIndex].text}</Text>
                  </T.ChatBubble>
                )}
              </T.PokemonBattleWrapper>
            </T.BattleIntroContainer>
          ) : (
            <>
              <T.BattleContainer>
                <T.PokemonBattleWrapper
                  isAttacking={isAttacking}
                  isFainted={playerHP <= 0}
                  isDodging={isDodging}
                  style={{ transform: `translate(${playerPosition.x}px, ${isJumping ? -50 : playerPosition.y}px)` }}
                >
                  <Text variant="outlined" size="lg">{playerPokemon?.nickname || "Your Pokémon"}</Text>
                  <HealthBar hp={playerHP} maxHP={playerMaxHP} />
                  <PokemonAvatar 
                    src={playerPokemon?.sprite} 
                    alt={playerPokemon?.nickname || "Your Pokémon"} 
                    width={window.innerWidth <= 1024 ? 150 : 300} 
                    height={window.innerWidth <= 1024 ? 150 : 300} 
                  />
                </T.PokemonBattleWrapper>
                <T.PokemonBattleWrapper
                  isAttacking={isAttacking}
                  isFainted={enemyHP <= 0}
                  isDodging={false}
                  style={{ transform: `translate(${enemyPosition.x}px, ${enemyPosition.y}px)` }}
                >
                  <Text variant="outlined" size="lg">Wild {name.toUpperCase()}</Text>
                  <HealthBar hp={enemyHP} maxHP={enemyMaxHP} />
                  <PokemonAvatar 
                    src={sprite} 
                    alt={`Wild ${name}`} 
                    width={window.innerWidth <= 1024 ? 150 : 300} 
                    height={window.innerWidth <= 1024 ? 150 : 300} 
                  />
                </T.PokemonBattleWrapper>
              </T.BattleContainer>
              <T.BattleLog>
                {battleLog.map((log, index) => (
                  <Text key={index} variant="outlined">{log}</Text>
                ))}
              </T.BattleLog>
              <T.BattleControls>
                <Text variant="outlined">
                  Use joystick to move/jump, buttons to attack/dodge
                </Text>
                <T.MobileControls>
                  <Joystick
                    size={80}
                    baseColor="#333"
                    stickColor="#fff"
                    move={handleJoystickMove}
                    stop={handleJoystickStop}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <Button 
                      onClick={() => isPlayerTurn && enemyHP > 0 && handlePlayerAttack()} 
                      size="lg" 
                      style={{ width: "120px" }}
                    >
                      Attack
                    </Button>
                    <Button 
                      onClick={handleDodge} 
                      size="lg" 
                      style={{ width: "120px" }}
                    >
                      Dodge
                    </Button>
                    <Button 
                      variant="light" 
                      onClick={closeBattle} 
                      size="lg" 
                      style={{ width: "120px" }}
                    >
                      Exit
                    </Button>
                  </div>
                </T.MobileControls>
              </T.BattleControls>
            </>
          )}
        </T.BattleModal>
      )}

      <Modal open={isCatching}>
        <T.CatchingModal>
          <T.ImageContainer>
            <PokemonAvatar 
              src={sprite} 
              alt={name} 
              width={window.innerWidth <= 768 ? 200 : 320} 
              height={window.innerWidth <= 768 ? 200 : 320} 
              effect="blur" 
              loading="lazy" 
              className="pokemon-dt" 
            />
          </T.ImageContainer>
          <div style={{ display: "grid", placeItems: "center" }}>
            <LazyLoadImage className="pokeball" src="/static/pokeball.png" alt="pokeball" width={128} height={128} />
            <Text variant="outlined" size="xl">Catching...</Text>
          </div>
        </T.CatchingModal>
      </Modal>

      {isEndPhase && (
        <>
          <Modal open={!isCaught} overlay="error">
            <T.PostCatchModal>
              <T.ImageContainer>
                <LazyLoadImage 
                  src={sprite} 
                  alt={name} 
                  width={window.innerWidth <= 768 ? 200 : 320} 
                  height={window.innerWidth <= 768 ? 200 : 320} 
                  effect="blur" 
                  loading="lazy" 
                  className="pokemon-dt" 
                />
              </T.ImageContainer>
              <LazyLoadImage src="/static/pokeball.png" alt="pokeball" width={128} height={128} />
              <Text variant="outlined" size="xl">Oh no, {name?.toUpperCase()} broke free</Text>
            </T.PostCatchModal>
          </Modal>
          <Modal open={isCaught} overlay="light">
            <T.PostCatchModal>
              <T.ImageContainer>
                <PokemonAvatar 
                  src={sprite} 
                  alt={name} 
                  width={window.innerWidth <= 768 ? 200 : 320} 
                  height={window.innerWidth <= 768 ? 200 : 320} 
                  effect="blur" 
                  loading="lazy" 
                  className="pokemon-dt" 
                />
              </T.ImageContainer>
              <LazyLoadImage src="/static/pokeball.png" alt="pokeball" width={128} height={128} />
              <Text variant="outlined" size="xl">Gotcha! {name?.toUpperCase()} was caught!</Text>
            </T.PostCatchModal>
          </Modal>
        </>
      )}

      <Modal open={nicknameModal} overlay="light" solid>
        <T.NicknamingModal>
          <T.ImageContainer>
            <PokemonAvatar 
              src={sprite} 
              alt={name} 
              width={window.innerWidth <= 768 ? 200 : 320} 
              height={window.innerWidth <= 768 ? 200 : 320} 
              effect="blur" 
              loading="lazy" 
              className="pokemon-dt" 
            />
          </T.ImageContainer>
          {!isSaved ? (
            <T.NicknamingForm onSubmit={onNicknameSave}>
              {nicknameIsValid ? (
                <div className="pxl-border" style={{ textAlign: "left" }}>
                  <Text>Congratulations!</Text>
                  <Text>You just caught a {name?.toUpperCase()}</Text>
                  <br />
                  <Text>Now please give {name?.toUpperCase()} a nickname...</Text>
                </div>
              ) : (
                <div className="pxl-border" style={{ textAlign: "left" }}>
                  <Text variant="error">Nickname is taken</Text>
                  <Text>Please pick another nickname...</Text>
                </div>
              )}
              <Input
                required
                placeholder="enter a nickname"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNickname(e.target.value.toUpperCase())}
              />
              <Button type="submit">Save</Button>
            </T.NicknamingForm>
          ) : (
            <T.AnotherWrapper>
              <div className="pxl-border" style={{ textAlign: "left" }}>
                <Text>Whoosh! {nickname} is now in your Pokemon list</Text>
              </div>
              <Link to="/my-pokemon">
                <Button variant="light">See My Pokemon</Button>
              </Link>
              <Link to="/pokemons">
                <Button>Catch Another</Button>
              </Link>
            </T.AnotherWrapper>
          )}
        </T.NicknamingModal>
      </Modal>

      <T.Page style={{ marginBottom: navHeight }}>
        <LazyLoadImage
          id="pokeball-bg"
          src="/static/pokeball-transparent.png"
          alt="pokeball background"
          width={512}
          height={512}
        />
        <T.PokeName>
          <div />
          <div />
          <div />
          <Text as="h1" variant="outlined" size="xl">{name}</Text>
        </T.PokeName>
        <T.PokemonContainer>
          <div className="pxl-border card-pxl">
            <Text as="h4" variant="outlined" size="lg">Pokemon Stats:</Text>
            <T.PokemonStatsWrapper>
              {stats?.map((stat, index) => (
                <Text as="h4" key={index} variant="outlined" size="base">
                  {stat.stat.name} : {stat.base_stat}
                </Text>
              ))}
            </T.PokemonStatsWrapper>
          </div>
          <div className="img-pokemon" style={{ display: "flex", justifyContent: "center" }}>
            {!isLoading ? (
              <PokemonAvatar 
                src={sprite} 
                alt={name} 
                width={window.innerWidth <= 768 ? 150 : 256} 
                height={window.innerWidth <= 768 ? 150 : 256} 
                effect="blur" 
                loading="lazy" 
                className="pokemon-dt" 
              />
            ) : (
              <T.ImageLoadingWrapper>
                <Loading />
              </T.ImageLoadingWrapper>
            )}
          </div>
        </T.PokemonContainer>

        <T.Content style={{ marginTop: "30px" }}>
          <T.AbilitiesWrapper>
            <div className="pxl-type">
              <Text as="h3">Type</Text>
              {!isLoading ? (
                types.map((type: string, index: number) => <TypeCard key={index} type={type} />)
              ) : (
                <T.DescriptionLoadingWrapper>
                  <Loading label="Loading types..." />
                </T.DescriptionLoadingWrapper>
              )}
            </div>
            <div className="pxl-abilities">
              <Text as="h3">Abilities</Text>
              {!isLoading ? (
                abilities.map((ability, index) => (
                  <TypeCard key={index} type={ability.ability?.name} />
                ))
              ) : (
                <T.DescriptionLoadingWrapper>
                  <Loading label="Loading abilities..." />
                </T.DescriptionLoadingWrapper>
              )}
            </div>
          </T.AbilitiesWrapper>
          <div>
            <Text as="h3">Moves</Text>
            {!isLoading ? (
              <T.Grid>
                {moves.map((move: string, index: number) => (
                  <div key={index} className="pxl-border" style={{ marginBottom: 16, marginRight: 16 }}>
                    <Text>{move}</Text>
                  </div>
                ))}
              </T.Grid>
            ) : (
              <T.DescriptionLoadingWrapper>
                <Loading label="Loading moves..." />
                </T.DescriptionLoadingWrapper>
            )}
          </div>
        </T.Content>
      </T.Page>

      <Navbar ref={navRef} fadeHeight={224}>
        {!isLoading && (
          <div style={{ display: "flex", gap: "16px" }}>
            <Button variant="dark" onClick={startBattle} size="lg" disabled={isFighting}>
              Fight
            </Button>
            <Button
              variant="dark"
              onClick={throwPokeball}
              size="xl"
              icon="/static/pokeball.png"
              disabled={isFighting || (myPokemons.length >= 3 && enemyHP > 0)}
            >
              Catch
            </Button>
          </div>
        )}
      </Navbar>
    </>
  );
};

export default DetailPokemon;