const getInitOfDay = (day: Date) => {
  const startOfDay = new Date(day);
  startOfDay.setHours(0, 0, 0, 0);

  return startOfDay.toISOString().slice(0, 19).replace("T", " ");
};

const getEndOfDay = (day: Date) => {
  const endOfDay = new Date(day);
  endOfDay.setHours(23, 59, 59, 999);

  return endOfDay.toISOString().slice(0, 19).replace("T", " ");
};

const prepareResultSet = (
  result: Array<{ day: string; total_time: number }>
) => {
  const labels: Array<string> = result.map((r) => {
    const [year, month, day] = r.day.split("-");
    return `${day}/${month}/${year}`;
  });
  const data: Array<number> = result.map((r) => {
    return r.total_time / 60;
  });

  return { labels, datasets: [{ data }] };
};

export default {
  getInitOfDay,
  getEndOfDay,
  prepareResultSet,
};
