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
  position: relative;
  z-index: 10;
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

const EffectImage = styled(LazyLoadImage)<{ isHitEffect?: boolean }>`
  position: absolute;
  width: ${({ isHitEffect }) => (isHitEffect ? (window.innerWidth <= 1024 ? "225px" : "450px") : (window.innerWidth <= 1024 ? "150px" : "300px"))};
  height: ${({ isHitEffect }) => (isHitEffect ? (window.innerWidth <= 1024 ? "225px" : "450px") : (window.innerWidth <= 1024 ? "150px" : "300px"))};
  z-index: ${({ isHitEffect }) => (isHitEffect ? "15" : "5")};
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
  const [enemyHP, setEnemyHP] = useState<number>(0);
  const [playerHP, setPlayerHP] = useState<number>(0);
  const [enemyMaxHP, setEnemyMaxHP] = useState<number>(0);
  const [playerMaxHP, setPlayerMaxHP] = useState<number>(0);
  const [isAttacking, setIsAttacking] = useState<"player" | "enemy" | "faint" | "dodge" | "charge" | "slash" | "quick" | "heavy" | null>(null);
  const [attackCooldown, setAttackCooldown] = useState<boolean>(false);
  const [enemyAttackCooldown, setEnemyAttackCooldown] = useState<boolean>(false);
  const [dodgeCooldown, setDodgeCooldown] = useState<boolean>(false);
  const [comboCount, setComboCount] = useState<number>(0);
  const [showPokemonSelection, setShowPokemonSelection] = useState<boolean>(false);
  const [myPokemons, setMyPokemons] = useState<MyPokemon[]>([]);
  const [playerPosition, setPlayerPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [enemyPosition, setEnemyPosition] = useState<{ x: number; y: number }>({ x: 400, y: 0 });
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isDodging, setIsDodging] = useState<boolean>(false);
  const [showBattleIntro, setShowBattleIntro] = useState<boolean>(true);
  const [currentChatIndex, setCurrentChatIndex] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showAttackEffect, setShowAttackEffect] = useState<boolean>(false);
  const [showDodgeEffect, setShowDodgeEffect] = useState<boolean>(false);
  const [showHitEffectPlayer, setShowHitEffectPlayer] = useState<boolean>(false);
  const [showHitEffectEnemy, setShowHitEffectEnemy] = useState<boolean>(false);

  const typeEffectiveness: { [key: string]: { [key: string]: number } } = {
    fire: { grass: 2, water: 0.5, fire: 0.5, bug: 2, ice: 2 },
    water: { fire: 2, grass: 0.5, water: 0.5, rock: 2, ground: 2 },
    grass: { water: 2, fire: 0.5, grass: 0.5, rock: 2, ground: 2 },
    electric: { water: 2, flying: 2, ground: 0, electric: 0.5 },
    normal: { rock: 0.5, steel: 0.5 },
  };

  const battleIntroChats = [
    { speaker: "player", text: "Hey, wild Pokémon! Ready to face me?" },
    { speaker: "enemy", text: "Bring it on! I won’t go down easily!" },
    { speaker: "player", text: "Alright, let’s see who’s stronger!" },
  ];

  const tutorialMessage = "Move with joystick (left), jump by pushing up, attack (A) or dodge (D) with buttons (right)!";
  const desktopTutorialMessage = "Use Arrow keys to move, A to attack, D to dodge, Escape to exit!";

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
      setEnemyHP((hpStat?.base_stat || 100) * 5);
      setEnemyMaxHP((hpStat?.base_stat || 100) * 5);
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
    setPlayerHP((hpStat?.base_stat || 100) * 3);
    setPlayerMaxHP((hpStat?.base_stat || 100) * 3);
    setShowPokemonSelection(false);
    setIsFighting(true);
    setIsAttacking(null);
    setPlayerPosition({ x: 0, y: 0 });
    setEnemyPosition({ x: 400, y: 0 });
    setShowBattleIntro(true);
    setCurrentChatIndex(0);
    lockOrientation();
  };

  useEffect(() => {
    if (showBattleIntro && isFighting) {
      const timer = setTimeout(() => {
        if (currentChatIndex < battleIntroChats.length - 1) {
          setCurrentChatIndex((prev) => prev + 1);
        } else {
          setShowBattleIntro(false);
          setShowTutorial(true);
          setTimeout(() => setShowTutorial(false), 3000);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showBattleIntro, currentChatIndex, isFighting]);

  const calculateDamage = (
    attackerStats: Stat[],
    defenderStats: Stat[],
    attackerType: string,
    defenderType: string,
    attackType: "normal" | "quick" | "heavy" = "normal",
    comboMultiplier: number = 1,
  ) => {
    const attack = attackerStats.find((stat) => stat.stat.name === "attack")?.base_stat || 50;
    const defense = defenderStats.find((stat) => stat.stat.name === "defense")?.base_stat || 50;
    const speed = attackerStats.find((stat) => stat.stat.name === "speed")?.base_stat || 50;

    let effectiveness = 1;
    if (typeEffectiveness[attackerType]?.[defenderType]) {
      effectiveness = typeEffectiveness[attackerType][defenderType];
    }

    const basePower = attackType === "quick" ? 20 : attackType === "heavy" ? 40 : 20;
    const damage = Math.floor(((attack / defense) * basePower * effectiveness * comboMultiplier) + speed / 40);
    const variance = Math.floor(Math.random() * 5 - 2);
    const finalDamage = damage + variance;
    return Math.max(5, finalDamage);
  };

  const handlePlayerAttack = async () => {
    if (attackCooldown || !playerPokemon || enemyHP <= 0) {
      console.log("Attack blocked:", { attackCooldown, playerPokemonExists: !!playerPokemon, enemyHP });
      return;
    }

    setAttackCooldown(true);
    setIsAttacking("slash");
    setShowAttackEffect(true);

    const comboMultiplier = comboCount >= 3 ? 1.5 : 1;
    const damage = calculateDamage(playerPokemon.stats!, stats, playerPokemon.types![0], types[0], "normal", comboMultiplier);
    const newEnemyHP = Math.max(0, enemyHP - damage);

    setEnemyHP(newEnemyHP);
    setComboCount((prev) => prev + 1);
    setPlayerPosition((prev) => ({ ...prev, x: Math.min(prev.x + 50, 500) }));
    setShowHitEffectEnemy(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (newEnemyHP <= 0) {
      setIsAttacking("faint");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("You defeated the wild Pokémon! Now you can try to catch it!");
      closeBattle();
    }

    setIsAttacking(null);
    setShowAttackEffect(false);
    setShowHitEffectEnemy(false);
    setAttackCooldown(false);
    setTimeout(() => setComboCount(0), 3000);
  };

  const handleEnemyAttack = async (attackType: "quick" | "heavy") => {
    if (!playerPokemon || playerHP <= 0 || enemyAttackCooldown) return;

    setEnemyAttackCooldown(true);
    setIsAttacking(attackType === "quick" ? "quick" : "heavy");
    setShowAttackEffect(true);

    await new Promise((resolve) => setTimeout(resolve, attackType === "quick" ? 200 : 500));
    setEnemyPosition((prev) => ({ ...prev, x: Math.max(prev.x - (attackType === "quick" ? 50 : 80), -500) }));

    if (isDodging) {
      setIsAttacking("dodge");
      setShowDodgeEffect(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setShowDodgeEffect(false);
    } else {
      const damage = calculateDamage(stats, playerPokemon.stats!, types[0], playerPokemon.types![0], attackType);
      const newPlayerHP = Math.max(0, playerHP - damage);
      setPlayerHP(newPlayerHP);
      setShowHitEffectPlayer(true);

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (newPlayerHP <= 0) {
        setIsAttacking("faint");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.error("Your Pokémon fainted!");
        closeBattle();
      }
    }

    setIsAttacking(null);
    setShowAttackEffect(false);
    setShowHitEffectPlayer(false);
    setEnemyAttackCooldown(false);
  };

  useEffect(() => {
    if (!isFighting || showBattleIntro || showTutorial) return;

    const moveEnemy = () => {
      const randomMove = Math.random();
      const step = 60;
      if (randomMove < 0.5) {
        setEnemyPosition((prev) => ({ ...prev, x: Math.max(prev.x - step, -500) }));
      } else if (randomMove < 0.9) {
        setEnemyPosition((prev) => ({ ...prev, x: Math.min(prev.x + step, 500) }));
      }

      const attackChance = Math.random();
      if (attackChance < 0.4 && enemyHP > 0) {
        handleEnemyAttack(attackChance < 0.2 ? "quick" : "heavy");
      }
    };

    enemyMoveTimeout.current = setInterval(moveEnemy, 600);
    return () => clearInterval(enemyMoveTimeout.current as number);
  }, [isFighting, showBattleIntro, showTutorial, enemyHP]);

  useEffect(() => {
    if (!isFighting || showBattleIntro || showTutorial) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          setPlayerPosition((prev) => ({
            ...prev,
            x: Math.max(prev.x - 10, -500),
          }));
          break;
        case "ArrowRight":
          setPlayerPosition((prev) => ({
            ...prev,
            x: Math.min(prev.x + 10, 500),
          }));
          break;
        case "ArrowUp":
          if (!isJumping) {
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 500);
          }
          break;
        case "a":
        case "A":
          handlePlayerAttack();
          break;
        case "d":
        case "D":
          handleDodge();
          break;
        case "Escape":
          closeBattle();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFighting, isAttacking, showBattleIntro, showTutorial]);

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
    setEnemyHP(enemyMaxHP);
    setPlayerHP(playerMaxHP);
    setIsDodging(false);
    setComboCount(0);
    setAttackCooldown(false);
    setEnemyAttackCooldown(false);
    setDodgeCooldown(false);
    setShowBattleIntro(false);
    setShowTutorial(false);
    setShowAttackEffect(false);
    setShowDodgeEffect(false);
    setShowHitEffectPlayer(false);
    setShowHitEffectEnemy(false);
    unlockOrientation();
  };

  const handleJoystickMove = (event: any) => {
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
    if (dodgeCooldown) return;
    setIsDodging(true);
    setDodgeCooldown(true);
    setShowDodgeEffect(true);
    setTimeout(() => {
      setIsDodging(false);
      setShowDodgeEffect(false);
    }, 500);
    setTimeout(() => setDodgeCooldown(false), 2500);
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
          <Button 
            variant="light" 
            onClick={closeBattle} 
            size="lg" 
            style={{ position: "absolute", top: "10px", left: "10px", padding: "4px 8px", fontSize: "12px" }}
          >
            Exit
          </Button>
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
                  style={{ transform: "scaleX(-1)" }}
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
                  {showDodgeEffect && (
                    <EffectImage
                      src="/static/dodge.png"
                      alt="dodge effect"
                      style={{ top: "0", left: "0", zIndex: 5 }}
                    />
                  )}
                  <PokemonAvatar 
                    src={playerPokemon?.sprite} 
                    alt={playerPokemon?.nickname || "Your Pokémon"} 
                    width={window.innerWidth <= 1024 ? 150 : 300} 
                    height={window.innerWidth <= 1024 ? 150 : 300}
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {showAttackEffect && isAttacking === "slash" && (
                    <EffectImage
                      src="/static/attack.png"
                      alt="attack effect"
                      style={{ top: "0", left: window.innerWidth <= 1024 ? "150px" : "300px" }}
                    />
                  )}
                  {showHitEffectPlayer && (
                    <EffectImage
                      src="/static/effect.png"
                      alt="hit effect"
                      isHitEffect={true}
                      style={{ top: window.innerWidth <= 1024 ? "-37.5px" : "-75px", left: window.innerWidth <= 1024 ? "-37.5px" : "-75px" }}
                    />
                  )}
                  {showTutorial && (
                    <T.ChatBubble side="left">
                      <Text variant="outlined">
                        {window.innerWidth < 1024 ? tutorialMessage : desktopTutorialMessage}
                      </Text>
                    </T.ChatBubble>
                  )}
                  {comboCount > 0 && (
                    <T.ComboText>Combo: {comboCount}x</T.ComboText>
                  )}
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
                  {showAttackEffect && (isAttacking === "quick" || isAttacking === "heavy") && (
                    <EffectImage
                      src="/static/attack.png"
                      alt="attack effect"
                      style={{ top: "0", left: window.innerWidth <= 1024 ? "-150px" : "-300px" }}
                    />
                  )}
                  {showHitEffectEnemy && (
                    <EffectImage
                      src="/static/effect.png"
                      alt="hit effect"
                      isHitEffect={true}
                      style={{ top: window.innerWidth <= 1024 ? "-37.5px" : "-75px", left: window.innerWidth <= 1024 ? "-37.5px" : "-75px" }}
                    />
                  )}
                </T.PokemonBattleWrapper>
              </T.BattleContainer>
              <T.BattleControls>
                <T.DesktopControls>
                  <Text variant="outlined">{desktopTutorialMessage}</Text>
                </T.DesktopControls>
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
                      onClick={handlePlayerAttack} 
                      size="lg" 
                      style={{ width: "120px" }}
                      disabled={attackCooldown}
                    >
                      {attackCooldown ? "Wait..." : "Attack"}
                    </Button>
                    <Button 
                      onClick={handleDodge} 
                      size="lg" 
                      style={{ width: "120px" }}
                      disabled={dodgeCooldown}
                    >
                      {dodgeCooldown ? "Wait..." : "Dodge"}
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