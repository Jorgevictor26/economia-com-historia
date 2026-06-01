import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';

class DiscussaoScreen extends StatefulWidget {
  const DiscussaoScreen({super.key});

  @override
  State<DiscussaoScreen> createState() => _DiscussaoScreenState();
}

class _DiscussaoScreenState extends State<DiscussaoScreen> {
  final _comentarioController = TextEditingController();

  static const _comentarios = [
    _Comentario(
      iniciais: 'AM',
      nome: 'Dr. Agostinho Manuel',
      tempo: 'há 2h',
      texto:
          'Este artigo clarifica muito bem a transição entre as moedas tradicionais (Nzimbu) e as primeiras introduções coloniais. Seria interessante aprofundar a relação diplomática de Mbanza Kongo com as potências europeias da época.',
      likes: 12,
      temAvatar: false,
    ),
    _Comentario(
      iniciais: 'IC',
      nome: 'Isabel Castro',
      tempo: 'há 45m',
      texto:
          'Concordo plenamente, Doutor. Existem registos na Torre do Tombo que detalham essas trocas de embaixadores que muitas vezes são ignoradas nos manuais escolares.',
      likes: 5,
      temAvatar: true,
    ),
    _Comentario(
      iniciais: 'JN',
      nome: 'Joaquim Neto',
      tempo: 'há 5h',
      texto:
          'Como é que os mercados regionais reagiram à introdução de metais preciosos como reserva de valor em substituição dos bens de consumo diretos?',
      likes: 8,
      temAvatar: false,
    ),
  ];

  @override
  void dispose() {
    _comentarioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _AppBar(),
            _CabecalhoArtigo(),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
                itemCount: _comentarios.length,
                separatorBuilder: (_, __) => const SizedBox(height: 4),
                itemBuilder: (_, i) =>
                    _ComentarioTile(comentario: _comentarios[i]),
              ),
            ),
            _BarraComentario(controller: _comentarioController),
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
            'Discussão',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
          const Spacer(),
          const Icon(
            Icons.more_vert_rounded,
            color: AppColors.textMedium,
            size: 22,
          ),
        ],
      ),
    );
  }
}

class _CabecalhoArtigo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 14),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFEEE8E9))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            'A Evolução do Comércio no Reino do Kongo',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textDark,
            ),
          ),
          SizedBox(height: 4),
          Text(
            '24 comentários',
            style: TextStyle(fontSize: 13, color: AppColors.textMedium),
          ),
        ],
      ),
    );
  }
}

class _Comentario {
  final String iniciais;
  final String nome;
  final String tempo;
  final String texto;
  final int likes;
  final bool temAvatar;

  const _Comentario({
    required this.iniciais,
    required this.nome,
    required this.tempo,
    required this.texto,
    required this.likes,
    required this.temAvatar,
  });
}

class _ComentarioTile extends StatelessWidget {
  final _Comentario comentario;

  const _ComentarioTile({required this.comentario});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Avatar(iniciais: comentario.iniciais, temFoto: comentario.temAvatar),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      comentario.nome,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textDark,
                      ),
                    ),
                    Text(
                      comentario.tempo,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  comentario.texto,
                  style: const TextStyle(
                    fontSize: 13.5,
                    color: AppColors.textMedium,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(
                      Icons.favorite_border_rounded,
                      size: 16,
                      color: AppColors.textLight,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${comentario.likes}',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textLight,
                      ),
                    ),
                    const SizedBox(width: 20),
                    const Icon(
                      Icons.chat_bubble_outline_rounded,
                      size: 15,
                      color: AppColors.textLight,
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      'Responder',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final String iniciais;
  final bool temFoto;

  const _Avatar({required this.iniciais, required this.temFoto});

  @override
  Widget build(BuildContext context) {
    if (temFoto) {
      return CircleAvatar(
        radius: 18,
        backgroundColor: const Color(0xFFEEE8E9),
        child: ClipOval(
          child: Image.asset(
            'assets/images/Imagem_perfil.png',
            width: 36,
            height: 36,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Text(
              iniciais,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
        ),
      );
    }
    return CircleAvatar(
      radius: 18,
      backgroundColor: AppColors.primary,
      child: Text(
        iniciais,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    );
  }
}

class _BarraComentario extends StatelessWidget {
  final TextEditingController controller;

  const _BarraComentario({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFEEE8E9))),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              style: const TextStyle(fontSize: 14, color: AppColors.textDark),
              decoration: InputDecoration(
                hintText: 'Adicionar comentário...',
                hintStyle: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textLight,
                ),
                filled: true,
                fillColor: const Color(0xFFF7F3F4),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                suffixIcon: const Icon(
                  Icons.image_outlined,
                  color: AppColors.textLight,
                  size: 20,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.send_rounded,
              color: Colors.white,
              size: 18,
            ),
          ),
        ],
      ),
    );
  }
}
