import { Component, computed, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

type MapLevel = 'pais' | 'provincia' | 'municipio' | 'distrito' | 'bairro' | 'avenida';
type LayerKey = 'historia' | 'economia' | 'infraestrutura' | 'turismo' | 'educacao' | 'comercio';

interface MapRegion {
  id: string;
  parentId?: string;
  name: string;
  level: MapLevel;
  x: number;
  y: number;
  minZoom: number;
  shape?: string;
  line?: string;
  imageUrl: string;
  historia: string;
  economia: string;
  curiosidades: string[];
  socialIndicators: Array<{ label: string; value: string }>;
  economicIndicators: Array<{ label: string; value: string }>;
  chart: number[];
  layers: Record<LayerKey, string>;
}

interface MapLayer {
  key: LayerKey;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-economic-map-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  styles: [
    `
      .map-glass {
        background: rgba(25, 28, 29, 0.72);
        border: 1px solid rgba(216, 193, 196, 0.18);
        backdrop-filter: blur(14px);
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #616161;
        border-radius: 999px;
      }

      .sona-pattern {
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30-30-30z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
        opacity: 0.045;
      }

      .region-shape {
        cursor: pointer;
        fill: rgba(255, 177, 192, 0.16);
        stroke: rgba(255, 177, 192, 0.68);
        stroke-width: 4;
        transition: fill 160ms ease, stroke 160ms ease, filter 160ms ease;
        vector-effect: non-scaling-stroke;
      }

      .region-shape:hover,
      .region-shape.is-active {
        fill: rgba(255, 224, 136, 0.28);
        stroke: #E6D5B8;
        filter: drop-shadow(0 0 10px rgba(255, 224, 136, 0.55));
      }

      .sub-region {
        cursor: pointer;
      }

      .sub-region circle {
        fill: #212121;
        stroke: currentColor;
        stroke-width: 4;
        transition: transform 160ms ease, fill 160ms ease;
        vector-effect: non-scaling-stroke;
      }

      .sub-region:hover circle,
      .sub-region.is-active circle {
        fill: currentColor;
        transform: scale(1.22);
        transform-box: fill-box;
        transform-origin: center;
      }

      .road-line {
        fill: none;
        stroke: #E6D5B8;
        stroke-width: 7;
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
    `,
  ],
  templateUrl: './economic-map.page.html'
})
export class EconomicMapPage {
  readonly zoom = signal(0);
  readonly infoPanelOpen = signal(false);
  readonly activeLayer = signal<LayerKey>('economia');
  readonly searchTerm = signal('');
  readonly selectedRegionId = signal('angola');

  readonly layers: MapLayer[] = [
    { key: 'historia', label: 'História', icon: 'history_edu', color: '#E6D5B8' },
    { key: 'economia', label: 'Economia', icon: 'trending_up', color: '#E6D5B8' },
    { key: 'infraestrutura', label: 'Infraestrutura', icon: 'foundation', color: '#BDBDBD' },
    { key: 'turismo', label: 'Turismo', icon: 'travel_explore', color: '#E6D5B8' },
    { key: 'educacao', label: 'Educação', icon: 'school', color: '#E0E0E0' },
    { key: 'comercio', label: 'Comércio', icon: 'storefront', color: '#E6D5B8' },
  ];

  readonly regions: MapRegion[] = [
    this.region({
      id: 'angola',
      name: 'Angola',
      level: 'pais',
      x: 500,
      y: 570,
      minZoom: 0,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Angola%2C%20administrative%20divisions%20-%20en%20-%20colored.svg?width=900',
      historia: 'Angola reúne memórias de reinos africanos, rotas atlânticas, período colonial, luta de libertação, independência em 1975 e reconstrução nacional.',
      economia: 'A economia nacional é marcada por petróleo, diamantes, agricultura, portos, comércio e uma agenda de diversificação produtiva.',
      curiosidades: ['O mapa revela progressivamente regiões administrativas conforme o zoom.', 'As camadas permitem ler o território por temas independentes.'],
      socialIndicators: [
        { label: 'População', value: '36M+' },
        { label: 'Províncias', value: '18' },
      ],
      economicIndicators: [
        { label: 'Setores-chave', value: '6' },
        { label: 'Costa atlântica', value: '1.6k km' },
      ],
      chart: [44, 58, 66, 73, 81],
      layers: {
        historia: 'Leitura nacional desde os reinos do Kongo, Ndongo e Matamba até à Angola contemporânea.',
        economia: 'Camada de produção, circulação, exportação e centros de serviços.',
        infraestrutura: 'Portos, ferrovias, estradas, energia e ligações regionais.',
        turismo: 'Paísagens, património cultural e rotas históricas.',
        educacao: 'Centros urbanos, universidades, investigação e formação técnica.',
        comercio: 'Mercados internos, corredores logísticos e comércio transfronteiriço.',
      },
    }),
    this.region({ id: 'cabinda', parentId: 'angola', name: 'Cabinda', level: 'provincia', x: 72, y: 66, minZoom: 1, shape: '35,20 80,8 104,46 92,110 45,118 20,74', historia: 'Território com trajetória administrativa singular e forte ligação ao Atlântico e ao Congo.', economia: 'Enclave petrolífero com relevância energética, portuária e florestal.', curiosidades: ['Cabinda aparece separada do corpo principal do território angolano.'], socialIndicators: [{ label: 'Perfil', value: 'Urbano' }, { label: 'Ligação', value: 'Atlântico' }], economicIndicators: [{ label: 'Setor', value: 'Petróleo' }, { label: 'Recurso', value: 'Floresta' }] }),
    this.region({ id: 'zaire', parentId: 'angola', name: 'Zaire', level: 'provincia', x: 135, y: 170, minZoom: 1, shape: '30,150 95,122 248,120 270,150 238,205 158,235 82,232', historia: 'Região associada ao antigo Reino do Kongo e a redes políticas e comerciais pré-coloniais.', economia: 'Circulação transfronteiriça, agricultura, comércio e ligação ao corredor norte.', curiosidades: ['Mbanza Kongo é uma referência patrimonial e histórica.'], socialIndicators: [{ label: 'Património', value: 'Alto' }, { label: 'Fronteira', value: 'Norte' }], economicIndicators: [{ label: 'Comércio', value: 'Fronteira' }, { label: 'Agricultura', value: 'Café' }] }),
    this.region({ id: 'uige', parentId: 'angola', name: 'Uíge', level: 'provincia', x: 330, y: 218, minZoom: 1, shape: '248,120 435,118 462,205 438,292 345,285 302,240 238,205 270,150', historia: 'Área importante nas memórias do café, da ocupação colonial e das redes do interior norte.', economia: 'Agricultura, café, comércio regional e ligações ao norte do país.', curiosidades: ['O café estruturou parte da memória económica local.'], socialIndicators: [{ label: 'Perfil', value: 'Agrário' }, { label: 'Rede', value: 'Norte' }], economicIndicators: [{ label: 'Café', value: 'Histórico' }, { label: 'Comércio', value: 'Regional' }] }),
    this.region({ id: 'bengo', parentId: 'angola', name: 'Bengo', level: 'provincia', x: 168, y: 318, minZoom: 1, shape: '82,232 158,235 238,205 302,240 270,315 210,325 158,365 96,330', historia: 'Território de transição entre Luanda, o litoral e o interior norte.', economia: 'Agricultura periurbana, pesca, materiais de construção e abastecimento da capital.', curiosidades: ['A proximidade de Luanda cria uma economia periurbana dinâmica.'], socialIndicators: [{ label: 'Ligação', value: 'Luanda' }, { label: 'Perfil', value: 'Misto' }], economicIndicators: [{ label: 'Abastecimento', value: 'Alto' }, { label: 'Pesca', value: 'Litoral' }] }),
    this.region({ id: 'luanda', parentId: 'angola', name: 'Luanda', level: 'provincia', x: 75, y: 382, minZoom: 1, shape: '50,340 96,330 122,374 96,438 55,420', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Luanda%20Skyline%20-%20Angola%202015.jpg?width=900', historia: 'Fundada em 1576 por Paulo Dias de Novais, tornou-se capital política e económica de Angola independente.', economia: 'Maior centro financeiro, logístico, administrativo e de serviços do país.', curiosidades: ['A baía e o porto natural foram decisivos para a centralidade da cidade.'], socialIndicators: [{ label: 'População', value: '8.2M' }, { label: 'Urbanização', value: 'Alta' }], economicIndicators: [{ label: 'PIB regional', value: '35.4%' }, { label: 'Serviços', value: 'Muito alto' }] }),
    this.region({ id: 'kwanza-norte', parentId: 'angola', name: 'Kwanza Norte', level: 'provincia', x: 265, y: 370, minZoom: 1, shape: '210,325 270,315 350,318 342,445 260,462 205,410', historia: 'Região ligada a rotas interiores, produção agrícola e administração colonial.', economia: 'Agricultura, energia, comércio interno e articulação com o vale do Kwanza.', curiosidades: ['Conecta o eixo Luanda-Malanje ao centro do país.'], socialIndicators: [{ label: 'Vale', value: 'Kwanza' }, { label: 'Perfil', value: 'Interior' }], economicIndicators: [{ label: 'Energia', value: 'Relevante' }, { label: 'Agricultura', value: 'Média' }] }),
    this.region({ id: 'malanje', parentId: 'angola', name: 'Malanje', level: 'provincia', x: 430, y: 378, minZoom: 1, shape: '350,318 438,292 520,355 520,505 405,500 342,445', historia: 'Associada a rotas interiores, quedas de Calandula e transformações agrárias.', economia: 'Agricultura, energia, comércio regional e potencial logístico do interior norte.', curiosidades: ['As Quedas de Calandula são um importante símbolo turístico.'], socialIndicators: [{ label: 'Turismo', value: 'Natural' }, { label: 'Perfil', value: 'Interior' }], economicIndicators: [{ label: 'Agricultura', value: 'Alta' }, { label: 'Energia', value: 'Potencial' }] }),
    this.region({ id: 'lunda-norte', parentId: 'angola', name: 'Lunda Norte', level: 'provincia', x: 655, y: 388, minZoom: 1, shape: '520,300 815,212 812,360 702,495 555,480 520,400', historia: 'Região marcada por sociedades Lunda-Chokwe e redes políticas do leste.', economia: 'Diamantes, comércio fronteiriço e serviços associados à cadeia mineira.', curiosidades: ['O Dundo é um centro urbano ligado à história diamantífera.'], socialIndicators: [{ label: 'Fronteira', value: 'Leste' }, { label: 'Cultura', value: 'Chokwe' }], economicIndicators: [{ label: 'Diamantes', value: 'Alto' }, { label: 'Serviços', value: 'Mineiros' }] }),
    this.region({ id: 'lunda-sul', parentId: 'angola', name: 'Lunda Sul', level: 'provincia', x: 810, y: 530, minZoom: 1, shape: '702,495 812,360 930,392 940,565 855,610 742,585', historia: 'História ligada a redes Lunda-Chokwe, cultura material e autoridade política.', economia: 'Diamantes, serviços mineiros e circulação regional no leste.', curiosidades: ['Saurimo funciona como centro urbano regional.'], socialIndicators: [{ label: 'Capital', value: 'Saurimo' }, { label: 'Perfil', value: 'Mineiro' }], economicIndicators: [{ label: 'Diamantes', value: 'Alto' }, { label: 'Comércio', value: 'Regional' }] }),
    this.region({ id: 'moxico', parentId: 'angola', name: 'Moxico', level: 'provincia', x: 760, y: 720, minZoom: 1, shape: '555,480 702,495 742,585 940,565 940,760 850,760 850,980 690,940 560,820', historia: 'Território associado a longas rotas interiores e a memórias da guerra e reconstrução.', economia: 'Agricultura, madeira, comércio fronteiriço e potencial logístico oriental.', curiosidades: ['Luena estrutura uma extensa área de circulação leste.'], socialIndicators: [{ label: 'Extensão', value: 'Muito alta' }, { label: 'Fronteira', value: 'Leste' }], economicIndicators: [{ label: 'Madeira', value: 'Relevante' }, { label: 'Logística', value: 'Potencial' }] }),
    this.region({ id: 'kwanza-sul', parentId: 'angola', name: 'Kwanza Sul', level: 'provincia', x: 235, y: 540, minZoom: 1, shape: '96,438 205,410 260,462 405,500 332,612 205,615 132,555', historia: 'Região relevante nas economias de plantação e na ligação litoral-planalto.', economia: 'Café, agricultura, pesca, indústria ligeira e comércio costeiro.', curiosidades: ['Sumbe e Porto Amboim articulam litoral, agricultura e serviços.'], socialIndicators: [{ label: 'Costa', value: 'Centro' }, { label: 'Perfil', value: 'Misto' }], economicIndicators: [{ label: 'Café', value: 'Histórico' }, { label: 'Pesca', value: 'Litoral' }] }),
    this.region({ id: 'benguela', parentId: 'angola', name: 'Benguela', level: 'provincia', x: 170, y: 720, minZoom: 1, shape: '132,555 205,615 302,620 320,762 230,820 100,790 82,690', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Porto%20do%20Lobito%20-%20Angola%202015.jpg?width=900', historia: 'O caminho-de-ferro de Benguela reorganizou mercadorias e pessoas no centro de Angola.', economia: 'Portos, Corredor do Lobito, comércio, pesca e indústria.', curiosidades: ['O Lobito é uma porta atlântica para cadeias logísticas regionais.'], socialIndicators: [{ label: 'Portos', value: '2' }, { label: 'Corredor', value: 'Lobito' }], economicIndicators: [{ label: 'Logística', value: 'Alta' }, { label: 'Pesca', value: 'Alta' }] }),
    this.region({ id: 'huambo', parentId: 'angola', name: 'Huambo', level: 'provincia', x: 320, y: 705, minZoom: 1, shape: '302,620 420,610 420,760 320,762', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Huambo%20Central%20rotunda.jpg?width=900', historia: 'Centro histórico do planalto central e de redes ferroviárias e agrícolas.', economia: 'Agricultura de planalto, comércio, educação e serviços regionais.', curiosidades: ['A altitude influencia o perfil agrícola e urbano da região.'], socialIndicators: [{ label: 'Altitude', value: '1.7km' }, { label: 'Ensino', value: 'Regional' }], economicIndicators: [{ label: 'Agricultura', value: 'Alta' }, { label: 'Serviços', value: 'Regional' }] }),
    this.region({ id: 'bie', parentId: 'angola', name: 'Bié', level: 'provincia', x: 455, y: 660, minZoom: 1, shape: '420,610 555,480 560,820 420,760', historia: 'Território do planalto central com importância nas rotas interiores.', economia: 'Agricultura, comércio interno e articulação entre litoral, centro e leste.', curiosidades: ['Kuito é uma referência urbana no planalto.'], socialIndicators: [{ label: 'Centro', value: 'Geográfico' }, { label: 'Perfil', value: 'Agrário' }], economicIndicators: [{ label: 'Agricultura', value: 'Alta' }, { label: 'Comércio', value: 'Interno' }] }),
    this.region({ id: 'huila', parentId: 'angola', name: 'Huíla', level: 'provincia', x: 260, y: 875, minZoom: 1, shape: '100,790 230,820 320,762 420,760 420,940 320,995 180,980 95,910', historia: 'O planalto da Huíla marcou encontros entre sociedades locais, missões e ocupação colonial.', economia: 'Agropecuária, comércio regional, turismo de altitude e serviços.', curiosidades: ['Lubango é um importante polo turístico e urbano do sul.'], socialIndicators: [{ label: 'Turismo', value: 'Alto' }, { label: 'Perfil', value: 'Planalto' }], economicIndicators: [{ label: 'Agropecuária', value: 'Alta' }, { label: 'Serviços', value: 'Regional' }] }),
    this.region({ id: 'namibe', parentId: 'angola', name: 'Namibe', level: 'provincia', x: 90, y: 970, minZoom: 1, shape: '40,900 95,910 180,980 145,1110 35,1108', historia: 'Litoral sul marcado por circulação marítima, desertos e povoamentos costeiros.', economia: 'Pesca, porto, minerais, turismo costeiro e economia do deserto.', curiosidades: ['O deserto e o litoral criam uma paisagem económica singular.'], socialIndicators: [{ label: 'Costa', value: 'Sul' }, { label: 'Clima', value: 'Árido' }], economicIndicators: [{ label: 'Pesca', value: 'Alta' }, { label: 'Porto', value: 'Relevante' }] }),
    this.region({ id: 'cunene', parentId: 'angola', name: 'Cunene', level: 'provincia', x: 330, y: 1030, minZoom: 1, shape: '180,980 320,995 420,940 485,1080 420,1145 185,1140 145,1110', historia: 'Região associada a sociedades pastoris, fronteira sul e memória de resistência.', economia: 'Pecuária, comércio fronteiriço, agricultura e gestão de água.', curiosidades: ['A gestão da água é central para a vida económica local.'], socialIndicators: [{ label: 'Fronteira', value: 'Sul' }, { label: 'Perfil', value: 'Pastoril' }], economicIndicators: [{ label: 'Pecuária', value: 'Alta' }, { label: 'Água', value: 'Crítica' }] }),
    this.region({ id: 'cuando-cubango', parentId: 'angola', name: 'Kwando-Kubango', level: 'provincia', x: 610, y: 990, minZoom: 1, shape: '420,760 560,820 690,940 850,980 940,1140 485,1080 420,940', historia: 'Território de grandes rios, fronteiras e memórias militares do sudeste.', economia: 'Agropecuária, turismo natural, comércio fronteiriço e conservação.', curiosidades: ['Cuito Cuanavale tem forte significado histórico.'], socialIndicators: [{ label: 'Natureza', value: 'Alta' }, { label: 'Fronteira', value: 'Sudeste' }], economicIndicators: [{ label: 'Turismo', value: 'Natural' }, { label: 'Agropecuária', value: 'Média' }] }),
    this.region({ id: 'luanda-municipio', parentId: 'luanda', name: 'Luanda', level: 'municipio', x: 68, y: 362, minZoom: 2, historia: 'Núcleo histórico da capital desde o período colonial.', economia: 'Centro administrativo, financeiro, comercial e portuário.', curiosidades: ['Ao ampliar surgem Ingombota, Maianga e Mutamba.'], socialIndicators: [{ label: 'Centralidade', value: 'Máxima' }, { label: 'Densidade', value: 'Alta' }], economicIndicators: [{ label: 'Serviços', value: 'Alto' }, { label: 'Porto', value: 'Ativo' }] }),
    this.region({ id: 'viana', parentId: 'luanda', name: 'Viana', level: 'municipio', x: 120, y: 382, minZoom: 2, historia: 'Cresceu com a expansão urbana e industrial de Luanda.', economia: 'Zona industrial, armazéns, habitação e eixos de transporte metropolitano.', curiosidades: ['É estratégico para logística e periferia produtiva.'], socialIndicators: [{ label: 'Crescimento', value: 'Alto' }, { label: 'Habitação', value: 'Expansão' }], economicIndicators: [{ label: 'Indústria', value: 'Alta' }, { label: 'Logística', value: 'Alta' }] }),
    this.region({ id: 'belas', parentId: 'luanda', name: 'Belas', level: 'municipio', x: 88, y: 414, minZoom: 2, historia: 'A expansão de Talatona e Mussulo marcou novas centralidades urbanas.', economia: 'Imobiliário, turismo costeiro, comércio e serviços.', curiosidades: ['Combina áreas costeiras e urbanizações recentes.'], socialIndicators: [{ label: 'Urbanização', value: 'Alta' }, { label: 'Litoral', value: 'Sim' }], economicIndicators: [{ label: 'Imobiliário', value: 'Alto' }, { label: 'Turismo', value: 'Costeiro' }] }),
    this.region({ id: 'lobito', parentId: 'benguela', name: 'Lobito', level: 'municipio', x: 152, y: 700, minZoom: 2, imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Porto%20do%20Lobito%20-%20Angola%202015.jpg?width=900', historia: 'Cidade marcada pelo caminho-de-ferro de Benguela.', economia: 'Porto, caminho-de-ferro e Corredor do Lobito.', curiosidades: ['Eixo logístico entre litoral, planalto e leste.'], socialIndicators: [{ label: 'Mobilidade', value: 'Porto' }, { label: 'Corredor', value: 'Regional' }], economicIndicators: [{ label: 'Logística', value: 'Muito alta' }, { label: 'Porto', value: 'Estratégico' }] }),
    this.region({ id: 'ingombota', parentId: 'luanda-municipio', name: 'Ingombota', level: 'distrito', x: 62, y: 352, minZoom: 3, historia: 'Centro histórico urbano de Luanda.', economia: 'Serviços públicos, bancos, comércio e sedes empresariais.', curiosidades: ['Concentra edifícios institucionais e memória urbana.'], socialIndicators: [{ label: 'Serviços', value: 'Central' }, { label: 'Fluxo', value: 'Alto' }], economicIndicators: [{ label: 'Bancos', value: 'Alto' }, { label: 'Administração', value: 'Central' }] }),
    this.region({ id: 'maianga', parentId: 'luanda-municipio', name: 'Maianga', level: 'distrito', x: 78, y: 372, minZoom: 3, historia: 'Área ligada à expansão urbana e administrativa da capital.', economia: 'Educação, serviços, comércio e circulação diária.', curiosidades: ['É uma ponte entre zonas residenciais e serviços centrais.'], socialIndicators: [{ label: 'Educação', value: 'Alta' }, { label: 'Fluxo', value: 'Diário' }], economicIndicators: [{ label: 'Comércio', value: 'Local' }, { label: 'Serviços', value: 'Alto' }] }),
    this.region({ id: 'mutamba', parentId: 'ingombota', name: 'Mutamba', level: 'bairro', x: 65, y: 345, minZoom: 4, historia: 'Bairro associado a edifícios públicos e memória urbana de Luanda.', economia: 'Comércio, transportes, serviços e memória institucional.', curiosidades: ['É um ponto central de mobilidade e vida administrativa.'], socialIndicators: [{ label: 'Transporte', value: 'Central' }, { label: 'Uso', value: 'Misto' }], economicIndicators: [{ label: 'Comércio', value: 'Alto' }, { label: 'Serviços', value: 'Institucional' }] }),
    this.region({ id: 'avenida-4-fevereiro', parentId: 'mutamba', name: 'Av. 4 de Fevereiro', level: 'avenida', x: 54, y: 338, minZoom: 5, line: '48,336 54,338 62,342 72,348 86,354', historia: 'A marginal de Luanda concentra memória urbana, representação política e comércio.', economia: 'Eixo nobre de serviços, hotéis, bancos e frente marítima.', curiosidades: ['A avenida acompanha a baía de Luanda.'], socialIndicators: [{ label: 'Frente mar', value: 'Sim' }, { label: 'Fluxo', value: 'Alto' }], economicIndicators: [{ label: 'Hotéis', value: 'Alto' }, { label: 'Bancos', value: 'Alto' }] }),
  ];

  readonly selectedRegion = computed(() => this.regions.find((region) => region.id === this.selectedRegionId()) ?? this.regions[0]);
  readonly childRegions = computed(() => this.regions.filter((region) => region.parentId === this.selectedRegion().id));
  readonly visibleRegions = computed(() => this.regions.filter((region) => region.id !== 'angola' && region.minZoom <= this.zoom() && this.isInVisibleBranch(region)));
  readonly visibleShapeRegions = computed(() => this.visibleRegions().filter((region) => region.shape));
  readonly visibleLineRegions = computed(() => this.visibleRegions().filter((region) => region.line));
  readonly visiblePointRegions = computed(() => this.visibleRegions().filter((region) => !region.shape && !region.line));
  readonly filteredVisibleRegions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const regions = this.visibleRegions();
    return term ? regions.filter((region) => region.name.toLowerCase().includes(term)) : regions;
  });
  readonly zoomLabel = computed(() => {
    if (this.zoom() < 1) return 'Angola completa';
    if (this.zoom() < 2) return 'Províncias';
    if (this.zoom() < 3) return 'Municípios';
    if (this.zoom() < 4) return 'Distritos urbanos';
    if (this.zoom() < 5) return 'Bairros';
    return 'Avenidas e ruas';
  });
  readonly mapTransform = computed(() => {
    const selected = this.selectedRegion();
    const scale = this.zoom() < 1 ? 0.96 : 1 + this.zoom() * 0.72;
    const target = this.zoom() < 1 ? this.regions[0] : selected;
    const dx = 500 - target.x * scale;
    const dy = 580 - target.y * scale;
    return `translate(${dx} ${dy}) scale(${scale})`;
  });
  readonly mapCssTransform = computed(() => {
    const scale = this.zoom() < 1 ? 1 : 1 + this.zoom() * 0.12;
    return `scale(${scale})`;
  });

  selectRegion(region: MapRegion): void {
    this.selectedRegionId.set(region.id);
    this.infoPanelOpen.set(true);
    this.zoom.update((value) => Math.max(value, region.minZoom));
  }

  setZoom(value: string): void {
    this.zoom.set(this.clampZoom(Number(value)));
  }

  zoomIn(): void {
    this.zoom.update((value) => this.clampZoom(value + 0.5));
  }

  zoomOut(): void {
    this.zoom.update((value) => this.clampZoom(value - 0.5));
  }

  resetMap(): void {
    this.selectedRegionId.set('angola');
    this.zoom.set(0);
    this.infoPanelOpen.set(false);
  }

  closePanel(): void {
    this.infoPanelOpen.set(false);
  }

  onMapWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoom.update((value) => this.clampZoom(value + (event.deltaY > 0 ? -0.18 : 0.18)));
  }

  activeLayerLabel(): string {
    return this.layers.find((layer) => layer.key === this.activeLayer())?.label ?? 'Economia';
  }

  activeLayerColor(): string {
    return this.layers.find((layer) => layer.key === this.activeLayer())?.color ?? '#E6D5B8';
  }

  regionPositionX(region: MapRegion): number {
    return Math.min(92, Math.max(8, region.x / 10));
  }

  regionPositionY(region: MapRegion): number {
    return Math.min(94, Math.max(6, region.y / 11.6));
  }

  private isInVisibleBranch(region: MapRegion): boolean {
    if (region.level === 'provincia') {
      return true;
    }

    if (this.selectedRegion().id === 'angola') {
      return false;
    }

    let current: MapRegion | undefined = region;

    while (current) {
      if (current.id === this.selectedRegion().id) {
        return true;
      }

      current = current.parentId ? this.regions.find((item) => item.id === current?.parentId) : undefined;
    }

    return false;
  }

  private clampZoom(value: number): number {
    return Math.min(5, Math.max(0, Number.isFinite(value) ? value : 0));
  }

  private region(region: Omit<MapRegion, 'imageUrl' | 'chart' | 'layers'> & Partial<Pick<MapRegion, 'imageUrl' | 'chart' | 'layers'>>): MapRegion {
    return {
      imageUrl: region.imageUrl ?? 'https://commons.wikimedia.org/wiki/Special:FilePath/Angola%2C%20administrative%20divisions%20-%20en%20-%20colored.svg?width=900',
      chart: region.chart ?? [42, 55, 64, 72, 86],
      layers: {
        historia: region.layers?.historia ?? region.historia,
        economia: region.layers?.economia ?? region.economia,
        infraestrutura: region.layers?.infraestrutura ?? 'Infraestruturas de circulação, energia, serviços públicos e conexão territorial.',
        turismo: region.layers?.turismo ?? 'Pontos de memória, paísagem, património local e rotas de visita.',
        educacao: region.layers?.educacao ?? 'Escolas, centros de formação, universidades e circulação de conhecimento.',
        comercio: region.layers?.comercio ?? 'Mercados, serviços, logística, comércio formal e redes locais de troca.',
      },
      ...region,
    };
  }
}

export const ECONOMIC_MAP_ROUTES: Routes = [{ path: '', component: EconomicMapPage }];


