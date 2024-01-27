import { Project } from "../../interfaces/Project";
import { fullDate, secondsToHHMMSS, secondsToTimeHHMMSS } from "../parser";

type TimingsResult = {
  task_completed: 0 | 1;
  timing_created_at: string;
  task_name: string;
  timing_timed: number;
};

export function generateReportHTML(
  project: Project,
  startDate: string,
  endDate: string,
  timings: TimingsResult[],
  documentName: string
): string {
  const totalTimeInSecods: number = timings.reduce((acc, curr) => {
    return acc + curr.timing_timed;
  }, 0);

  const { hours, minutes, seconds } = secondsToHHMMSS(totalTimeInSecods);
  const totalTime = secondsToTimeHHMMSS(totalTimeInSecods);

  const hours_cost = hours * project.hourly_cost;
  const minutes_cost = minutes * (project.hourly_cost / 60);
  const seconds_cost = seconds * (project.hourly_cost / 3600);

  let total_cost = hours_cost + minutes_cost + seconds_cost;
  let str_total_cost = total_cost.toFixed(3);

  if (
    parseInt(str_total_cost.toString().charAt(str_total_cost.length - 1)) > 5
  ) {
    (total_cost = parseFloat(total_cost.toFixed(2)) + 0) + 0.01;
  }

  const data_rows = timings.map(
    (t: TimingsResult) => `
      <tr>
      <td>${t.task_completed === 0 ? "❌" : "✅"}</td>
      <td>${t.task_name}</td>
      <td>${fullDate(t.timing_created_at)}</td>
      <td>${secondsToTimeHHMMSS(t.timing_timed)}h</td>
    </tr>`
  );

  const html = `
    <!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>${documentName}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
      rel="stylesheet"
    />

    <style>
      :root {
        --jet_black: #363636;
        --eerie_black: #1c1c1c;
        --night_black: #0a0a0a;
      }

      body {
        font-family: "Open Sans", sans-serif;
        background-color: var(--eerie_black);
        color: white;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
      }

      table {
        border-collapse: collapse;
      }

      th {
        font-weight: bold;
      }

      td,
      th {
        padding: 10px 20px;
        border: 1px solid white;
        text-align: center;
      }

      .table_wrapper {
        border: 1px solid white;
        border-radius: 4px;
        overflow: hidden;
      }

      .total_time_row {
        background-color: var(--jet_black);
      }

      .project_info {
        border: 1px solid white;
        border-radius: 4px;
        padding: 0px 40px;

        margin: 40px;
        background-color: var(--jet_black);
      }

      .project_info > h2 {
        text-align: center;
      }

      .total_cost_container {
        border: 1px solid white;
        border-radius: 4px;
        padding: 0px 40px;

        margin: 40px;
        background-color: var(--jet_black);
        width: 50%;
        text-align: center;
      }
    </style>
  </head>

  <body>
    <h1>Report de tasks</h1>
    
    <div class="project_info">
      <h2>${project.name}</h2>
      <p><b>Custo/hora:</b> R$${project.hourly_cost}</p>
      <p><b>Período:</b> ${startDate} a ${endDate}</p>
    </div>

    <div class="table_wrapper">
      <table>
        <tr>
          <th>Finalizada</th>
          <th>Task</th>
          <th>Data</th>
          <th>Tempo (hh:mm:ss:)</th>
        </tr>

        ${data_rows.join("\n")}

        <tr class="total_time_row">
          <td colspan="3">Tempo total</td>
          <td>${totalTime}h</td>
        </tr>
      </table>
    </div>

    <div class="total_cost_container">
      <p><b>Custo total:</b> R$${total_cost.toString().replace(".", ",")}</p>
    </div>
  </body>
</html>

    `;

  return html;
}
