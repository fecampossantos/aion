export function parseToCurrencyFormat(text: string): string {
  const ignoredChars = [",", ".", "-", " "];

  const clickedChar = text.charAt(text.length - 1);
  if (ignoredChars.includes(clickedChar)) return;

  const numberWithoutComma = parseInt(
    text.replace(",", "").padStart(4, "0")
  ).toString();
  const decimal = numberWithoutComma.slice(-2);
  const integer = numberWithoutComma.slice(0, -2);

  return `${integer.padStart(2, "0")},${decimal.padStart(2, "0")}`;
}

export function secondsToTimeHHMMSS(time: number): string {
  const hours = Math.floor(time / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (time % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function fullDateWithHour(dateString: string): {
  d: string;
  time: string;
} {
  const date = new Date(dateString);
  const d = new Date(date).toLocaleDateString("pt-BR");

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const time = `${hours}:${minutes}:${seconds}`;

  return { d, time };
}
