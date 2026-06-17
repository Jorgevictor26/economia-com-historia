import { Component } from '@angular/core';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-jindungo-create-page',
  imports: [AdminConsoleShellComponent],
  templateUrl: './admin-jindungo-create.page.html',
  styleUrl: './admin-jindungo-create.page.scss',
})
export class AdminJindungoCreatePage {
  readonly metrics = [
    { icon: 'lock', value: 'Premium', label: 'Barreira ativa', badge: 'Acesso', description: 'Conteudo protegido apos o trecho aberto.' },
    { icon: 'article', value: '12 min', label: 'Tempo de leitura', badge: 'Leitor', description: 'Estimativa para leitura completa.' },
    { icon: 'sell', value: '4', label: 'Tags academicas', badge: 'SEO', description: 'Marcadores para pesquisa e contexto.' },
    { icon: 'verified_user', value: '82%', label: 'Pronto para revisao', badge: 'Editor', description: 'Configuracoes principais quase completas.' },
  ];

  readonly accessOptions = [
    { label: 'Plano Premium', checked: true },
    { label: 'Apenas subscritores', checked: false },
    { label: 'Publico (Demo)', checked: false },
  ];

  readonly tags = ['Macroeconomia', 'HistoriaAngola', 'Petroleo'];
}
