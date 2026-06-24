import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';

class CriarSalaDebateScreen extends StatefulWidget {
  const CriarSalaDebateScreen({super.key});

  @override
  State<CriarSalaDebateScreen> createState() => _CriarSalaDebateScreenState();
}

class _CriarSalaDebateScreenState extends State<CriarSalaDebateScreen> {
  final _nomeController = TextEditingController();
  final _descricaoController = TextEditingController();
  String? _categoriaSeleccionada;
  bool _isPublico = true;
  bool _aceitouDiretrizes = false;

  static const _categorias = [
    'Economia Angolana',
    'História Colonial',
    'Mercados Emergentes',
    'Política Monetária',
    'Comércio Internacional',
    'História Geral de Angola',
  ];

  @override
  void dispose() {
    _nomeController.dispose();
    _descricaoController.dispose();
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
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    const Text(
                      'NOVO DEBATE',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textLight,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Configurações da Sala',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                      ),
                    ),
                    const Divider(color: Color(0xFFEEE8E9), height: 24),
                    const SizedBox(height: 4),
                    _RotuloCampo(label: 'Nome da Sala'),
                    const SizedBox(height: 8),
                    _CampoTexto(
                      controller: _nomeController,
                      hint: 'Ex: Impactos da Industrialização em Luanda',
                      maxLines: 1,
                    ),
                    const SizedBox(height: 20),
                    _RotuloCampo(label: 'Categoria'),
                    const SizedBox(height: 8),
                    _DropdownCategoria(
                      valor: _categoriaSeleccionada,
                      opcoes: _categorias,
                      onChanged: (v) =>
                          setState(() => _categoriaSeleccionada = v),
                    ),
                    const SizedBox(height: 20),
                    _RotuloCampo(label: 'Descrição'),
                    const SizedBox(height: 8),
                    _CampoTexto(
                      controller: _descricaoController,
                      hint:
                          'Descreva o propósito deste fórum e os principais tópicos de debate...',
                      maxLines: 5,
                    ),
                    const SizedBox(height: 20),
                    _RotuloCampo(label: 'Privacidade'),
                    const SizedBox(height: 8),
                    _SeletorPrivacidade(
                      isPublico: _isPublico,
                      onChanged: (v) => setState(() => _isPublico = v),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Salas públicas podem ser encontradas por qualquer estudante. Salas privadas exigem um convite ou código de acesso.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textMedium,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 20),
                    _CheckDiretrizes(
                      valor: _aceitouDiretrizes,
                      onChanged: (v) =>
                          setState(() => _aceitouDiretrizes = v ?? false),
                    ),
                    const SizedBox(height: 28),
                  ],
                ),
              ),
            ),
            _BotoesAcao(
              podecriar:
                  _aceitouDiretrizes &&
                  _nomeController.text.isNotEmpty &&
                  _categoriaSeleccionada != null,
              onCriar: () => Navigator.maybePop(context),
              onCancelar: () => Navigator.maybePop(context),
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
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.maybePop(context),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0x4DD8C1C4),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.chevron_left_rounded,
                color: AppColors.textDark,
                size: 22,
              ),
            ),
          ),
          const SizedBox(width: 12),
          const Text(
            'Fórum',
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

class _RotuloCampo extends StatelessWidget {
  final String label;

  const _RotuloCampo({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: AppColors.textDark,
      ),
    );
  }
}

class _CampoTexto extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final int maxLines;

  const _CampoTexto({
    required this.controller,
    required this.hint,
    required this.maxLines,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(fontSize: 14, color: AppColors.textDark),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(fontSize: 14, color: AppColors.textLight),
        filled: true,
        fillColor: Colors.white,
        border: const UnderlineInputBorder(
          borderSide: BorderSide(color: Color(0xFFEEE8E9)),
        ),
        enabledBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Color(0xFFEEE8E9)),
        ),
        focusedBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: AppColors.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(vertical: 10),
        isDense: true,
      ),
    );
  }
}

class _DropdownCategoria extends StatelessWidget {
  final String? valor;
  final List<String> opcoes;
  final ValueChanged<String?> onChanged;

  const _DropdownCategoria({
    required this.valor,
    required this.opcoes,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFEEE8E9))),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: valor,
          hint: const Text(
            'Selecione uma categoria',
            style: TextStyle(fontSize: 14, color: AppColors.textLight),
          ),
          isExpanded: true,
          icon: const Icon(
            Icons.keyboard_arrow_down_rounded,
            color: AppColors.textMedium,
          ),
          items: opcoes
              .map(
                (o) => DropdownMenuItem(
                  value: o,
                  child: Text(
                    o,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textDark,
                    ),
                  ),
                ),
              )
              .toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}

class _SeletorPrivacidade extends StatelessWidget {
  final bool isPublico;
  final ValueChanged<bool> onChanged;

  const _SeletorPrivacidade({required this.isPublico, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _OpcaoPrivacidade(
            icone: Icons.public_rounded,
            label: 'Público',
            ativo: isPublico,
            onTap: () => onChanged(true),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _OpcaoPrivacidade(
            icone: Icons.lock_outline_rounded,
            label: 'Privado',
            ativo: !isPublico,
            onTap: () => onChanged(false),
          ),
        ),
      ],
    );
  }
}

class _OpcaoPrivacidade extends StatelessWidget {
  final IconData icone;
  final String label;
  final bool ativo;
  final VoidCallback onTap;

  const _OpcaoPrivacidade({
    required this.icone,
    required this.label,
    required this.ativo,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: ativo ? AppColors.primary : const Color(0xFFEEE8E9),
            width: ativo ? 1.5 : 1,
          ),
          color: ativo ? AppColors.primary.withOpacity(0.05) : Colors.white,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icone,
              color: ativo ? AppColors.primary : AppColors.textMedium,
              size: 18,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: ativo ? AppColors.primary : AppColors.textMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckDiretrizes extends StatelessWidget {
  final bool valor;
  final ValueChanged<bool?> onChanged;

  const _CheckDiretrizes({required this.valor, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: valor
            ? AppColors.primary.withOpacity(0.05)
            : const Color(0xFFF7F3F4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: valor ? AppColors.primary : const Color(0xFFEEE8E9),
          width: valor ? 1.5 : 1,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 22,
            height: 22,
            child: Checkbox(
              value: valor,
              onChanged: onChanged,
              activeColor: AppColors.primary,
              side: const BorderSide(color: AppColors.borderColor, width: 1.5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(5),
              ),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Concordo com as diretrizes acadêmicas da comunidade e comprometo-me a moderar o debate de forma construtiva e respeitosa.',
              style: TextStyle(
                fontSize: 13,
                color: valor
                    ? AppColors.primary
                    : AppColors.textMedium, // ← texto muda também
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BotoesAcao extends StatelessWidget {
  final bool podecriar;
  final VoidCallback onCriar;
  final VoidCallback onCancelar;

  const _BotoesAcao({
    required this.podecriar,
    required this.onCriar,
    required this.onCancelar,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: podecriar ? onCriar : null,
              icon: const Icon(Icons.forum_outlined, size: 18),
              label: const Text('Criar Sala'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                disabledBackgroundColor: const Color(0xFFEEE8E9),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
                textStyle: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: onCancelar,
            child: const Text(
              'Cancelar',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textMedium,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
