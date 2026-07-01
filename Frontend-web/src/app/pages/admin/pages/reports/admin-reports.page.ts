import { Component } from '@angular/core';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminPageHeaderComponent } from '../../shared/components';

type ReportStatus = 'Pendente' | 'Em análise' | 'Resolvida' | 'Arquivada';
type ReportPriority = 'Alta prioridade' | 'Média prioridade' | 'Baixa prioridade';
type ReportTone = 'red' | 'orange' | 'green';

interface ReportMetric {
  label: string;
  value: string;
  change: string;
  icon: string;
  tone: 'orange' | 'purple' | 'green' | 'red' | 'blue';
}

interface ReportTab {
  label: string;
  count: number;
  status?: ReportStatus;
}

interface ReportItem {
  id: number;
  title: string;
  contentType: string;
  author: string;
  age: string;
  reason: string;
  description: string;
  reportedContent: string;
  contentSummary: string;
  contentCode: string;
  contentOwner: string;
  contentOwnerEmail: string;
  reporter: string;
  reporterEmail: string;
  reportsCount: number;
  status: ReportStatus;
  priority: ReportPriority;
  tone: ReportTone;
  date: string;
}

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [AdminConsoleShellComponent, AdminPageHeaderComponent],
  templateUrl: './admin-reports.page.html',
})
export class AdminReportsPage {
  searchTerm = '';
  selectedType = 'Todos os tipos';
  selectedStatus = 'Todos os status';
  activeTab = 'Todas';
  highPriorityOnly = false;
  selectedReport: ReportItem | null = null;
  currentPage = 1;
  readonly pageSize = 4;

  readonly metrics: ReportMetric[] = [
    { label: 'Pendentes', value: '23', change: '+5 hoje', icon: 'warning', tone: 'orange' },
    { label: 'Em análise', value: '12', change: '2 hoje', icon: 'visibility', tone: 'purple' },
    { label: 'Resolvidas', value: '89', change: '+18 esta semana', icon: 'check', tone: 'green' },
    { label: 'Itens moderados', value: '18', change: '+3 esta semana', icon: 'block', tone: 'red' },
    { label: 'Total de denúncias', value: '142', change: '+26 esta semana', icon: 'description', tone: 'blue' },
  ];

  readonly tabs: ReportTab[] = [
    { label: 'Todas', count: 142 },
    { label: 'Pendentes', count: 23, status: 'Pendente' },
    { label: 'Em análise', count: 12, status: 'Em análise' },
    { label: 'Resolvidas', count: 89, status: 'Resolvida' },
    { label: 'Arquivadas', count: 18, status: 'Arquivada' },
  ];

  readonly reports: ReportItem[] = [
    {
      id: 1,
      title: 'Fórum: História Económica no Período Colonial',
      contentType: 'Fórum',
      author: 'João Pedro',
      age: 'Há 3 horas',
      reason: 'Informação enganosa',
      description: 'O tópico apresenta informações históricas sem fonte e pode induzir outros utilizadores em erro.',
      reportedContent: 'Fórum: História Económica no Período Colonial',
      contentSummary: 'Fórum • ID: #FOR-2024-0321',
      contentCode: 'FOR-2024-0321',
      contentOwner: 'João Pedro',
      contentOwnerEmail: 'joao.p@echa.ao',
      reporter: 'Maria Helena',
      reporterEmail: 'maria.h@echa.ao',
      reportsCount: 3,
      status: 'Pendente',
      priority: 'Alta prioridade',
      tone: 'red',
      date: '23 de Junho de 2024 às 14:30',
    },
    {
      id: 2,
      title: 'Comentário em fórum sobre Economia Informal',
      contentType: 'Comentário',
      author: 'Carlos Manuel',
      age: 'Há 5 horas',
      reason: 'Comentário ofensivo',
      description: 'A denúncia indica que o comentário usa linguagem agressiva contra outro participante.',
      reportedContent: 'Comentário em "Economia Informal nas Comunidades"',
      contentSummary: 'Comentário • ID: #COM-2024-0318',
      contentCode: 'COM-2024-0318',
      contentOwner: 'Carlos Manuel',
      contentOwnerEmail: 'carlos.m@echa.ao',
      reporter: 'Ana Silva',
      reporterEmail: 'ana.s@echa.ao',
      reportsCount: 1,
      status: 'Em análise',
      priority: 'Média prioridade',
      tone: 'orange',
      date: '23 de Junho de 2024 às 10:05',
    },
    {
      id: 3,
      title: 'Fórum: Corrupção e transparência em Angola',
      contentType: 'Fórum',
      author: 'Paulo Mendes',
      age: 'Há 1 dia',
      reason: 'Acusações sem contexto',
      description: 'O fórum foi denunciado por apresentar acusações diretas sem contexto e sem base verificável.',
      reportedContent: 'Fórum: Corrupção e transparência em Angola',
      contentSummary: 'Fórum • ID: #FOR-2024-0189',
      contentCode: 'FOR-2024-0189',
      contentOwner: 'Paulo Mendes',
      contentOwnerEmail: 'paulo.m@echa.ao',
      reporter: 'Lucas Neto',
      reporterEmail: 'lucas.n@echa.ao',
      reportsCount: 2,
      status: 'Pendente',
      priority: 'Alta prioridade',
      tone: 'red',
      date: '22 de Junho de 2024 às 18:12',
    },
    {
      id: 4,
      title: 'Comentário no debate sobre Desenvolvimento Sustentável',
      contentType: 'Comentário',
      author: 'Teresa A.',
      age: 'Há 2 dias',
      reason: 'Spam',
      description: 'O comentário repete a mesma mensagem várias vezes e prejudica a leitura do debate.',
      reportedContent: 'Comentário no debate "Desenvolvimento Sustentável"',
      contentSummary: 'Comentário • ID: #COM-2024-0104',
      contentCode: 'COM-2024-0104',
      contentOwner: 'Teresa Afonso',
      contentOwnerEmail: 'teresa.a@echa.ao',
      reporter: 'Miguel Bento',
      reporterEmail: 'miguel.b@echa.ao',
      reportsCount: 1,
      status: 'Resolvida',
      priority: 'Baixa prioridade',
      tone: 'green',
      date: '21 de Junho de 2024 às 09:20',
    },
    {
      id: 5,
      title: 'Fórum sobre tradições económicas locais',
      contentType: 'Fórum',
      author: 'Maria João',
      age: 'Há 3 dias',
      reason: 'Discussão fora do tema',
      description: 'A denúncia aponta que o tópico saiu do assunto da categoria e passou a incentivar conflitos entre participantes.',
      reportedContent: 'Fórum sobre tradições económicas locais',
      contentSummary: 'Fórum • ID: #FOR-2024-0072',
      contentCode: 'FOR-2024-0072',
      contentOwner: 'Maria João',
      contentOwnerEmail: 'maria.j@echa.ao',
      reporter: 'Fernando Lima',
      reporterEmail: 'fernando.l@echa.ao',
      reportsCount: 1,
      status: 'Arquivada',
      priority: 'Média prioridade',
      tone: 'orange',
      date: '20 de Junho de 2024 às 16:42',
    },
  ];
  metricToneClasses(tone: ReportMetric['tone']): string {
    const classes: Record<ReportMetric['tone'], string> = {
      orange: 'bg-[#F2E6E9] text-[#8A3F50]',
      purple: 'bg-[#F2E6E9] text-[#8A3F50]',
      green: 'bg-[#E9F4F2] text-[#2A9D8F]',
      red: 'bg-[#F2E6E9] text-[#8A3F50]',
      blue: 'bg-[#F5F5F5] text-[#616161]',
    };

    return classes[tone];
  }

  priorityClasses(report: ReportItem): string {
    const classes: Record<ReportTone, string> = {
      red: 'bg-[#F2E6E9] text-[#8A3F50]',
      orange: 'bg-[#F5F5F5] text-[#616161]',
      green: 'bg-[#E9F4F2] text-[#2A9D8F]',
    };

    return classes[report.tone];
  }

  iconClasses(report: ReportItem): string {
    const classes: Record<ReportTone, string> = {
      red: 'border-[#E8D5DB] bg-[#F2E6E9] text-[#8A3F50]',
      orange: 'border-[#E0E0E0] bg-[#F5F5F5] text-[#616161]',
      green: 'border-[#D7EBD9] bg-[#E9F4F2] text-[#2A9D8F]',
    };

    return classes[report.tone];
  }

  cardClasses(report: ReportItem): string {
    return this.selectedReport?.id === report.id
      ? 'border-[#E8D5DB] bg-[#F5F5F5] shadow-[0_12px_28px_rgba(45,33,37,0.04)]'
      : 'border-[#E0E0E0] bg-white hover:border-[#E8D5DB] hover:bg-[#F5F5F5]';
  }

  visibleReports(): ReportItem[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.reports.filter((report) => {
      const matchesTab = this.activeTab === 'Todas' || this.tabs.find((tab) => tab.label === this.activeTab)?.status === report.status;
      const matchesPriority = !this.highPriorityOnly || report.priority === 'Alta prioridade';
      const matchesType = this.selectedType === 'Todos os tipos' || report.contentType === this.selectedType;
      const matchesStatus = this.selectedStatus === 'Todos os status' || report.status === this.selectedStatus;
      const matchesSearch =
        !query ||
        [report.title, report.author, report.reporter, report.reason, report.contentType].some((value) => value.toLowerCase().includes(query));

      return matchesTab && matchesPriority && matchesType && matchesStatus && matchesSearch;
    });
  }

  paginatedReports(): ReportItem[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.visibleReports().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.visibleReports().length / this.pageSize));
  }

  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, index) => index + 1);
  }

  firstVisibleReport(): number {
    return this.visibleReports().length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  lastVisibleReport(): number {
    return Math.min(this.currentPage * this.pageSize, this.visibleReports().length);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages());
  }

  resetPagination(): void {
    this.currentPage = 1;
  }

  selectReport(report: ReportItem): void {
    this.selectedReport = report;
  }

  closeDetails(): void {
    this.selectedReport = null;
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.resetPagination();
  }

  updateType(event: Event): void {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.resetPagination();
  }

  updateStatus(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.resetPagination();
  }

  setActiveTab(tab: ReportTab): void {
    this.activeTab = tab.label;
    this.resetPagination();
  }

  toggleHighPriority(): void {
    this.highPriorityOnly = !this.highPriorityOnly;
    this.resetPagination();
  }

  handleReportAction(action: string): void {
    if (!this.selectedReport) {
      return;
    }

    this.closeDetails();
  }
}




