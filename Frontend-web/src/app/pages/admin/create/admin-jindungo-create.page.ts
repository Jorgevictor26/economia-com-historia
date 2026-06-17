import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-jindungo-create-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  templateUrl: './admin-jindungo-create.page.html',
  styles: [
    `
      .material-icon {
        display: inline-grid;
        place-items: center;
        font-family: 'Material Symbols Outlined';
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        line-height: 1;
        text-transform: none;
        white-space: nowrap;
        font-feature-settings: 'liga';
        -webkit-font-feature-settings: 'liga';
        font-variation-settings: 'FILL' 0, 'wght' 430, 'GRAD' 0, 'opsz' 24;
      }
    `,
  ],
})
export class AdminJindungoCreatePage {
  readonly metrics = [
    { icon: 'lock', value: 'Premium', label: 'Barreira ativa', badge: 'Acesso', description: 'Conteudo protegido após o trecho aberto.' },
    { icon: 'article', value: '12 min', label: 'Tempo de leitura', badge: 'Leitor', description: 'Estimativa para leitura completa.' },
    { icon: 'sell', value: '4', label: 'Tags academicas', badge: 'SEO', description: 'Marcadores para pesquisa e contexto.' },
    { icon: 'verified_user', value: '82%', label: 'Pronto para revisão', badge: 'Editor', description: 'Configuracoes principaís quase completas.' },
  ];

  readonly accessOptions = [
    { label: 'Plano Premium', checked: true },
    { label: 'Apenas subscritores', checked: false },
    { label: 'Publico (Demo)', checked: false },
  ];

  readonly tags = ['Macroeconomia', 'HistóriaAngola', 'Petróleo'];
}



