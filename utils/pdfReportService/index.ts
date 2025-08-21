import { Project } from "../../interfaces/Project";
import {
  fullDate,
  secondsToHHMMSS,
  secondsToTimeHHMMSS,
  fullDateWithHour,
} from "../parser";

type TimingsResult = {
  task_completed: 0 | 1;
  timing_created_at: string;
  task_name: string;
  timing_timed: number;
  task_created_at?: string;
};

type ProjectSummary = {
  totalTasks: number;
  completedTasks: number;
  totalSessions: number;
  averageSessionTime: number;
  longestSession: number;
  shortestSession: number;
  mostProductiveDay: string;
  totalDays: number;
};

function calculateProjectSummary(timings: TimingsResult[]): ProjectSummary {
  const totalSessions = timings.length;
  const totalTasks = new Set(timings.map((t) => t.task_name)).size;
  const completedTasks = new Set(
    timings.filter((t) => t.task_completed === 1).map((t) => t.task_name)
  ).size;

  const sessionTimes = timings.map((t) => t.timing_timed);
  const averageSessionTime =
    sessionTimes.length > 0
      ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length
      : 0;
  const longestSession =
    sessionTimes.length > 0 ? Math.max(...sessionTimes) : 0;
  const shortestSession =
    sessionTimes.length > 0 ? Math.min(...sessionTimes) : 0;

  // Group by day to find most productive day
  const dayTotals = timings.reduce((acc, timing) => {
    const day = fullDate(timing.timing_created_at);
    acc[day] = (acc[day] || 0) + timing.timing_timed;
    return acc;
  }, {} as Record<string, number>);

  const mostProductiveDay =
    Object.keys(dayTotals).length > 0
      ? Object.entries(dayTotals).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
      : "N/A";

  const totalDays = Object.keys(dayTotals).length;

  return {
    totalTasks,
    completedTasks,
    totalSessions,
    averageSessionTime,
    longestSession,
    shortestSession,
    mostProductiveDay,
    totalDays,
  };
}

export function generateReportHTML(
  project: Project,
  startDate: string,
  endDate: string,
  timings: TimingsResult[],
  documentName: string
): string {
  const totalTimeInSeconds: number = timings.reduce((acc, curr) => {
    return acc + curr.timing_timed;
  }, 0);

  const { hours, minutes, seconds } = secondsToHHMMSS(totalTimeInSeconds);
  const totalTime = secondsToTimeHHMMSS(totalTimeInSeconds);

  const hours_cost = hours * project.hourly_cost;
  const minutes_cost = minutes * (project.hourly_cost / 60);
  const seconds_cost = seconds * (project.hourly_cost / 3600);

  let total_cost = hours_cost + minutes_cost + seconds_cost;
  let str_total_cost = total_cost.toFixed(3);

  if (
    parseInt(str_total_cost.toString().charAt(str_total_cost.length - 1)) > 5
  ) {
    total_cost = parseFloat(total_cost.toFixed(2)) + 0.01;
  } else {
    total_cost = parseFloat(total_cost.toFixed(2));
  }

  const summary = calculateProjectSummary(timings);
  const completionRate =
    summary.totalTasks > 0
      ? ((summary.completedTasks / summary.totalTasks) * 100).toFixed(1)
      : "0";

  // Group timings by task and only include tasks recorded during the period
  const taskGroups = timings.reduce((acc, timing) => {
    if (!acc[timing.task_name]) {
      acc[timing.task_name] = {
        sessions: [],
        totalTime: 0,
        completed: timing.task_completed,
      };
    }
    acc[timing.task_name].sessions.push(timing);
    acc[timing.task_name].totalTime += timing.timing_timed;
    return acc;
  }, {} as Record<string, { sessions: TimingsResult[]; totalTime: number; completed: number }>);

  const task_summary_rows = Object.entries(taskGroups).map(
    ([taskName, data]) => `
    <tr class="${data.completed === 1 ? "completed-task" : "pending-task"}">
      <td class="task-name">${taskName}</td>
      <td class="sessions-count">${data.sessions.length}</td>
      <td class="task-total-time">${secondsToTimeHHMMSS(data.totalTime)}</td>
      <td class="task-cost">R$ ${(
        (data.totalTime / 3600) *
        project.hourly_cost
      ).toFixed(2)}</td>
    </tr>
  `
  );

  const html = `
    <!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${documentName}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <style>
      :root {
        --primary: #3b82f6;
        --primary-light: #1e40af;
        --success: #10b981;
        --success-light: #065f46;
        --warning: #f59e0b;
        --warning-light: #92400e;
        --neutral-50: #0f172a;
        --neutral-100: #1e293b;
        --neutral-200: #334155;
        --neutral-300: #475569;
        --neutral-400: #64748b;
        --neutral-500: #94a3b8;
        --neutral-600: #cbd5e1;
        --neutral-700: #e2e8f0;
        --neutral-800: #f1f5f9;
        --neutral-900: #f8fafc;
        --white: #ffffff;
        --black: #000000;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        background-color: var(--neutral-50);
        color: var(--neutral-900);
        line-height: 1.5;
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
      }

      .container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .header {
        text-align: center;
        margin-bottom: 48px;
        padding-bottom: 24px;
        border-bottom: 2px solid var(--neutral-200);
      }

      .header h1 {
        color: var(--white);
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: -0.025em;
      }

      .header .subtitle {
        color: var(--neutral-600);
        font-size: 16px;
        font-weight: 400;
      }

      .project-info {
        background: var(--neutral-100);
        border: 1px solid var(--neutral-200);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 32px;
      }

      .project-info h2 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
        color: var(--white);
        text-align: center;
      }

      .project-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        text-align: center;
      }

      .project-detail {
        padding: 16px;
        background: var(--neutral-200);
        border-radius: 8px;
        border: 1px solid var(--neutral-300);
      }

      .project-detail .label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--neutral-500);
        margin-bottom: 4px;
        font-weight: 500;
      }

      .project-detail .value {
        font-size: 18px;
        font-weight: 600;
        color: var(--white);
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      }

      .summary-card {
        background: var(--neutral-100);
        border: 1px solid var(--neutral-200);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
      }

      .summary-card h3 {
        color: var(--neutral-500);
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 12px;
      }

      .summary-card .metric {
        font-size: 24px;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 4px;
        line-height: 1.2;
      }

      .summary-card .sub-metric {
        font-size: 12px;
        color: var(--neutral-500);
        line-height: 1.4;
      }

      .section {
        margin-bottom: 40px;
      }

      .section-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--white);
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--neutral-200);
      }

      .table-container {
        background: var(--neutral-100);
        border: 1px solid var(--neutral-200);
        border-radius: 12px;
        overflow: hidden;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        background: var(--neutral-200);
        color: var(--neutral-700);
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 16px 12px;
        text-align: left;
        border-bottom: 1px solid var(--neutral-300);
      }

      td {
        padding: 12px;
        border-bottom: 1px solid var(--neutral-200);
        font-size: 13px;
      }

      tr:last-child td {
        border-bottom: none;
      }

      .completed-task {
        background: var(--success-light);
      }

      .pending-task {
        background: var(--warning-light);
      }

      .task-name {
        font-weight: 500;
        color: var(--white);
      }

      .sessions-count {
        color: var(--neutral-600);
        font-size: 12px;
        text-align: center;
      }

      .task-total-time {
        font-weight: 600;
        color: var(--primary);
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
      }

      .task-cost {
        font-weight: 600;
        color: var(--success);
        text-align: right;
      }

      .cost-summary {
        background: var(--success-light);
        border: 1px solid var(--success);
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        margin-top: 32px;
      }

      .cost-summary h3 {
        font-size: 18px;
        margin-bottom: 12px;
        color: var(--success);
        font-weight: 600;
      }

      .cost-summary .total-cost {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 8px;
        color: var(--success);
      }

      .cost-summary .cost-breakdown {
        font-size: 14px;
        color: var(--neutral-600);
      }

      @media print {
        body {
          font-size: 12px;
          background-color: var(--black);
        }
        
        .container {
          padding: 20px;
        }
        
        .summary-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .project-info,
        .cost-summary {
          border: 1px solid var(--neutral-300);
        }
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1>Relatório de Produtividade</h1>
        <p class="subtitle">Análise de tempo e desempenho</p>
      </div>
      
      <div class="project-info">
        <h2>${project.name}</h2>
        <div class="project-details">
          <div class="project-detail">
            <div class="label">Valor por Hora</div>
            <div class="value">R$ ${project.hourly_cost.toFixed(2)}</div>
          </div>
          <div class="project-detail">
            <div class="label">Período</div>
            <div class="value">${startDate} - ${endDate}</div>
          </div>
          <div class="project-detail">
            <div class="label">Criado em</div>
            <div class="value">${fullDate(project.created_at.toString())}</div>
          </div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <h3>Tempo Total</h3>
          <div class="metric">${totalTime}</div>
          <div class="sub-metric">${summary.totalSessions} sessões</div>
        </div>
        
        <div class="summary-card">
          <h3>Taxa de Conclusão</h3>
          <div class="metric">${completionRate}%</div>
          <div class="sub-metric">${summary.completedTasks}/${summary.totalTasks} tarefas</div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Resumo por Tarefa</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Tarefa</th>
                <th>Sessões</th>
                <th>Tempo Total</th>
                <th>Custo</th>
              </tr>
            </thead>
            <tbody>
              ${task_summary_rows.join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="cost-summary">
        <h3>Resumo Financeiro</h3>
        <div class="total-cost">R$ ${total_cost
          .toString()
          .replace(".", ",")}</div>
        <div class="cost-breakdown">
          ${hours}h ${minutes}m ${seconds}s × R$ ${project.hourly_cost}/hora
        </div>
      </div>
    </div>
  </body>
</html>`;

  return html;
}
