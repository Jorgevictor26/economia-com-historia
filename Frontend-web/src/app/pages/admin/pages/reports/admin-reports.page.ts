import { Component, inject } from '@angular/core';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminPageHeaderComponent } from '../../shared/components';
import {
  BackendCommentReport,
  BackendCommentReportStatus,
  CommentReportReason,
  CommentReportService,
} from '../../../../services/comment-report.service';
import { ToastService } from '../../../../services/toast.service';

type ReportStatus = 'Pendente' | 'Resolvida' | 'Arquivada';
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
  id: number | string;
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
  reviewer: string;
  reportsCount: number;
  status: ReportStatus;
  backendStatus: BackendCommentReportStatus | string;
  priority: ReportPriority;
  tone: ReportTone;
  date: string;
  route: string[];
}

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [AdminConsoleShellComponent, AdminPageHeaderComponent],
  templateUrl: './admin-reports.page.html',
})
export class AdminReportsPage {
  private readonly commentReports = inject(CommentReportService);
  private readonly toastService = inject(ToastService);

  searchTerm = '';
  selectedStatus = 'Todos os status';
  activeTab = 'Todas';
  highPriorityOnly = false;
  selectedReport: ReportItem | null = null;
  currentPage = 1;
  readonly pageSize = 4;
  reports: ReportItem[] = [];
  isLoading = false;
  isModerating = false;
  loadError = '';

  constructor() {
    void this.loadReports();
  }

  get metrics(): ReportMetric[] {
    const pending = this.countByStatus('Pendente');
    const resolved = this.countByStatus('Resolvida');
    const archived = this.countByStatus('Arquivada');

    return [
      { label: 'Pendentes', value: String(pending), change: 'Aguardam moderação', icon: 'warning', tone: 'orange' },
      { label: 'Resolvidas', value: String(resolved), change: 'Comentário ocultado', icon: 'check', tone: 'green' },
      { label: 'Arquivadas', value: String(archived), change: 'Sem ação no conteúdo', icon: 'archive', tone: 'purple' },
      { label: 'Itens moderados', value: String(resolved), change: 'Ocultados por denúncia', icon: 'block', tone: 'red' },
      { label: 'Total de denúncias', value: String(this.reports.length), change: 'Carregado da API', icon: 'description', tone: 'blue' },
    ];
  }

  get tabs(): ReportTab[] {
    return [
      { label: 'Todas', count: this.reports.length },
      { label: 'Pendentes', count: this.countByStatus('Pendente'), status: 'Pendente' },
      { label: 'Resolvidas', count: this.countByStatus('Resolvida'), status: 'Resolvida' },
      { label: 'Arquivadas', count: this.countByStatus('Arquivada'), status: 'Arquivada' },
    ];
  }

  async loadReports(): Promise<void> {
    this.isLoading = true;
    this.loadError = '';

    try {
      const response = await this.commentReports.getAll({ perPage: 100 });
      this.reports = response.data.map((report) => this.toReportItem(report));
      this.currentPage = 1;

      if (this.selectedReport) {
        this.selectedReport = this.reports.find((report) => report.id === this.selectedReport?.id) ?? null;
      }
    } catch (error) {
      this.loadError = error instanceof Error ? error.message : 'Não foi possível carregar as denúncias.';
      this.toastService.error(this.loadError);
    } finally {
      this.isLoading = false;
    }
  }

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
      const matchesStatus = this.selectedStatus === 'Todos os status' || report.status === this.selectedStatus;
      const matchesSearch =
        !query ||
        [
          report.title,
          report.author,
          report.reporter,
          report.reason,
          report.contentType,
          report.reportedContent,
          report.description,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesTab && matchesPriority && matchesStatus && matchesSearch;
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

  async approveSelectedReport(): Promise<void> {
    if (!this.selectedReport || this.selectedReport.backendStatus !== 'pending' || this.isModerating) {
      return;
    }

    this.isModerating = true;

    try {
      const updated = await this.commentReports.approve(this.selectedReport.id);
      this.replaceReport(updated);
      this.toastService.success('Denúncia aprovada e comentário ocultado.');
    } catch (error) {
      this.toastService.error(error instanceof Error ? error.message : 'Não foi possível aprovar a denúncia.');
    } finally {
      this.isModerating = false;
    }
  }

  async rejectSelectedReport(): Promise<void> {
    if (!this.selectedReport || this.selectedReport.backendStatus !== 'pending' || this.isModerating) {
      return;
    }

    this.isModerating = true;

    try {
      const updated = await this.commentReports.reject(this.selectedReport.id);
      this.replaceReport(updated);
      this.toastService.success('Denúncia arquivada.');
    } catch (error) {
      this.toastService.error(error instanceof Error ? error.message : 'Não foi possível arquivar a denúncia.');
    } finally {
      this.isModerating = false;
    }
  }

  openReportedItem(report: ReportItem): void {
    if (!report.route.length) {
      return;
    }

    window.open(report.route.join('/'), '_blank', 'noopener,noreferrer');
  }

  private replaceReport(report: BackendCommentReport): void {
    const mapped = this.toReportItem(report);
    this.reports = this.reports.map((item) => item.id === mapped.id ? mapped : item);
    this.selectedReport = mapped;
  }

  private countByStatus(status: ReportStatus): number {
    return this.reports.filter((report) => report.status === status).length;
  }

  private toReportItem(report: BackendCommentReport): ReportItem {
    const comment = report.comment;
    const content = comment?.content;
    const contentOwner = comment?.user ?? content?.author ?? content?.user ?? null;
    const title = content?.title ? `Comentário em "${content.title}"` : `Comentário #${report.comment_id}`;
    const status = this.toReportStatus(report.status);
    const priority = this.toPriority(report.reason, comment?.hidden_at, status);

    return {
      id: report.id,
      title,
      contentType: 'Comentário',
      author: contentOwner?.name ?? 'Autor não identificado',
      age: this.relativeDate(report.created_at),
      reason: this.reasonLabel(report.reason),
      description: report.description?.trim() || 'Sem descrição adicional.',
      reportedContent: comment?.comment ?? 'Comentário indisponível.',
      contentSummary: [
        content?.content_type?.name ?? 'Comentário',
        content?.category?.name,
        content?.id ? `Conteúdo #${content.id}` : undefined,
      ].filter(Boolean).join(' • '),
      contentCode: `COM-${report.comment_id}`,
      contentOwner: contentOwner?.name ?? 'Autor não identificado',
      contentOwnerEmail: contentOwner?.email ?? 'Sem email',
      reporter: report.user?.name ?? 'Utilizador',
      reporterEmail: report.user?.email ?? 'Sem email',
      reviewer: report.reviewer?.name ?? 'Ainda não revisto',
      reportsCount: 1,
      status,
      backendStatus: report.status,
      priority,
      tone: this.toTone(status, priority),
      date: this.absoluteDate(report.created_at),
      route: content?.id ? ['', 'app', 'contents', String(content.id)] : [],
    };
  }

  private toReportStatus(status: BackendCommentReport['status']): ReportStatus {
    if (status === 'approved') {
      return 'Resolvida';
    }

    if (status === 'rejected') {
      return 'Arquivada';
    }

    return 'Pendente';
  }

  private toPriority(reason: string, hiddenAt: string | null | undefined, status: ReportStatus): ReportPriority {
    if (hiddenAt || status === 'Resolvida') {
      return 'Alta prioridade';
    }

    if (reason === 'offensive_comment' || reason === 'fake_information' || reason === 'copyright') {
      return 'Alta prioridade';
    }

    if (reason === 'spam') {
      return 'Média prioridade';
    }

    return 'Baixa prioridade';
  }

  private toTone(status: ReportStatus, priority: ReportPriority): ReportTone {
    if (status === 'Resolvida') {
      return 'green';
    }

    if (priority === 'Alta prioridade') {
      return 'red';
    }

    return 'orange';
  }

  private reasonLabel(reason: CommentReportReason | string): string {
    const labels: Record<CommentReportReason, string> = {
      spam: 'Spam',
      offensive_comment: 'Comentário ofensivo',
      fake_information: 'Informação falsa ou enganosa',
      copyright: 'Violação de direitos autorais',
      other: 'Outro motivo',
    };

    return labels[reason as CommentReportReason] ?? reason;
  }

  private relativeDate(value: string | null | undefined): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Data indisponível';
    }

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return 'Agora';
    }

    if (minutes < 60) {
      return `Há ${minutes} min`;
    }

    if (hours < 24) {
      return `Há ${hours} h`;
    }

    return `Há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  private absoluteDate(value: string | null | undefined): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Data indisponível';
    }

    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
