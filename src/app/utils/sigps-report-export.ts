/** Logo embutido reexportado para uso no export PDF. */
export { SIGPS_LOGO_SVG } from './sigps-logo';

const SIGPS_PRINT_CSS = `
  @page { size: A4 portrait; margin: 12mm 10mm; }
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    color: #0d2018; background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .sigps-doc { width: 100%; max-width: 760px; margin: 0 auto; padding: 0; }

  .sigps-doc-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 24px; padding-bottom: 16px;
    border-bottom: 3px solid #419640; margin-bottom: 12px;
  }
  .sigps-brand { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
  .sigps-brand-logo {
    flex-shrink: 0; width: 56px; height: 56px;
    display: flex; align-items: center; justify-content: center;
  }
  .sigps-brand-logo svg { display: block; width: 56px; height: 56px; }
  .sigps-brand-text h1 {
    margin: 0; font-size: 1.4rem; font-weight: 800;
    color: #0d5438; line-height: 1.15;
  }
  .sigps-brand-text p {
    margin: 4px 0 0; font-size: 0.7rem; color: #4a6e5a;
    line-height: 1.35; max-width: 260px;
  }
  .sigps-doc-meta {
    flex-shrink: 0; text-align: right; font-size: 0.74rem;
    color: #4a6e5a; line-height: 1.5; min-width: 180px;
  }
  .sigps-doc-meta strong {
    display: block; color: #0d2018; font-size: 0.88rem;
    font-weight: 700; margin-bottom: 6px;
  }
  .sigps-meta-line {
    display: block; margin: 0 0 3px; padding: 0;
    font-size: 0.74rem; color: #4a6e5a; line-height: 1.45;
  }

  .sigps-doc-subtitle {
    margin: 0 0 14px; font-size: 0.92rem; font-weight: 700; color: #1a7a4e;
  }
  .sigps-section-title {
    margin: 16px 0 10px; font-size: 0.72rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.07em; color: #419640;
  }

  .sigps-kpi-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
  }
  .sigps-kpi {
    border: 1px solid #daf0e6; border-radius: 10px; padding: 11px 13px;
    background: #f7fdf9; page-break-inside: avoid;
  }
  .sigps-kpi-label { font-size: 0.66rem; color: #4a6e5a; font-weight: 700; }
  .sigps-kpi-value {
    font-size: 1.3rem; font-weight: 800; color: #0d5438;
    margin: 5px 0 2px; line-height: 1.1;
  }
  .sigps-kpi-desc { font-size: 0.64rem; color: #82a894; }

  .sigps-two-cols {
    display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
    margin-top: 6px; page-break-inside: avoid;
  }
  .sigps-tables-row { margin-top: 4px; }

  .sigps-chart-bars {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 6px; height: 130px; padding: 8px 10px 6px;
    border: 1px solid #daf0e6; border-radius: 10px; background: #f7fdf9;
  }
  .sigps-bar-col {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: flex-end;
    height: 100%; min-width: 0; gap: 4px;
  }
  .sigps-bar-value { font-size: 0.64rem; font-weight: 800; color: #0d5438; }
  .sigps-bar {
    width: 100%; max-width: 32px; min-height: 3px;
    border-radius: 6px 6px 2px 2px;
    background: linear-gradient(180deg, #419640, #0d5438);
  }
  .sigps-bar-label { font-size: 0.58rem; color: #4a6e5a; font-weight: 600; text-align: center; }

  .sigps-gender-row { display: flex; gap: 10px; margin-bottom: 10px; }
  .sigps-gender-item {
    flex: 1; padding: 10px; border-radius: 10px;
    border: 1px solid #daf0e6; background: #fff;
  }
  .sigps-gender-value {
    font-size: 1.05rem; font-weight: 800; color: #0d5438;
    margin: 4px 0 2px; line-height: 1.1;
  }

  .sigps-fila-box {
    padding: 10px 12px; border-radius: 10px;
    border: 1px dashed #b6e8ce; background: #eaf7f0;
  }
  .sigps-fila-box .sigps-kpi-label { display: block; margin-bottom: 2px; }
  .sigps-fila-count {
    display: block; font-size: 0.95rem; font-weight: 800;
    color: #0d5438; margin: 2px 0 4px; line-height: 1.2;
  }
  .sigps-fila-box .sigps-kpi-desc { display: block; }

  .sigps-table { width: 100%; border-collapse: collapse; font-size: 0.72rem; }
  .sigps-table th {
    text-align: left; padding: 7px 10px; background: #eaf7f0;
    color: #0d5438; font-weight: 800; border-bottom: 2px solid #b6e8ce;
  }
  .sigps-table td { padding: 6px 10px; border-bottom: 1px solid #eaf7f0; vertical-align: middle; }

  .sigps-pill {
    display: inline-block; padding: 2px 8px; border-radius: 999px;
    font-weight: 700; font-size: 0.64rem;
  }
  .sigps-pill.status-done { background: #dcfce7; color: #166534; }
  .sigps-pill.status-pending { background: #dbeafe; color: #1d4ed8; }
  .sigps-pill.status-cancel { background: #fee2e2; color: #b91c1c; }

  .sigps-footer {
    margin-top: 22px; padding-top: 12px;
    border-top: 1px dashed #daf0e6;
    display: flex; justify-content: space-between; gap: 12px;
    font-size: 0.64rem; color: #82a894;
  }
`;

export function exportSigpsReport(element: HTMLElement, titulo: string): void {
  const win = window.open('', '_blank', 'width=920,height=780');
  if (!win) {
    alert('Permita pop-ups para exportar o relatório em PDF.');
    return;
  }

  const content = element.innerHTML;

  win.document.open();
  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${titulo.replace(/</g, '&lt;')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>${SIGPS_PRINT_CSS}</style>
</head>
<body><div class="sigps-doc">${content}</div></body>
</html>`);
  win.document.close();

  const triggerPrint = () => {
    win.focus();
    win.print();
    win.onafterprint = () => win.close();
  };

  if (win.document.fonts?.ready) {
    win.document.fonts.ready.then(() => setTimeout(triggerPrint, 350));
  } else {
    setTimeout(triggerPrint, 600);
  }
}
