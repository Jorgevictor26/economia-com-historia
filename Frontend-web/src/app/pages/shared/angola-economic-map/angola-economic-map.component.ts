import { Component, computed, signal } from '@angular/core';

type AreaLevel = 'País' | 'Província' | 'Município' | 'Distrito' | 'Bairro' | 'Avenida';

interface MapArea {
  id: string;
  parentId?: string;
  name: string;
  level: AreaLevel;
  x: number;
  y: number;
  points?: string;
  minZoom: number;
  economy: string;
  history: string;
  localInfo: string;
}

@Component({
  selector: 'app-angola-economic-map',
  templateUrl: './angola-economic-map.component.html',
  styles: `
    :host { display: block; }
    .admin-map { display: grid; grid-template-columns: minmax(320px, 406px) 1fr; min-height: 680px; overflow: hidden; border: 1px solid #E0E0E0; border-radius: 8px; background: #212121; }
    .panel { z-index: 2; background: #fff; box-shadow: 10px 0 24px rgb(0 0 0 / .22); }
    .search { display: grid; grid-template-columns: 1fr auto auto; align-items: center; min-height: 52px; margin: 12px 14px; border-radius: 26px; padding-inline: 20px 12px; box-shadow: 0 2px 8px rgb(42 47 49 / .28); color: #616161; }
    .panel-body > p { margin: 10px 22px 4px; color: #2A9D8F; font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    h2 { margin: 0 22px 16px; color: #212121; font-size: 1.55rem; line-height: 1.2; }
    .actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; border-block: 1px solid #e0e0e0; padding: 14px 16px 16px; }
    .actions button { display: grid; justify-items: center; gap: 7px; color: #2A9D8F; font-size: .72rem; font-weight: 700; text-align: center; }
    .actions span { display: grid; width: 40px; aspect-ratio: 1; place-items: center; border-radius: 999px; background: #F5F5F5; }
    section { border-bottom: 1px solid #e0e0e0; padding: 16px 22px 18px; }
    h3 { color: #212121; font-size: 1rem; font-weight: 800; }
    section p { margin-top: 12px; color: #212121; font-size: .88rem; line-height: 1.55; }
    .list { display: grid; gap: 8px; margin-top: 12px; }
    .list button { display: flex; min-height: 42px; align-items: center; justify-content: space-between; border: 1px solid #E0E0E0; border-radius: 6px; padding-inline: 12px; color: #616161; text-align: left; }
    .map-board { position: relative; min-height: 680px; overflow: hidden; background: #212121; }
    svg { width: 100%; height: 100%; min-height: 680px; cursor: grab; }
    g { transition: transform 220ms ease; transform-origin: center; }
    .province { fill: #E6D5B8; stroke: #212121; stroke-width: 5; vector-effect: non-scaling-stroke; cursor: pointer; transition: fill 160ms ease; }
    .province:hover, .province.active { fill: #C48A96; }
    .province-label { fill: #212121; font-size: 28px; font-weight: 800; text-anchor: middle; cursor: pointer; user-select: none; }
    .sub-area { cursor: pointer; }
    .sub-area circle { fill: #2A9D8F; stroke: #fff; stroke-width: 4; vector-effect: non-scaling-stroke; }
    .sub-area.active circle { fill: #8A3F50; }
    .sub-area text { fill: #212121; font-size: 18px; font-weight: 800; paint-order: stroke; stroke: #F2E6E9; stroke-width: 5px; }
    .zoom-control { position: absolute; right: 18px; bottom: 18px; display: grid; overflow: hidden; border-radius: 8px; background: #fff; box-shadow: 0 2px 8px rgb(0 0 0 / .25); }
    .zoom-control button { display: grid; width: 42px; aspect-ratio: 1; place-items: center; border-bottom: 1px solid #e0e0e0; color: #616161; }
    .zoom-level { position: absolute; left: 18px; bottom: 18px; border-radius: 6px; background: rgb(255 255 255 / .92); padding: 8px 12px; color: #212121; font-size: .8rem; font-weight: 800; }
    @media (max-width: 900px) {
      .admin-map { grid-template-columns: 1fr; }
      .panel { order: 2; }
      .map-board { min-height: 520px; }
      svg { min-height: 520px; }
    }
  `,
})
export class AngolaEconomicMapComponent {
  readonly zoom = signal(1);
  readonly selectedAreaId = signal('angola');
  readonly actions = [
    { label: 'Direcoes', icon: 'near_me' },
    { label: 'Guardar', icon: 'bookmark' },
    { label: 'Imediacoes', icon: 'explore' },
    { label: 'Partilhar', icon: 'ios_share' },
  ];

  readonly areas: MapArea[] = [
    this.area('angola', undefined, 'Angola', 'País', 500, 550, 1, 'Economia nacional marcada por petroleo, diamantes, agricultura, portos, comercio e uma agenda de diversificacao produtiva.', 'Angola integra memorias de reinos africanos, rotas atlanticas, periodo colonial, luta de libertacao, independencia em 1975 e reconstrucao nacional.', 'Clique numa província e amplie para ver municípios, distritos, bairros e avenidas com leitura historica e económica.'),
    this.area('zaire', 'angola', 'Zaire', 'Província', 135, 170, 1, 'Circulacao transfronteirica, agricultura, comercio e ligacao historica ao corredor norte.', 'Regiao associada ao antigo Reino do Kongo e a redes politicas e comerciais pre-coloniais.', 'Inclui Mbanza Kongo, referencia patrimonial e historica de Angola.', '30,150 95,122 248,120 270,150 238,205 158,235 82,232'),
    this.area('cabinda', 'angola', 'Cabinda', 'Província', 72, 50, 1, 'Enclave petrolifero com relevancia energetica, portuaria e florestal.', 'Territorio com trajectoria administrativa singular e forte ligacao ao Atlantico e ao Congo.', 'Província separada geograficamente do corpo principal de Angola.', '35,20 80,8 104,46 92,110 45,118 20,74'),
    this.area('uige', 'angola', 'Uige', 'Província', 330, 218, 1, 'Agricultura, cafe, comercio regional e ligacoes ao norte do país.', 'Area importante nas memorias do cafe, da ocupacao colonial e das redes do interior norte.', 'Faz fronteira com o Zaire, Bengo, Kwanza Norte e Malanje.', '248,120 435,118 462,205 438,292 345,285 302,240 238,205 270,150'),
    this.area('bengo', 'angola', 'Bengo', 'Província', 168, 318, 1, 'Agricultura periurbana, pesca, materiais de construcao e abastecimento da capital.', 'Territorio de transicao entre Luanda, o litoral e o interior norte.', 'A proximidade de Luanda faz do Bengo uma zona de expansao económica.', '82,232 158,235 238,205 302,240 270,315 210,325 158,365 96,330'),
    this.area('luanda', 'angola', 'Luanda', 'Província', 75, 382, 1, 'Maior centro financeiro, logistico, administrativo e de serviços do país.', 'Fundada em 1576, tornou-se capital politica e económica de Angola independente.', 'Amplie para ver municípios, distritos, bairros e avenidas da capital.', '50,340 96,330 122,374 96,438 55,420'),
    this.area('kwanza-norte', 'angola', 'Kwanza Norte', 'Província', 265, 370, 1, 'Agricultura, energia, comercio interno e articulacao com o vale do Kwanza.', 'Regiao ligada a rotas interiores, producao agricola e administracao colonial.', 'Conecta o eixo Luanda-Malanje ao centro do país.', '210,325 270,315 350,318 342,445 260,462 205,410'),
    this.area('malanje', 'angola', 'Malanje', 'Província', 430, 378, 1, 'Agricultura, energia, comercio regional e potencial logistico do interior norte.', 'Associada a rotas interiores, quedas de Calandula e transformacoes agrarias.', 'Ao ampliar aparecem Malanje, Cacuso e Calandula.', '350,318 438,292 520,355 520,505 405,500 342,445'),
    this.area('lunda-norte', 'angola', 'Lunda Norte', 'Província', 655, 388, 1, 'Diamantes, comercio fronteirico e serviços associados a cadeia mineira.', 'Regiao marcada por sociedades Lunda-Chokwe e redes politicas do leste.', 'Amplie para Dundo, Lucapa e corredores mineiros.', '520,300 815,212 812,360 702,495 555,480 520,400'),
    this.area('lunda-sul', 'angola', 'Lunda Sul', 'Província', 810, 530, 1, 'Diamantes, serviços mineiros e circulacao regional no leste.', 'História ligada a redes Lunda-Chokwe, cultura material e autoridade politica.', 'Saurimo funciona como centro urbano regional.', '702,495 812,360 930,392 940,565 855,610 742,585'),
    this.area('moxico', 'angola', 'Moxico', 'Província', 760, 720, 1, 'Agricultura, madeira, comercio fronteirico e potencial logistico oriental.', 'Territorio associado a longas rotas interiores e a memorias da guerra e reconstrucao.', 'Inclui Luena e grandes extensoes de circulacao leste.', '555,480 702,495 742,585 940,565 940,760 850,760 850,980 690,940 560,820'),
    this.area('kwanza-sul', 'angola', 'Kwanza Sul', 'Província', 235, 540, 1, 'Cafe, agricultura, pesca, industria ligeira e comercio costeiro.', 'Regiao relevante nas economias de plantacao e na ligacao litoral-planalto.', 'Sumbe e Porto Amboim articulam litoral, agricultura e serviços.', '96,438 205,410 260,462 405,500 332,612 205,615 132,555'),
    this.area('benguela', 'angola', 'Benguela', 'Província', 170, 720, 1, 'Portos, Corredor do Lobito, comercio, pesca e industria.', 'O caminho-de-ferro de Benguela reorganizou mercadorias e pessoas no centro de Angola.', 'Amplie para Lobito e Benguela.', '132,555 205,615 302,620 320,762 230,820 100,790 82,690'),
    this.area('huambo', 'angola', 'Huambo', 'Província', 320, 705, 1, 'Agricultura de planalto, comercio, educacao e serviços regionais.', 'Centro histórico do planalto central e de redes ferroviarias e agricolas.', 'Area central para leitura do planalto agricola.', '302,620 420,610 420,760 320,762'),
    this.area('bie', 'angola', 'Bie', 'Província', 455, 660, 1, 'Agricultura, comercio interno e articulacao entre litoral, centro e leste.', 'Territorio do planalto central com importancia nas rotas interiores.', 'Kuito e municípios vizinhos aparecem ao ampliar.', '420,610 555,480 560,820 420,760'),
    this.area('huila', 'angola', 'Huila', 'Província', 260, 875, 1, 'Agropecuaria, comercio regional, turismo de altitude e serviços.', 'O planalto da Huila marcou encontros entre sociedades locais, missoes e ocupacao colonial.', 'Lubango e Humpata aparecem no zoom regional.', '100,790 230,820 320,762 420,760 420,940 320,995 180,980 95,910'),
    this.area('namibe', 'angola', 'Namibe', 'Província', 90, 970, 1, 'Pesca, porto, minerais, turismo costeiro e economia do deserto.', 'Litoral sul marcado por circulacao maritima, desertos e povoamentos costeiros.', 'Mocamedes e Tômbwa surgem no zoom.', '40,900 95,910 180,980 145,1110 35,1108'),
    this.area('cunene', 'angola', 'Cunene', 'Província', 330, 1030, 1, 'Pecuaria, comercio fronteirico, agricultura e gestao de agua.', 'Regiao associada a sociedades pastorís, fronteira sul e memoria de resistencia.', 'Ondjiva aparece ao ampliar.', '180,980 320,995 420,940 485,1080 420,1145 185,1140 145,1110'),
    this.area('cuando-cubango', 'angola', 'Kwando-Kubango', 'Província', 610, 990, 1, 'Agropecuaria, turismo natural, comercio fronteirico e conservacao.', 'Territorio de grandes rios, fronteiras e memorias militares do sudeste.', 'Menongue e Cuito Cuanavale aparecem no zoom.', '420,760 560,820 690,940 850,980 940,1140 485,1080 420,940'),
    this.area('viana', 'luanda', 'Viana', 'Município', 120, 382, 2, 'Zona industrial, armazens, habitacao e eixos de transporte da area metropolitana.', 'Cresceu com a expansao urbana e industrial de Luanda.', 'Município estrategico para logistica e periferia produtiva.'),
    this.area('belas', 'luanda', 'Belas', 'Município', 88, 414, 2, 'Imobiliario, turismo costeiro, comercio e serviços.', 'A expansao de Talatona e Mussulo marcou novas centralidades urbanas.', 'Inclui areas costeiras e urbanizacoes recentes.'),
    this.area('luanda-município', 'luanda', 'Luanda', 'Município', 68, 362, 2, 'Centro administrativo, financeiro, comercial e portuario.', 'Nucleo histórico da capital desde o periodo colonial.', 'Ao ampliar surgem Ingombota, Maianga e Mutamba.'),
    this.area('ingombota', 'luanda-município', 'Ingombota', 'Distrito', 62, 352, 3, 'Servicos públicos, bancos, comercio e sedes empresariais.', 'Centro histórico urbano de Luanda.', 'Distrito central da capital.'),
    this.area('maianga', 'luanda-município', 'Maianga', 'Distrito', 78, 372, 3, 'Educacao, serviços, comercio e circulacao diaria.', 'Area ligada a expansao urbana e administrativa da capital.', 'Aparece como distrito de leitura económica local.'),
    this.area('mutamba', 'ingombota', 'Mutamba', 'Bairro', 65, 345, 4, 'Comércio, transportes, serviços e memoria institucional.', 'Bairro associado a edificios públicos e memoria urbana de Luanda.', 'Ponto central de mobilidade e vida administrativa.'),
    this.area('avenida-4-fevereiro', 'mutamba', 'Av. 4 de Fevereiro', 'Avenida', 54, 338, 5, 'Eixo nobre de serviços, hoteis, bancos e frente maritima.', 'A marginal de Luanda concentra memoria urbana, representacao politica e comercio.', 'Avenida historica e económica junto a Baia de Luanda.'),
    this.area('lobito', 'benguela', 'Lobito', 'Município', 152, 700, 2, 'Porto, caminho-de-ferro e Corredor do Lobito.', 'Cidade marcada pelo caminho-de-ferro de Benguela.', 'Eixo logistico entre litoral, planalto e leste.'),
    this.area('benguela-município', 'benguela', 'Benguela', 'Município', 170, 735, 2, 'Comércio, pesca, serviços e turismo costeiro.', 'Cidade historica do litoral centro.', 'Centro urbano antigo de relacao atlântica.'),
    this.area('lubango', 'huila', 'Lubango', 'Município', 272, 850, 2, 'Servicos regionais, turismo, agropecuaria e comercio.', 'Cidade de planalto marcada por missoes, caminhos e administracao.', 'Centro urbano da Huila.'),
    this.area('saurimo', 'lunda-sul', 'Saurimo', 'Município', 795, 525, 2, 'Servicos mineiros, comercio e administracao regional.', 'Centro urbano ligado a Lunda-Chokwe e economia diamantifera.', 'Capital províncial da Lunda Sul.'),
    this.area('dundo', 'lunda-norte', 'Dundo', 'Município', 668, 332, 2, 'Diamantes, serviços e comercio fronteirico.', 'Cidade associada a industria diamantifera e cultura Chokwe.', 'Centro economico da Lunda Norte.'),
  ];

  readonly provinces = this.areas.filter((area) => area.level === 'Província' && area.points);
  readonly selectedArea = computed(() => this.areas.find((area) => area.id === this.selectedAreaId()) ?? this.areas[0]);
  readonly childAreas = computed(() => this.areas.filter((area) => area.parentId === this.selectedArea().id));
  readonly visibleSubAreas = computed(() =>
    this.areas.filter((area) => area.level !== 'País' && area.level !== 'Província' && area.minZoom <= this.zoom() && this.isInSelectedBranch(area.id)),
  );
  readonly zoomDescription = computed(() => ['País', 'Províncias', 'Municípios', 'Distritos', 'Bairros', 'Avenidas'][this.zoom()] ?? 'Avenidas');
  readonly nextLevelTitle = computed(() => this.childAreas().length ? `Abrir ${this.childAreas()[0].level.toLowerCase()}s` : 'Sem subdivisoes registadas');
  readonly mapTransform = computed(() => {
    const area = this.selectedArea();
    const scale = [1, 1, 1.8, 2.8, 4.2, 5.6][this.zoom()] ?? 5.6;
    const dx = 500 - area.x * scale;
    const dy = 580 - area.y * scale;
    return `translate(${dx} ${dy}) scale(${scale})`;
  });

  selectArea(id: string): void {
    const area = this.areas.find((item) => item.id === id);

    if (!area) {
      return;
    }

    this.selectedAreaId.set(id);
    this.zoom.update((value) => Math.max(value, area.minZoom));
  }

  zoomIn(): void {
    this.zoom.update((value) => Math.min(5, value + 1));
  }

  zoomOut(): void {
    this.zoom.update((value) => Math.max(1, value - 1));
  }

  resetMap(): void {
    this.selectedAreaId.set('angola');
    this.zoom.set(1);
  }

  isInSelectedPath(id: string): boolean {
    let current: MapArea | undefined = this.selectedArea();

    while (current) {
      if (current.id === id) {
        return true;
      }

      current = current.parentId ? this.areas.find((area) => area.id === current?.parentId) : undefined;
    }

    return this.areas.find((area) => area.id === id)?.parentId === this.selectedArea().id;
  }

  isInSelectedBranch(id: string): boolean {
    let current = this.areas.find((area) => area.id === id);

    while (current) {
      if (current.id === this.selectedArea().id || this.selectedArea().id === 'angola') {
        return true;
      }

      current = current.parentId ? this.areas.find((area) => area.id === current?.parentId) : undefined;
    }

    return false;
  }

  private area(
    id: string,
    parentId: string | undefined,
    name: string,
    level: AreaLevel,
    x: number,
    y: number,
    minZoom: number,
    economy: string,
    history: string,
    localInfo: string,
    points?: string,
  ): MapArea {
    return { id, parentId, name, level, x, y, minZoom, economy, history, localInfo, points };
  }
}


