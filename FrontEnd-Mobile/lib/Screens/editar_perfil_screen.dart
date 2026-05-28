import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';

class EditarPerfilScreen extends StatefulWidget {
  const EditarPerfilScreen({super.key});

  @override
  State<EditarPerfilScreen> createState() => _EditarPerfilScreenState();
}

class _EditarPerfilScreenState extends State<EditarPerfilScreen> {
  final _nomeController = TextEditingController(text: 'Estudante Académico');
  final _bioController = TextEditingController(
    text:
        'Estudante de Economia apaixonado pela história de Angola e pelo desenvolvimento económico sustentável.',
  );

  bool _perfilPublico = true;
  bool _mostrarLocalizacao = false;
  bool _mensagensDiretas = true;

  @override
  void dispose() {
    _nomeController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              _AppBar(),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    Center(child: _FotoPerfil()),
                    const SizedBox(height: 24),
                    const Text(
                      'Nome Completo',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _CampoTexto(controller: _nomeController, maxLines: 1),
                    const SizedBox(height: 16),
                    const Text(
                      'Biografia',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _CampoTexto(controller: _bioController, maxLines: 4),
                    const SizedBox(height: 28),
                    Row(
                      children: const [
                        Icon(
                          Icons.shield_outlined,
                          color: AppColors.primary,
                          size: 20,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Privacidade',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFEEE8E9)),
                      ),
                      child: Column(
                        children: [
                          _ToggleItem(
                            titulo: 'Perfil Público',
                            descricao:
                                'Permitir que outros estudantes vejam o seu progresso.',
                            valor: _perfilPublico,
                            onChanged: (v) =>
                                setState(() => _perfilPublico = v),
                            mostrarDivisor: true,
                          ),
                          _ToggleItem(
                            titulo: 'Mostrar Localização',
                            descricao:
                                'Exibir Luanda, Angola no seu cartão de perfil.',
                            valor: _mostrarLocalizacao,
                            onChanged: (v) =>
                                setState(() => _mostrarLocalizacao = v),
                            mostrarDivisor: true,
                          ),
                          _ToggleItem(
                            titulo: 'Mensagens Diretas',
                            descricao:
                                'Apenas utilizadores de Nível 4 ou superior podem contactar.',
                            valor: _mensagensDiretas,
                            onChanged: (v) =>
                                setState(() => _mensagensDiretas = v),
                            mostrarDivisor: false,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    _ItemAcao(
                      icone: Icons.lock_outline_rounded,
                      label: 'Alterar Palavra-passe',
                      onTap: () {},
                    ),
                    const SizedBox(height: 8),
                    _ItemAcao(
                      icone: Icons.notifications_none_rounded,
                      label: 'Preferências de Notificação',
                      onTap: () {},
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ],
          ),
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
            'Perfil',
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

class _FotoPerfil extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Stack(
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary, width: 2),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Image.asset(
                  '/images/Imagem_perfil.png',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: const Color(0xFFEEE8E9),
                    child: const Icon(
                      Icons.person_rounded,
                      size: 40,
                      color: AppColors.textLight,
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.camera_alt_rounded,
                  color: Colors.white,
                  size: 15,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        const Text(
          'FOTO DE PERFIL',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: AppColors.textLight,
            letterSpacing: 0.8,
          ),
        ),
      ],
    );
  }
}

class _CampoTexto extends StatelessWidget {
  final TextEditingController controller;
  final int maxLines;

  const _CampoTexto({required this.controller, required this.maxLines});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: const TextStyle(fontSize: 14, color: AppColors.textDark),
      decoration: InputDecoration(
        filled: true,
        fillColor: const Color(0xFFF7F3F4),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFEEE8E9)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFEEE8E9)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
      ),
    );
  }
}

class _ToggleItem extends StatelessWidget {
  final String titulo;
  final String descricao;
  final bool valor;
  final ValueChanged<bool> onChanged;
  final bool mostrarDivisor;

  const _ToggleItem({
    required this.titulo,
    required this.descricao,
    required this.valor,
    required this.onChanged,
    required this.mostrarDivisor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      titulo,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      descricao,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textMedium,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Switch(
                value: valor,
                onChanged: onChanged,
                activeColor: AppColors.primary,
                activeTrackColor: AppColors.primary.withOpacity(0.3),
              ),
            ],
          ),
        ),
        if (mostrarDivisor)
          const Divider(
            color: Color(0xFFEEE8E9),
            height: 1,
            indent: 16,
            endIndent: 16,
          ),
      ],
    );
  }
}

class _ItemAcao extends StatelessWidget {
  final IconData icone;
  final String label;
  final VoidCallback onTap;

  const _ItemAcao({
    required this.icone,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFEEE8E9)),
        ),
        child: Row(
          children: [
            Icon(icone, color: AppColors.textMedium, size: 20),
            const SizedBox(width: 12),
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textDark,
              ),
            ),
            const Spacer(),
            const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.textLight,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
