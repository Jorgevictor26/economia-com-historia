import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';

class ConteudoScreen extends StatelessWidget {
  const ConteudoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _AppBar(),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              _Badge(
                                label: 'EXCLUSIVO',
                                cor: AppColors.primary,
                              ),
                              const SizedBox(width: 8),
                              _Badge(
                                label: 'JINDUNGO',
                                cor: const Color(0xFFB5933A),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          const Text(
                            'O Impacto do Café na Reconstrução das Redes Comerciais de Luanda do Século XIX',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                              height: 1.25,
                            ),
                          ),
                          const SizedBox(height: 16),
                          _AutorRow(),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
                    _ImagemPrincipal(),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 8),
                          const Text(
                            'Representação artística do porto de Luanda durante o auge da exportação cafeeira.',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.textLight,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 20),
                          _Paragrafo(
                            'A história econômica de Angola é muitas vezes reduzida a ciclos de extração, mas o período do café no século XIX representa uma mudança estrutural profunda. Não foi apenas uma troca de mercadoria; foi a gênese de uma nova classe mercantil luandense.',
                          ),
                          const SizedBox(height: 16),
                          _Paragrafo(
                            'As fazendas do Cuanza Norte não eram apenas centros de produção agrícola, mas polos de inovação logística que forçaram a modernização dos transportes para o litoral. O café exigia rapidez e preservação que os antigos ciclos não demandavam.',
                          ),
                          const SizedBox(height: 16),
                          _Paragrafo(
                            'Nesta edição do Jindungo, exploramos como as famílias tradicionais de Luanda redirecionaram capitais do comércio transatlântico para o solo angolano, criando as bases para a autonomia econômica que veríamos florescer décadas depois.',
                          ),
                          const SizedBox(height: 20),
                          _CitacaoDestaque(),
                          const SizedBox(height: 20),
                          _Paragrafo(
                            'Este movimento deu origem a uma arquitetura urbana específica, com armazéns que ainda hoje pontuam a Baixa, transformados agora em espaços de cultura e novas economias digitais.',
                          ),
                          const SizedBox(height: 24),
                          _AcoesArtigo(),
                          const Divider(color: Color(0xFFEEE8E9), height: 32),
                          const Text(
                            'Relacionados',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(height: 14),
                          _RelacionadoCard(),
                          const SizedBox(height: 32),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AppBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.maybePop(context),
            child: const Icon(
              Icons.arrow_back_rounded,
              color: AppColors.primary,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          const Text(
            'Conteúdo',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textDark,
            ),
          ),
          const Spacer(),
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.notifications_none_rounded,
              color: AppColors.textDark,
            ),
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.search_rounded, color: AppColors.textDark),
          ),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color cor;

  const _Badge({required this.label, required this.cor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: cor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: Colors.white,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _AutorRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.asset(
            'assets/images/Manuel_Cassule.png',
            width: 40,
            height: 40,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: 40,
              height: 40,
              color: const Color(0xFFEEE8E9),
              child: const Icon(
                Icons.person_outline_rounded,
                color: AppColors.textLight,
                size: 22,
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'Dr. Manuel dos Santos',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.textDark,
              ),
            ),
            SizedBox(height: 2),
            Text(
              '12 de Outubro  •  8 min de leitura',
              style: TextStyle(fontSize: 12, color: AppColors.textLight),
            ),
          ],
        ),
      ],
    );
  }
}

class _ImagemPrincipal extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 220,
      child: Image.asset(
        'assets/images/porto_de_luanda.png',
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          color: const Color(0xFFEEE8E9),
          child: const Center(
            child: Icon(
              Icons.image_outlined,
              color: AppColors.textLight,
              size: 40,
            ),
          ),
        ),
      ),
    );
  }
}

class _Paragrafo extends StatelessWidget {
  final String texto;

  const _Paragrafo(this.texto);

  @override
  Widget build(BuildContext context) {
    return Text(
      texto,
      style: const TextStyle(
        fontSize: 15,
        color: AppColors.textMedium,
        height: 1.7,
      ),
    );
  }
}

class _CitacaoDestaque extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
      decoration: BoxDecoration(
        border: const Border(
          left: BorderSide(color: AppColors.secondaryDark, width: 3),
        ),
        color: const Color(0xFFF7F3F4),
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(10),
          bottomRight: Radius.circular(10),
        ),
      ),
      child: const Text(
        '"O café foi o primeiro produto que fez Luanda olhar para o interior de Angola com olhos de investimento, e não apenas de passagem."',
        style: TextStyle(
          fontSize: 15,
          fontStyle: FontStyle.italic,
          color: AppColors.primary,
          height: 1.6,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _AcoesArtigo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(
          Icons.favorite_border_rounded,
          color: AppColors.textLight,
          size: 20,
        ),
        const SizedBox(width: 6),
        const Text(
          '1.2k',
          style: TextStyle(fontSize: 13, color: AppColors.textLight),
        ),
        const SizedBox(width: 20),
        const Icon(
          Icons.chat_bubble_outline_rounded,
          color: AppColors.textLight,
          size: 18,
        ),
        const SizedBox(width: 6),
        const Text(
          '48',
          style: TextStyle(fontSize: 13, color: AppColors.textLight),
        ),
        const Spacer(),
        const Icon(Icons.share_outlined, color: AppColors.textLight, size: 20),
        const SizedBox(width: 16),
        const Icon(
          Icons.bookmark_border_rounded,
          color: AppColors.textLight,
          size: 20,
        ),
      ],
    );
  }
}

class _RelacionadoCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEEE8E9)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'HISTÓRIA COLONIAL',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppColors.secondaryDark,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'A Rota do Sal e as Trocas no Sul',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                ],
              ),
            ),
          ),
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topRight: Radius.circular(12),
              bottomRight: Radius.circular(12),
            ),
            child: Image.asset(
              'assets/images/Sal_e_tracas.png',
              width: 90,
              height: 80,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                width: 90,
                height: 80,
                color: const Color(0xFFEEE8E9),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
