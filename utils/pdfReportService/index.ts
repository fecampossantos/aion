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
        /* Theme Colors */
        --primary-50: #eff6ff;
        --primary-100: #dbeafe;
        --primary-200: #bfdbfe;
        --primary-300: #93c5fd;
        --primary-400: #60a5fa;
        --primary-500: #3b82f6;
        --primary-600: #2563eb;
        --primary-700: #1d4ed8;
        --primary-800: #1e40af;
        --primary-900: #1e3a8a;
        
        --neutral-50: #f8fafc;
        --neutral-100: #f1f5f9;
        --neutral-200: #e2e8f0;
        --neutral-300: #cbd5e1;
        --neutral-400: #94a3b8;
        --neutral-500: #64748b;
        --neutral-600: #475569;
        --neutral-700: #334155;
        --neutral-800: #1e293b;
        --neutral-900: #0f172a;
        
        --success-50: #ecfdf5;
        --success-100: #d1fae5;
        --success-200: #a7f3d0;
        --success-300: #6ee7b7;
        --success-400: #34d399;
        --success-500: #10b981;
        --success-600: #059669;
        --success-700: #047857;
        --success-800: #065f46;
        --success-900: #064e3b;
        
        --warning-50: #fffbeb;
        --warning-100: #fef3c7;
        --warning-200: #fde68a;
        --warning-300: #fcd34d;
        --warning-400: #fbbf24;
        --warning-500: #f59e0b;
        --warning-600: #d97706;
        --warning-700: #b45309;
        --warning-800: #92400e;
        --warning-900: #78350f;
        
        --error-50: #fef2f2;
        --error-100: #fee2e2;
        --error-200: #fecaca;
        --error-300: #fca5a5;
        --error-400: #f87171;
        --error-500: #ef4444;
        --error-600: #dc2626;
        --error-700: #b91c1c;
        --error-800: #991b1b;
        --error-900: #7f1d1d;
        
        /* Spacing Scale */
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 12px;
        --spacing-lg: 16px;
        --spacing-xl: 20px;
        --spacing-2xl: 24px;
        --spacing-3xl: 32px;
        --spacing-4xl: 40px;
        --spacing-5xl: 48px;
        --spacing-6xl: 64px;
        
        /* Border Radius */
        --radius-none: 0px;
        --radius-sm: 4px;
        --radius-md: 8px;
        --radius-lg: 12px;
        --radius-xl: 16px;
        --radius-2xl: 20px;
        --radius-3xl: 24px;
        --radius-full: 9999px;
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
        line-height: 1.6;
        font-size: 14px;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--spacing-lg);
      }

      .header {
        text-align: center;
        margin-bottom: var(--spacing-4xl);
        padding-bottom: var(--spacing-xl);
        border-bottom: 3px solid var(--primary-500);
        position: relative;
      }

      .header::after {
        content: '';
        position: absolute;
        bottom: -3px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
        border-radius: var(--radius-full);
      }

      .header h1 {
        color: var(--primary-600);
        font-size: 36px;
        font-weight: 700;
        margin-bottom: var(--spacing-sm);
        letter-spacing: -0.5px;
      }

      .header .subtitle {
        color: var(--neutral-600);
        font-size: 18px;
        font-weight: 400;
        opacity: 0.8;
      }

      .project-info {
        background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
        color: white;
        border-radius: var(--radius-xl);
        padding: var(--spacing-3xl);
        margin-bottom: var(--spacing-3xl);
        box-shadow: 0 10px 25px rgba(37, 99, 235, 0.2);
        position: relative;
        overflow: hidden;
      }

      .project-info::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(50%, -50%);
      }

      .project-info h2 {
        font-size: 28px;
        font-weight: 600;
        margin-bottom: var(--spacing-xl);
        text-align: center;
        position: relative;
        z-index: 1;
      }

      .project-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-lg);
        text-align: center;
        position: relative;
        z-index: 1;
      }

      .project-detail {
        background: rgba(255, 255, 255, 0.15);
        padding: var(--spacing-lg);
        border-radius: var(--radius-lg);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: transform 0.2s ease;
      }

      .project-detail:hover {
        transform: translateY(-2px);
      }

      .project-detail .label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
        margin-bottom: var(--spacing-sm);
        font-weight: 500;
      }

      .project-detail .value {
        font-size: 20px;
        font-weight: 600;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-3xl);
      }

      .summary-card {
        background: white;
        border: 1px solid var(--neutral-200);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
      }

      .summary-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--primary-500), var(--success-500));
      }

      .summary-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      .summary-card h3 {
        color: var(--neutral-700);
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-md);
        color: var(--neutral-600);
      }

      .summary-card .metric {
        font-size: 28px;
        font-weight: 700;
        color: var(--primary-600);
        margin-bottom: var(--spacing-sm);
        line-height: 1.2;
      }

      .summary-card .sub-metric {
        font-size: 13px;
        color: var(--neutral-500);
        line-height: 1.4;
      }

      .section {
        margin-bottom: var(--spacing-4xl);
      }

      .section-title {
        font-size: 22px;
        font-weight: 600;
        color: var(--neutral-800);
        margin-bottom: var(--spacing-xl);
        padding-bottom: var(--spacing-md);
        border-bottom: 2px solid var(--neutral-200);
        position: relative;
      }

      .section-title::before {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 40px;
        height: 2px;
        background: var(--primary-500);
        border-radius: var(--radius-full);
      }

      .table-container {
        background: white;
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        border: 1px solid var(--neutral-200);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        background: var(--neutral-50);
        color: var(--neutral-700);
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: var(--spacing-lg) var(--spacing-md);
        text-align: left;
        border-bottom: 1px solid var(--neutral-200);
        position: sticky;
        top: 0;
        z-index: 10;
      }

      td {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--neutral-100);
        font-size: 13px;
        transition: background-color 0.2s ease;
      }

      tr:hover {
        background: var(--neutral-50);
      }

      .completed-task td {
        background: rgba(16, 185, 129, 0.05);
        border-left: 4px solid var(--success-500);
      }

      .pending-task td {
        background: rgba(245, 158, 11, 0.05);
        border-left: 4px solid var(--warning-500);
      }

      .status-icon {
        margin-right: var(--spacing-sm);
        font-size: 16px;
        display: inline-block;
        width: 20px;
        text-align: center;
      }

      .status-text {
        font-weight: 500;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .task-name {
        font-weight: 600;
        color: var(--neutral-800);
      }

      .session-date, .session-time {
        color: var(--neutral-600);
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        background: var(--neutral-100);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        display: inline-block;
      }

      .session-duration, .task-total-time {
        font-weight: 600;
        color: var(--primary-600);
        font-family: 'Monaco', 'Menlo', monospace;
        background: var(--primary-50);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        display: inline-block;
      }

      .sessions-count {
        color: var(--neutral-600);
        font-size: 12px;
        background: var(--neutral-100);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        display: inline-block;
      }

      .task-cost {
        font-weight: 600;
        color: var(--success-600);
        background: var(--success-50);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        display: inline-block;
      }

      .total-row {
        background: var(--primary-600) !important;
        color: white !important;
        font-weight: 600;
      }

      .total-row td {
        background: var(--primary-600) !important;
        color: white;
        font-weight: 600;
        border-left: none;
      }

      .cost-summary {
        background: linear-gradient(135deg, var(--success-600), var(--success-700));
        color: white;
        border-radius: var(--radius-xl);
        padding: var(--spacing-3xl);
        text-align: center;
        margin-top: var(--spacing-3xl);
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.2);
        position: relative;
        overflow: hidden;
      }

      .cost-summary::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(50%, -50%);
      }

      .cost-summary h3 {
        font-size: 20px;
        margin-bottom: var(--spacing-md);
        opacity: 0.9;
        position: relative;
        z-index: 1;
      }

      .cost-summary .total-cost {
        font-size: 42px;
        font-weight: 700;
        margin-bottom: var(--spacing-md);
        position: relative;
        z-index: 1;
      }

      .cost-summary .cost-breakdown {
        font-size: 15px;
        opacity: 0.8;
        position: relative;
        z-index: 1;
      }

      .page-break {
        page-break-before: always;
      }

      @media print {
        body {
          font-size: 12px;
          background-color: white;
        }
        
        .container {
          padding: var(--spacing-md);
        }
        
        .summary-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .project-info,
        .cost-summary {
          box-shadow: none;
          border: 2px solid var(--neutral-300);
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
