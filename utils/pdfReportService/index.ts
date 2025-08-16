import { Project } from "../../interfaces/Project";
import { fullDate, secondsToHHMMSS, secondsToTimeHHMMSS, fullDateWithHour } from "../parser";

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
  const totalTasks = new Set(timings.map(t => t.task_name)).size;
  const completedTasks = new Set(
    timings.filter(t => t.task_completed === 1).map(t => t.task_name)
  ).size;
  
  const sessionTimes = timings.map(t => t.timing_timed);
  const averageSessionTime = sessionTimes.length > 0 
    ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length 
    : 0;
  const longestSession = sessionTimes.length > 0 ? Math.max(...sessionTimes) : 0;
  const shortestSession = sessionTimes.length > 0 ? Math.min(...sessionTimes) : 0;
  
  // Group by day to find most productive day
  const dayTotals = timings.reduce((acc, timing) => {
    const day = fullDate(timing.timing_created_at);
    acc[day] = (acc[day] || 0) + timing.timing_timed;
    return acc;
  }, {} as Record<string, number>);
  
  const mostProductiveDay = Object.keys(dayTotals).length > 0
    ? Object.entries(dayTotals).reduce((a, b) => a[1] > b[1] ? a : b)[0]
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
    totalDays
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
  const completionRate = summary.totalTasks > 0 
    ? ((summary.completedTasks / summary.totalTasks) * 100).toFixed(1)
    : "0";

  // Group timings by task
  const taskGroups = timings.reduce((acc, timing) => {
    if (!acc[timing.task_name]) {
      acc[timing.task_name] = {
        sessions: [],
        totalTime: 0,
        completed: timing.task_completed
      };
    }
    acc[timing.task_name].sessions.push(timing);
    acc[timing.task_name].totalTime += timing.timing_timed;
    return acc;
  }, {} as Record<string, { sessions: TimingsResult[], totalTime: number, completed: number }>);

  const data_rows = timings.map(
    (t: TimingsResult) => {
      const { d: date, time } = fullDateWithHour(t.timing_created_at);
      return `
      <tr class="${t.task_completed === 1 ? 'completed-task' : 'pending-task'}">
        <td>
          <span class="status-icon">${t.task_completed === 0 ? "⏳" : "✅"}</span>
          <span class="status-text">${t.task_completed === 0 ? "Em progresso" : "Concluída"}</span>
        </td>
        <td class="task-name">${t.task_name}</td>
        <td class="session-date">${date}</td>
        <td class="session-time">${time}</td>
        <td class="session-duration">${secondsToTimeHHMMSS(t.timing_timed)}</td>
      </tr>`;
    }
  );

  const task_summary_rows = Object.entries(taskGroups).map(([taskName, data]) => `
    <tr class="${data.completed === 1 ? 'completed-task' : 'pending-task'}">
      <td>
        <span class="status-icon">${data.completed === 0 ? "⏳" : "✅"}</span>
        <span class="task-name">${taskName}</span>
      </td>
      <td class="sessions-count">${data.sessions.length} sessões</td>
      <td class="task-total-time">${secondsToTimeHHMMSS(data.totalTime)}</td>
      <td class="task-cost">R$ ${((data.totalTime / 3600) * project.hourly_cost).toFixed(2)}</td>
    </tr>
  `);

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
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <style>
      :root {
        --primary-color: #2563eb;
        --secondary-color: #1e40af;
        --success-color: #059669;
        --warning-color: #d97706;
        --danger-color: #dc2626;
        --gray-50: #f9fafb;
        --gray-100: #f3f4f6;
        --gray-200: #e5e7eb;
        --gray-300: #d1d5db;
        --gray-600: #4b5563;
        --gray-700: #374151;
        --gray-800: #1f2937;
        --gray-900: #111827;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        background-color: white;
        color: var(--gray-900);
        line-height: 1.6;
        font-size: 14px;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .header {
        text-align: center;
        margin-bottom: 40px;
        border-bottom: 3px solid var(--primary-color);
        padding-bottom: 20px;
      }

      .header h1 {
        color: var(--primary-color);
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .header .subtitle {
        color: var(--gray-600);
        font-size: 16px;
        font-weight: 400;
      }

      .project-info {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border-radius: 12px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .project-info h2 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
        text-align: center;
      }

      .project-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        text-align: center;
      }

      .project-detail {
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
      }

      .project-detail .label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.8;
        margin-bottom: 5px;
      }

      .project-detail .value {
        font-size: 18px;
        font-weight: 600;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .summary-card {
        background: var(--gray-50);
        border: 1px solid var(--gray-200);
        border-radius: 8px;
        padding: 20px;
        text-align: center;
      }

      .summary-card h3 {
        color: var(--gray-700);
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 10px;
      }

      .summary-card .metric {
        font-size: 24px;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 5px;
      }

      .summary-card .sub-metric {
        font-size: 12px;
        color: var(--gray-600);
      }

      .section {
        margin-bottom: 40px;
      }

      .section-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--gray-200);
      }

      .table-container {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--gray-200);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        background: var(--gray-50);
        color: var(--gray-700);
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 15px 12px;
        text-align: left;
        border-bottom: 1px solid var(--gray-200);
      }

      td {
        padding: 12px;
        border-bottom: 1px solid var(--gray-100);
        font-size: 13px;
      }

      tr:hover {
        background: var(--gray-50);
      }

      .completed-task td {
        background: rgba(5, 150, 105, 0.05);
      }

      .pending-task td {
        background: rgba(217, 119, 6, 0.05);
      }

      .status-icon {
        margin-right: 8px;
        font-size: 16px;
      }

      .status-text {
        font-weight: 500;
      }

      .task-name {
        font-weight: 500;
        color: var(--gray-800);
      }

      .session-date, .session-time {
        color: var(--gray-600);
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
      }

      .session-duration, .task-total-time {
        font-weight: 600;
        color: var(--primary-color);
        font-family: 'Monaco', 'Menlo', monospace;
      }

      .sessions-count {
        color: var(--gray-600);
        font-size: 12px;
      }

      .task-cost {
        font-weight: 600;
        color: var(--success-color);
      }

      .total-row {
        background: var(--primary-color) !important;
        color: white !important;
        font-weight: 600;
      }

      .total-row td {
        background: var(--primary-color) !important;
        color: white;
        font-weight: 600;
      }

      .cost-summary {
        background: linear-gradient(135deg, var(--success-color), #047857);
        color: white;
        border-radius: 12px;
        padding: 30px;
        text-align: center;
        margin-top: 30px;
      }

      .cost-summary h3 {
        font-size: 18px;
        margin-bottom: 10px;
        opacity: 0.9;
      }

      .cost-summary .total-cost {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 10px;
      }

      .cost-summary .cost-breakdown {
        font-size: 14px;
        opacity: 0.8;
      }

      .page-break {
        page-break-before: always;
      }

      @media print {
        body {
          font-size: 12px;
        }
        
        .container {
          padding: 10px;
        }
        
        .summary-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1>Relatório de Produtividade</h1>
        <p class="subtitle">Análise detalhada de tempo e desempenho</p>
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
          <div class="sub-metric">${summary.totalSessions} sessões em ${summary.totalDays} dias</div>
        </div>
        
        <div class="summary-card">
          <h3>Taxa de Conclusão</h3>
          <div class="metric">${completionRate}%</div>
          <div class="sub-metric">${summary.completedTasks} de ${summary.totalTasks} tarefas</div>
        </div>
        
        <div class="summary-card">
          <h3>Sessão Média</h3>
          <div class="metric">${secondsToTimeHHMMSS(Math.round(summary.averageSessionTime))}</div>
          <div class="sub-metric">Variação: ${secondsToTimeHHMMSS(summary.shortestSession)} - ${secondsToTimeHHMMSS(summary.longestSession)}</div>
        </div>
        
        <div class="summary-card">
          <h3>Dia Mais Produtivo</h3>
          <div class="metric">${summary.mostProductiveDay}</div>
          <div class="sub-metric">Análise do período selecionado</div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">📋 Resumo por Tarefa</h2>
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

      <div class="section page-break">
        <h2 class="section-title">⏱️ Detalhamento de Sessões</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Tarefa</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Duração</th>
              </tr>
            </thead>
            <tbody>
              ${data_rows.join("")}
              <tr class="total-row">
                <td colspan="4"><strong>TEMPO TOTAL</strong></td>
                <td><strong>${totalTime}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="cost-summary">
        <h3>💰 Resumo Financeiro</h3>
        <div class="total-cost">R$ ${total_cost.toString().replace(".", ",")}</div>
        <div class="cost-breakdown">
          Baseado em ${hours}h ${minutes}m ${seconds}s a R$ ${project.hourly_cost}/hora
        </div>
      </div>
    </div>
  </body>
</html>`;

  return html;
}
