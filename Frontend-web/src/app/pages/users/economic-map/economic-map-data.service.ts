import { Injectable } from '@angular/core';
import { MapBreadcrumbItem, MapLayerOption, MapLevel, MapRegionInfo } from './economic-map.models';

@Injectable({ providedIn: 'root' })
export class EconomicMapDataService {
  private readonly defaultMapImage = 'https://commons.wikimedia.org/wiki/Special:FilePath/Angola%2C%20administrative%20divisions%20-%20en%20-%20colored.svg?width=900';

  readonly layers: MapLayerOption[] = [
    { key: 'history', label: 'História', icon: 'history_edu' },
    { key: 'economy', label: 'Economia', icon: 'trending_up' },
    { key: 'infrastructure', label: 'Infraestrutura', icon: 'foundation' },
    { key: 'resources', label: 'Recursos Naturais', icon: 'travel_explore' },
    { key: 'tourism', label: 'Turismo', icon: 'photo_camera' },
  ];

  readonly quickFilters = ['Produção agrícola', 'Indústria', 'Comércio', 'Turismo', 'Petróleo', 'Mineração'];

  private readonly regions: MapRegionInfo[] = [
    {
      id: 'angola',
      level: 'country',
      typeLabel: 'País',
      name: 'Angola',
      capital: 'Luanda',
      area: '1.246.700 km²',
      population: '36M+ hab.',
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Luanda%20Skyline%20-%20Angola%202015.jpg?width=900',
      summary: 'Angola articula litoral atlântico, planalto central, corredores logísticos, economias mineiras e redes agrícolas regionais.',
      economy: 'A economia nacional combina petróleo, diamantes, agricultura, comércio, energia, portos e uma agenda de diversificação produtiva.',
      history: 'O território reúne memórias dos reinos do Kongo, Ndongo, Matamba e Lunda, a experiência colonial, a independência e a reconstrução contemporânea.',
      stats: [
        { label: 'Províncias', value: '18', icon: 'map' },
        { label: 'Capital', value: 'Luanda', icon: 'location_city' },
        { label: 'Costa', value: '1.650 km', icon: 'waves' },
      ],
      highlights: ['Petróleo e gás no litoral', 'Diamantes no nordeste', 'Agricultura no planalto central', 'Corredores portuários atlânticos'],
      gallery: [
        { title: 'Baía de Luanda', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Luanda%20Skyline%20-%20Angola%202015.jpg?width=900' },
        { title: 'Porto do Lobito', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Porto%20do%20Lobito%20-%20Angola%202015.jpg?width=900' },
      ],
      childrenLabel: 'Explorar Províncias',
      nextLevel: 'province',
    },
    this.province('cabinda', 'Cabinda', 'Cabinda', '7.270 km²', '820.000 hab.', 'Enclave atlântico com forte papel energético, florestal e comercial.', 'Petróleo offshore, madeira, pesca e serviços portuários.', 'Território com percurso administrativo singular e relações históricas com o Baixo Congo.', ['Petróleo offshore', 'Madeira e comércio transfronteiriço']),
    this.province('zaire', 'Zaire', 'Mbanza Kongo', '40.130 km²', '720.000 hab.', 'Região norte ligada ao património do antigo Reino do Kongo e à fronteira com a RDC.', 'Agricultura, pesca, petróleo, comércio fronteiriço e circulação regional.', 'Mbanza Kongo é uma referência maior da história política e cultural centro-africana.', ['Mbanza Kongo', 'Comércio fronteiriço', 'Agricultura']),
    this.province('uige', 'Uíge', 'Uíge', '58.698 km²', '1.700.000 hab.', 'Província agrícola do norte com forte memória ligada ao café.', 'Café, mandioca, comércio regional e serviços administrativos.', 'As economias de plantação e as rotas do interior norte marcaram a região.', ['Café', 'Mandioca', 'Mercados regionais']),
    this.province('bengo', 'Bengo', 'Caxito', '31.371 km²', '500.000 hab.', 'Território de transição entre Luanda, litoral e interior norte.', 'Agricultura periurbana, pesca, abastecimento alimentar e materiais de construção.', 'A proximidade da capital moldou circulação, povoamento e produção.', ['Abastecimento de Luanda', 'Pesca', 'Agricultura']),
    this.province('luanda', 'Luanda', 'Luanda', '18.835 km²', '9.000.000 hab.', 'Principal centro urbano, político, financeiro e logístico de Angola.', 'Serviços, banca, comércio, porto, tecnologia, construção e administração pública.', 'Fundada em 1576, tornou-se capital colonial e depois capital nacional independente.', ['Banca e serviços', 'Porto de Luanda', 'Administração pública']),
    this.province('kwanza-norte', 'Cuanza Norte', 'Ndalatando', '24.110 km²', '520.000 hab.', 'Região interior articulada pelo vale do Kwanza.', 'Agricultura, energia, comércio interno e serviços regionais.', 'O corredor do Kwanza ligou rotas de produção e circulação no interior.', ['Energia', 'Agricultura', 'Comércio interno']),
    this.province('malanje', 'Malanje', 'Malanje', '97.602 km²', '1.100.000 hab.', 'Província interior com forte potencial agrícola, energético e turístico.', 'Agricultura, energia, comércio regional e turismo natural.', 'As Quedas de Calandula e as rotas interiores dão densidade histórica à região.', ['Quedas de Calandula', 'Agricultura', 'Energia']),
    this.province('lunda-norte', 'Lunda Norte', 'Dundo', '103.760 km²', '1.000.000 hab.', 'Província diamantífera e fronteiriça do nordeste.', 'Diamantes, serviços mineiros e comércio fronteiriço.', 'A região integra memórias Lunda-Chokwe e redes políticas do leste.', ['Diamantes', 'Dundo', 'Cultura Chokwe']),
    this.province('lunda-sul', 'Lunda Sul', 'Saurimo', '77.637 km²', '650.000 hab.', 'Centro mineiro e urbano do leste angolano.', 'Diamantes, comércio regional e serviços associados à mineração.', 'A cultura Lunda-Chokwe estrutura parte da memória política e material regional.', ['Diamantes', 'Saurimo', 'Serviços mineiros']),
    this.province('moxico', 'Moxico', 'Luena', '223.023 km²', '950.000 hab.', 'Extensa região oriental de rios, fronteiras e circulação interior.', 'Agricultura, madeira, comércio fronteiriço e logística oriental.', 'Rotas longas, guerra e reconstrução fazem parte da memória contemporânea local.', ['Madeira', 'Logística oriental', 'Fronteira']),
    this.province('kwanza-sul', 'Cuanza Sul', 'Sumbe', '55.660 km²', '2.100.000 hab.', 'Província costeira e agrícola entre litoral e planalto.', 'Café, pesca, agricultura, indústria ligeira e comércio costeiro.', 'As plantações e os portos locais marcaram a história económica regional.', ['Café', 'Pesca', 'Porto Amboim']),
    this.province('benguela', 'Benguela', 'Benguela', '39.826 km²', '2.500.000 hab.', 'Província atlântica ligada ao Corredor do Lobito.', 'Portos, caminho-de-ferro, pesca, indústria, comércio e logística.', 'O Caminho-de-Ferro de Benguela reorganizou mercadorias e mobilidade no centro do país.', ['Corredor do Lobito', 'Portos', 'Pesca']),
    {
      ...this.province('huambo', 'Huambo', 'Huambo', '34.270 km²', '2.270.255 hab.', 'A província do Huambo é uma das mais importantes do planalto central de Angola, com forte presença na agricultura, pecuária e comércio regional.', 'Milho, batata, feijão, café, pecuária, pequena indústria transformadora e mercados regionais.', 'Centro histórico do planalto central, marcado por ferrovia, agricultura e reconstrução urbana.', ['Principais produtos: Milho, Batata, Feijão, Café', 'Pecuária: Bovinos, Suínos, Aves', 'Comércio: Forte presença de mercados regionais', 'Indústria: Pequena indústria transformadora'], 'https://commons.wikimedia.org/wiki/Special:FilePath/Huambo%20Central%20rotunda.jpg?width=900'),
      stats: [
        { label: 'Municípios', value: '11', icon: 'map' },
        { label: 'Distritos Urbanos', value: '2', icon: 'business_center' },
        { label: 'PIB Estimado', value: '1,8%', icon: 'monitoring' },
      ],
    },
    this.province('bie', 'Bié', 'Cuito', '70.314 km²', '1.800.000 hab.', 'Província central com peso agrícola e posição estratégica no planalto.', 'Agricultura, comércio interno e articulação entre litoral, centro e leste.', 'O Cuito tornou-se referência urbana e histórica no centro de Angola.', ['Agricultura', 'Comércio interno', 'Planalto central']),
    this.province('huila', 'Huíla', 'Lubango', '79.023 km²', '2.900.000 hab.', 'Planalto sul com forte perfil agropecuário, urbano e turístico.', 'Agropecuária, comércio, turismo, educação e serviços regionais.', 'Missões, povoamentos e paisagens de altitude moldaram a história local.', ['Agropecuária', 'Turismo', 'Lubango']),
    this.province('namibe', 'Namibe', 'Moçâmedes', '57.091 km²', '650.000 hab.', 'Litoral desértico do sul com porto, pesca e turismo costeiro.', 'Pesca, porto, minerais, turismo e economia do deserto.', 'O litoral e o deserto criaram formas singulares de povoamento e circulação.', ['Pesca', 'Porto', 'Deserto']),
    this.province('cunene', 'Cunene', 'Ondjiva', '87.342 km²', '1.100.000 hab.', 'Região pastoril e fronteiriça do sul.', 'Pecuária, comércio fronteiriço, agricultura e gestão da água.', 'Sociedades pastoris, fronteira e resistência marcam a memória regional.', ['Pecuária', 'Água', 'Fronteira sul']),
    this.province('cuando-cubango', 'Cuando Cubango', 'Menongue', '199.049 km²', '700.000 hab.', 'Sudeste de grandes rios, reservas naturais e fronteiras.', 'Agropecuária, turismo natural, conservação e comércio fronteiriço.', 'Cuito Cuanavale e as rotas do sudeste têm forte significado histórico.', ['Turismo natural', 'Agropecuária', 'Cuito Cuanavale']),
    this.municipality('huambo-municipio', 'huambo', 'Huambo', 'Município', '2.609 km²', '665.000 hab.', 'Município capital com serviços, comércio, educação superior e mercados urbanos.', 'Centro ferroviário, administrativo e comercial do planalto central.'),
    this.municipality('caala', 'huambo', 'Caála', 'Município', '3.680 km²', '370.000 hab.', 'Município agrícola e comercial próximo da capital provincial.', 'Produção agrícola, pequenos mercados e ligação ferroviária.'),
    this.municipality('bailundo', 'huambo', 'Bailundo', 'Município', '7.065 km²', '390.000 hab.', 'Área de forte memória política ovimbundu e produção agrícola.', 'Agricultura familiar, milho, batata e comércio rural.'),
    this.municipality('luanda-municipio', 'luanda', 'Luanda', 'Município', '116 km²', '2.100.000 hab.', 'Núcleo urbano, administrativo, portuário e financeiro da capital.', 'Serviços, banca, administração, comércio e turismo urbano.'),
    this.municipality('viana', 'luanda', 'Viana', 'Município', '1.344 km²', '2.000.000 hab.', 'Eixo industrial e logístico da área metropolitana.', 'Indústria, armazéns, comércio grossista e mobilidade metropolitana.'),
    this.municipality('belas', 'luanda', 'Belas', 'Município', '1.046 km²', '1.500.000 hab.', 'Município costeiro e residencial com novas centralidades.', 'Imobiliário, serviços, turismo costeiro e comércio.'),
    this.district('se-catedral', 'huambo-municipio', 'Sé Catedral', 'Distrito urbano', 'Centro institucional e comercial do Huambo.', 'Património urbano, comércio formal e serviços públicos.'),
    this.district('sao-joao', 'huambo-municipio', 'São João', 'Distrito urbano', 'Zona residencial e de serviços na cidade do Huambo.', 'Pequeno comércio, mobilidade local e equipamentos sociais.'),
    this.district('ingombota', 'luanda-municipio', 'Ingombota', 'Distrito urbano', 'Centro histórico e institucional de Luanda.', 'Bancos, serviços públicos, turismo urbano e comércio.'),
    this.district('maianga', 'luanda-municipio', 'Maianga', 'Distrito urbano', 'Zona urbana de serviços, educação e mobilidade diária.', 'Educação, comércio local e serviços administrativos.'),
  ];

  getRegion(id: string): MapRegionInfo {
    return this.regions.find((region) => region.id === id) ?? this.regions[0];
  }

  getChildren(parentId: string): MapRegionInfo[] {
    return this.regions.filter((region) => region.parentId === parentId);
  }

  search(term: string): MapRegionInfo[] {
    const normalizedTerm = this.normalize(term);
    if (!normalizedTerm) {
      return [];
    }

    return this.regions
      .filter((region) => region.id !== 'angola' && this.normalize(`${region.name} ${region.typeLabel}`).includes(normalizedTerm))
      .slice(0, 8);
  }

  breadcrumbFor(regionId: string): MapBreadcrumbItem[] {
    const trail: MapBreadcrumbItem[] = [];
    let current: MapRegionInfo | undefined = this.getRegion(regionId);

    while (current) {
      trail.unshift({ id: current.id, label: current.name, level: current.level });
      current = current.parentId ? this.regions.find((region) => region.id === current?.parentId) : undefined;
    }

    return trail;
  }

  private province(id: string, name: string, capital: string, area: string, population: string, summary: string, economy: string, history: string, highlights: string[], imageUrl = this.defaultMapImage): MapRegionInfo {
    return {
      id,
      parentId: 'angola',
      level: 'province',
      typeLabel: 'Província',
      name,
      capital,
      area,
      population,
      imageUrl,
      summary,
      economy,
      history,
      stats: [
        { label: 'Municípios', value: id === 'huambo' ? '11' : id === 'luanda' ? '9' : '-', icon: 'map' },
        { label: 'Capital', value: capital, icon: 'location_city' },
        { label: 'Perfil', value: highlights[0] ?? 'Regional', icon: 'monitoring' },
      ],
      highlights,
      gallery: [
        { title: name, imageUrl },
        { title: 'Mapa administrativo', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Angola%2C%20administrative%20divisions%20-%20en%20-%20colored.svg?width=900' },
      ],
      childrenLabel: 'Explorar Municípios',
      nextLevel: 'municipality',
    };
  }

  private municipality(id: string, parentId: string, name: string, capital: string, area: string, population: string, summary: string, economy: string): MapRegionInfo {
    return {
      id,
      parentId,
      level: 'municipality',
      typeLabel: 'Município',
      name,
      capital,
      area,
      population,
      imageUrl: this.defaultMapImage,
      summary,
      economy,
      history: summary,
      stats: [
        { label: 'Área', value: area, icon: 'crop_square' },
        { label: 'População', value: population, icon: 'groups' },
        { label: 'Sede', value: capital, icon: 'location_city' },
      ],
      highlights: [economy, 'Mercados locais', 'Serviços públicos'],
      gallery: [{ title: name, imageUrl: this.defaultMapImage }],
      childrenLabel: 'Explorar Distritos',
      nextLevel: 'district',
    };
  }

  private district(id: string, parentId: string, name: string, capital: string, summary: string, economy: string): MapRegionInfo {
    return {
      id,
      parentId,
      level: 'district',
      typeLabel: 'Distrito',
      name,
      capital,
      imageUrl: this.defaultMapImage,
      summary,
      economy,
      history: summary,
      stats: [
        { label: 'Escala', value: 'Urbana', icon: 'domain' },
        { label: 'Município', value: 'Urbano', icon: 'map' },
        { label: 'Atividade', value: 'Serviços', icon: 'monitoring' },
      ],
      highlights: [economy, 'Serviços de proximidade', 'Mobilidade urbana'],
      gallery: [{ title: name, imageUrl: this.defaultMapImage }],
    };
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}

