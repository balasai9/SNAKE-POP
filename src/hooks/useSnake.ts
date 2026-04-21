import { useState, useCallback, useEffect } from 'react';
import { useInterval } from './useInterval';

export type Point = { x: number; y: number };

const GRID_SIZE = 20;

const INITIAL_SNAKE = [
  { x: 10, y: 15 },
  { x: 10, y: 16 },
  { x: 10, y: 17 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  let isOccupied = true;
  while (isOccupied) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    isOccupied = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
  }
  return newFood!;
};

export function useSnake() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 10, y: 5 });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const currentDirection = nextDirection;
      const newHead = { x: head.x + currentDirection.x, y: head.y + currentDirection.y };

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      // Self collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setFood(generateFood(newSnake));
        // Don't pop the tail, so it grows
      } else {
        newSnake.pop(); // Remove tail
      }

      setDirection(currentDirection);
      return newSnake;
    });
  }, [gameOver, isPaused, nextDirection, food]);

  useInterval(moveSnake, gameOver || isPaused ? null : INITIAL_SPEED - Math.min(score, 100)); // Gets slightly faster as score increases

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
    }
  }, [gameOver, score, highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && gameOver) {
        resetGame();
        return;
      }

      if (e.key === ' ') {
        setIsPaused(p => !p);
        return;
      }

      setNextDirection((prevNextDir) => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
            return direction.y !== 1 ? { x: 0, y: -1 } : prevNextDir;
          case 'ArrowDown':
          case 's':
            return direction.y !== -1 ? { x: 0, y: 1 } : prevNextDir;
          case 'ArrowLeft':
          case 'a':
            return direction.x !== 1 ? { x: -1, y: 0 } : prevNextDir;
          case 'ArrowRight':
          case 'd':
            return direction.x !== -1 ? { x: 1, y: 0 } : prevNextDir;
          default:
            return prevNextDir;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver, resetGame]);

  return {
    snake,
    food,
    gameOver,
    score,
    highScore,
    isPaused,
    gridSize: GRID_SIZE,
    resetGame,
    setIsPaused
  };
}
