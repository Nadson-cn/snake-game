import { useRef, useEffect, useState } from "react";
import audioEat from "./assets/audioEat.mp3";
import { Ranking } from "./Ranking";

interface ISnake {
  x: number;
  y: number;
}

export default function App() {
  // const [isLoading, setIsLoading] = useState(true);
  const [endGame, setEndGame] = useState(false);
  const [inMoving, setInMoving] = useState(false);
  const [scoreIncrement, setScoreIncrement] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  let score = 0;
  const size = 30;
  const initialPosition = { x: 270, y: 240 };

  let snake = [initialPosition];
  let direction: string;
  let loopId: NodeJS.Timeout;

  useEffect(() => {
    if (!canvasRef.current) return;
    console.log("end", endGame);
    if (endGame) {
      console.log("end1", endGame);
      return;
    }
    runGame(canvasRef.current.getContext("2d")!);

    localStorage.removeItem("ranking");
  }, []);

  const playSound = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    new Audio(audioEat).play();
  };

  const runGame = (context: CanvasRenderingContext2D) => {
    const randomNumber = (min: number, max: number) => {
      return Math.round(Math.random() * (max - min) + min);
    };

    const randomPosition = () => {
      const number = randomNumber(0, Number(context.canvas.width) - size);

      return Math.round(number / 30) * 30;
    };

    const randomColor = () => {
      const red = randomNumber(0, 255);
      const green = randomNumber(0, 255);
      const blue = randomNumber(0, 255);
      return `rgb(${red}, ${green}, ${blue})`;
    };

    const food = {
      x: randomPosition(),
      y: randomPosition(),
      color: randomColor(),
    };

    const drawGrid = () => {
      if (context) {
        context.lineWidth = 1;
        context.strokeStyle = "#191919";

        for (let index = 30; index < 600; index += 30) {
          context.beginPath();
          context.lineTo(index, 0);
          context.lineTo(index, 600);
          context.stroke();

          context.beginPath();
          context.lineTo(0, index);
          context.lineTo(600, index);
          context.stroke();
        }
      }
    };

    const drawFood = () => {
      if (context) {
        const { x, y, color } = food;
        context.shadowColor = color;
        context.shadowBlur = 50;
        context.fillStyle = color;
        context.fillRect(x, y, size, size);
        context.shadowBlur = 0;
      }
    };

    const drawSnake = () => {
      // if (endGame) return;

      if (context) {
        context.fillStyle = "#ddd";
        snake.forEach((position, index) => {
          if (index === snake.length - 1) context.fillStyle = "#a4a497";
          context.fillRect(position.x, position.y, size, size);
        });
      }
    };
    const moveSnake = () => {
      if (endGame) return;
      // console.log("endGame", endGame);
      if (!direction) return;

      const headSnake = { ...snake[snake.length - 1] };
      setInMoving(true);
      if (direction === "right") headSnake.x += size;
      if (direction === "left") headSnake.x -= size;
      if (direction === "up") headSnake.y -= size;
      if (direction === "down") headSnake.y += size;
      console.log("direction", direction);
      console.log("headSnake.y", headSnake.y);
      console.log("headSnake.x", headSnake.x);
      snake.push(headSnake);
      snake.shift();
      setInMoving(false);
    };

    const checkCollisions = () => {
      if (context) {
        const headSnake = snake[snake.length - 1];
        const neckSnake = snake.length - 2;
        const canvasLimit = context.canvas.width - size;

        const wallCollision =
          headSnake.x < 0 ||
          headSnake.x > canvasLimit ||
          headSnake.y < 0 ||
          headSnake.y > canvasLimit;

        const selfCollision = snake.some((position, index) => {
          return (
            index < neckSnake &&
            position.x === headSnake.x &&
            position.y === headSnake.y
          );
        });

        return wallCollision || selfCollision;
      }
    };

    const checkEat = () => {
      const headSnake: ISnake = snake[snake.length - 1];
      if (headSnake.x === food.x && headSnake.y === food.y) {
        snake.push(headSnake);

        playSound();
        score += 1;
        setScoreIncrement((prev) => prev + 1);
        let x = randomPosition();
        let y = randomPosition();

        while (
          snake.find((position) => {
            position.x === x && position.y === y;
          })
        ) {
          x = randomPosition();
          y = randomPosition();
        }

        food.x = randomPosition();
        food.y = randomPosition();
        food.color = randomColor();
      }
    };

    const addItemToList = (item: number) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const currentList: number[] =
        JSON.parse(localStorage.getItem("ranking")!) || [];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      currentList.push(item);
      score = 0;

      // Atualizar o Local Storage com a lista atualizada
      localStorage.setItem("ranking", JSON.stringify(currentList));
    };

    const gameOver = () => {
      direction = "";
      setEndGame(true);
      addItemToList(score);
      score = 0;
      snake = [initialPosition];
    };

    const gameLoop = () => {
      if (endGame) return;

      clearInterval(loopId);

      context.clearRect(0, 0, 600, 600);

      drawGrid();
      drawFood();
      drawSnake();
      moveSnake();
      checkEat();

      if (checkCollisions()) {
        gameOver();
      }

      loopId = setTimeout(gameLoop, 90);
    };

    gameLoop();
  };

  document.addEventListener("keydown", ({ key }) => {
    if (endGame) return;
    if (!inMoving) {
      if (key === "ArrowRight" && direction !== "left") direction = "right";
      if (key === "ArrowLeft" && direction !== "right") direction = "left";
      if (key === "ArrowUp" && direction !== "down") direction = "up";
      if (key === "ArrowDown" && direction !== "up") direction = "down";
    }
  });

  return (
    <>
      <div>
        <Ranking />
      </div>
      <div
        className={`mb-2 flex flex-col items-center text-xl ${
          endGame ? "blur-sm" : ""
        }`}
      >
        <span>Score:</span>
        <span className="font-bold text-7xl block -mt-3">{scoreIncrement}</span>
      </div>
      <div
        className={`absolute ${
          endGame ? "flex" : "hidden"
        } items-center flex-col top-0 left-0 right-0 bottom-0 justify-center z-[1]`}
      >
        <span className="font-bold text-5xl uppercase">game over</span>
        <span>Score</span>
        <span className="font-medium text-2xl">{score}</span>

        <button
          className="border-none px-4 py-3 text-base font-semibold text-[#ff2c2c] mt-10 flex items-center justify-center gap-1 cursor-pointer"
          onClick={() => {
            setScoreIncrement(0);
            score = 0;
            setEndGame(false);
            // isGameOver = false;
            snake = [initialPosition];
          }}
        >
          Play Again
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className={`bg-[#111] ${endGame ? "blur" : ""}`}
      ></canvas>
    </>
  );
}
