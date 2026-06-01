import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';

class SalaDeDebateScreen extends StatefulWidget {
  const SalaDeDebateScreen({super.key});

  @override
  State<SalaDeDebateScreen> createState() => _SalaDeDebateScreenState();
}

class _SalaDeDebateScreenState extends State<SalaDeDebateScreen> {
  final _mensagemController = TextEditingController();

  static const _mensagens = [
    _Mensagem(
      nome: 'Dr. Armando Silva',
      tempo: 'Há 2m',
      texto:
          'Bem-vindos ao debate sobre a economia cafeeira. Como avaliam a transição da produção colonial para as atuais cooperativas familiares no norte de Angola?',
      likes: 12,
      isProprioUsuario: false,
    ),
    _Mensagem(
      nome: 'Estudante Académico',
      tempo: 'Agora',
      texto:
          'Creio que o maior desafio reside na infraestrutura logística. Sem estradas funcionais, o prémio de qualidade do bago perde-se no custo do transporte.',
      likes: 0,
      isProprioUsuario: true,
    ),
    _Mensagem(
      nome: 'Maria Antónia',
      tempo: 'Há 45s',
      texto:
          'Concordo com o colega. Além disso, a literacia financeira nestas cooperativas é fundamental para que possam negociar diretamente no mercado internacional de commodities.',
      likes: 5,
      isProprioUsuario: false,
    ),
  ];

  @override
  void dispose() {
    _mensagemController.dispose();
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
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                itemCount: _mensagens.length,
                itemBuilder: (_, i) => _BolhaMensagem(mensagem: _mensagens[i]),
              ),
            ),
            _BarraInput(controller: _mensagemController),
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
          const Expanded(
            child: Text(
              'Sala de Debate',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textDark,
              ),
            ),
          ),
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

class _Mensagem {
  final String nome;
  final String tempo;
  final String texto;
  final int likes;
  final bool isProprioUsuario;

  const _Mensagem({
    required this.nome,
    required this.tempo,
    required this.texto,
    required this.likes,
    required this.isProprioUsuario,
  });
}

class _BolhaMensagem extends StatelessWidget {
  final _Mensagem mensagem;

  const _BolhaMensagem({required this.mensagem});

  @override
  Widget build(BuildContext context) {
    final isUser = mensagem.isProprioUsuario;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: isUser
            ? CrossAxisAlignment.end
            : CrossAxisAlignment.start,
        children: [
          if (!isUser)
            Padding(
              padding: const EdgeInsets.only(left: 4, bottom: 4),
              child: Row(
                children: [
                  Text(
                    mensagem.nome,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    mensagem.tempo,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textLight,
                    ),
                  ),
                ],
              ),
            ),
          if (isUser)
            Padding(
              padding: const EdgeInsets.only(right: 4, bottom: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    mensagem.tempo,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textLight,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    mensagem.nome,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                ],
              ),
            ),
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.78,
            ),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isUser ? AppColors.primary : Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(14),
                topRight: const Radius.circular(14),
                bottomLeft: isUser
                    ? const Radius.circular(14)
                    : const Radius.circular(4),
                bottomRight: isUser
                    ? const Radius.circular(4)
                    : const Radius.circular(14),
              ),
              border: isUser
                  ? null
                  : Border.all(color: const Color(0xFFEEE8E9)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              mensagem.texto,
              style: TextStyle(
                fontSize: 14,
                color: isUser ? Colors.white : AppColors.textMedium,
                height: 1.5,
              ),
            ),
          ),
          if (!isUser)
            Padding(
              padding: const EdgeInsets.only(top: 6, left: 4),
              child: Row(
                children: [
                  const Icon(
                    Icons.thumb_up_outlined,
                    size: 15,
                    color: AppColors.textLight,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${mensagem.likes}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textLight,
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Icon(
                    Icons.reply_rounded,
                    size: 15,
                    color: AppColors.textLight,
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    'Responder',
                    style: TextStyle(fontSize: 12, color: AppColors.textLight),
                  ),
                ],
              ),
            ),
          if (isUser)
            Padding(
              padding: const EdgeInsets.only(top: 6, right: 4),
              child: const Icon(
                Icons.favorite_border_rounded,
                size: 15,
                color: AppColors.textLight,
              ),
            ),
        ],
      ),
    );
  }
}

class _BarraInput extends StatelessWidget {
  final TextEditingController controller;

  const _BarraInput({required this.controller});

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
                hintText: 'Escreva uma mensagem...',
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
