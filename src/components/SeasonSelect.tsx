import type { Dispatch, SetStateAction } from "react";

export const SeasonSelect = ({
  setSeason,
  seasons,
}: {
  setSeason: Dispatch<SetStateAction<string>>;
  seasons: number;
}) => {
  const options = [];

  for (let index = 0; index < seasons; index++) {
    options.push((index + 1).toString());
  }

  return (
    <>
      <select
        className="text-gray-800"
        onChange={(e) => {
          setSeason(e.target.value);
        }}
      >
        {options.map((option, index) => {
          return <option key={index}>{option}</option>;
        })}
      </select>
    </>
  );
};
