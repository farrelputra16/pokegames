import React, { useState, useEffect } from "react";
import axios from "axios";
import { IMyPokemon } from "../../types/pokemon";
import * as T from "./chatbot.style";

const apiKey = "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";
const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

interface PokemonChatbotProps {
  pokemons: IMyPokemon[];
}

const PokemonChatbot: React.FC<PokemonChatbotProps> = ({ pokemons }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false); // State untuk membuka/tutup chatbot
  const [selectedPokemon, setSelectedPokemon] = useState<IMyPokemon | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string; displayedText?: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Efek untuk animasi ketik
  useEffect(() => {
    messages.forEach((msg, index) => {
      if (msg.role === "assistant" && !msg.displayedText) {
        let currentText = "";
        const fullText = msg.content;
        let charIndex = 0;

        const typeInterval = setInterval(() => {
          if (charIndex < fullText.length) {
            currentText += fullText[charIndex];
            setMessages((prev) =>
              prev.map((m, i) =>
                i === index ? { ...m, displayedText: currentText } : m
              )
            );
            charIndex++;
          } else {
            clearInterval(typeInterval);
          }
        }, 50);

        return () => clearInterval(typeInterval);
      }
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!input || !selectedPokemon) return;

    const userMessage = { role: "user", content: input, displayedText: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const prompt = `Pretend you are a ${selectedPokemon.name}, respond based on your character, answer with English only.`;
    const fullMessage = `${prompt} User said: "${input}"`;

    try {
      const response = await axios.post(
        groqUrl,
        {
          model: "gemma2-9b-it",
          messages: [{ role: "user", content: fullMessage }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const botMessage = {
        role: "assistant",
        content: response.data.choices[0].message.content,
        displayedText: "",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response from Groq:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I can't talk right now!", displayedText: "" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen ? (
        <T.PokeballContainer onClick={() => setIsOpen(true)}>
          <img src="/static/pokeball.png" alt="Pokeball" />
          <T.PokeballBubble>Chat with your Pokémon</T.PokeballBubble>
        </T.PokeballContainer>
      ) : (
        <T.ChatbotContainer>
          <T.ChatbotWrapper>
            {selectedPokemon && (
              <T.PokemonImage>
                <img src={selectedPokemon.sprite} alt={selectedPokemon.name} />
              </T.PokemonImage>
            )}

            <T.ChatbotContent>
              <T.ChatbotHeader>
                {selectedPokemon ? (
                  <span>Chatting with {selectedPokemon.nickname} ({selectedPokemon.name})</span>
                ) : (
                  <span>Choose Your Pokémon</span>
                )}
                <T.CloseButton onClick={() => setIsOpen(false)}>X</T.CloseButton>
              </T.ChatbotHeader>

              <T.ChatbotSelector>
                <select
                  value={selectedPokemon?.nickname || ""}
                  onChange={(e) => {
                    const pokemon = pokemons.find((p) => p.nickname === e.target.value) || null;
                    setSelectedPokemon(pokemon);
                    setMessages([]);
                  }}
                >
                  <option value="">Choose Pokémon</option>
                  {pokemons.map((pokemon) => (
                    <option key={pokemon.nickname} value={pokemon.nickname}>
                      {pokemon.nickname} ({pokemon.name})
                    </option>
                  ))}
                </select>
              </T.ChatbotSelector>

              <T.ChatbotMessages>
                {messages.map((msg, index) => (
                  <T.MessageBubble key={index} isUser={msg.role === "user"}>
                    <T.BubbleContent isUser={msg.role === "user"}>
                      {msg.displayedText || msg.content}
                    </T.BubbleContent>
                  </T.MessageBubble>
                ))}
                {isLoading && <T.MessageBubble>Loading...</T.MessageBubble>}
              </T.ChatbotMessages>

              <T.ChatbotInput>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask Anything...."
                  disabled={!selectedPokemon || isLoading}
                />
                <button onClick={sendMessage} disabled={!selectedPokemon || isLoading}>
                  Send
                </button>
              </T.ChatbotInput>
            </T.ChatbotContent>
          </T.ChatbotWrapper>
        </T.ChatbotContainer>
      )}
    </>
  );
};

export default PokemonChatbot;