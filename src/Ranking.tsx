import React from "react";

export const Ranking = (): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const scoreList: number[] =
    JSON.parse(localStorage.getItem("ranking")!) || [];
  return (
    <div className="absolute -ml-44 mt-[5.2rem]">
      {scoreList
        .sort((a, b) => b - a)
        .map((score, index) => (
          <ul className="font-bold text-xl block m-2">
            <span className="mr-1 font-normal">{index + 1}º - </span>
            {score} Fruits
          </ul>
        ))}
    </div>
  );
};
