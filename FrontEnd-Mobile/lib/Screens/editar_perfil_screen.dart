import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../core/exceptions/app_exceptions.dart';
import '../screens/repor_palavra_passe.dart';
import '../service/perfil_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';

class EditarPerfilScreen extends StatefulWidget {
  final String? nomeInicial;
  final String? bioInicial;

  const EditarPerfilScreen({super.key, this.nomeInicial, this.bioInicial});

  @override
  State<EditarPerfilScreen> createState() => _EditarPerfilScreenState();
}

class _EditarPerfilScreenState extends State<EditarPerfilScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomeController = TextEditingController();
  final _bioController = TextEditingController();
  bool _hydrated = false;
  bool _isSaving = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_hydrated) return;
    final perfil = context.read<PerfilService>();
    _nomeController.text = widget.nomeInicial ?? perfil.usuario?.name ?? '';
    _bioController.text = widget.bioInicial ?? perfil.usuario?.bio ?? '';
    _hydrated = true;
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _isSaving) return;
    setState(() => _isSaving = true);
    try {
      await context.read<PerfilService>().atualizarPerfil(
        _nomeController.text.trim(),
        _bioController.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Perfil atualizado com sucesso.')),
      );
      Navigator.pop(context);
    } on AppException catch (e) {
      if (mounted) _showError(e.message);
    } catch (_) {
      if (mounted) _showError('Erro ao atualizar perfil.');
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.primary),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        titulo: 'Editar Perfil',
        mostrarVoltar: true,
        mostrarNotificacoes: false,
        mostrarPesquisa: false,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          children: [
            const Center(child: _FotoPerfil()),
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
            _CampoTexto(
              controller: _nomeController,
              maxLines: 1,
              maxCaracteres: 50,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Informe o nome.';
                }
                return null;
              },
            ),
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
            _CampoTexto(
              controller: _bioController,
              maxLines: 4,
              maxCaracteres: 150,
            ),
            const SizedBox(height: 28),
            const Row(
              children: [
                Icon(Icons.shield_outlined, color: AppColors.primary, size: 20),
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
            const _PrivacidadeCard(),
            const SizedBox(height: 16),
            _ItemAcao(
              icone: Icons.more_horiz_rounded,
              label: 'Alterar Palavra-passe',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const ReporPalavraPasseScreen(),
                  ),
                );
              },
            ),
            const SizedBox(height: 8),
            _ItemAcao(
              icone: Icons.notifications_none_rounded,
              label: 'Preferências de Notificação',
              onTap: () {},
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: AppColors.textLight,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  textStyle: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                child: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text('Guardar Alterações'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FotoPerfil extends StatefulWidget {
  const _FotoPerfil();

  @override
  State<_FotoPerfil> createState() => _FotoPerfilState();
}

class _FotoPerfilState extends State<_FotoPerfil> {
  File? _imagemSelecionada;
  Future<void> _selecionarImagem() async {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderSoft,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(
                Icons.camera_alt_outlined,
                color: AppColors.primary,
              ),
              title: const Text('Tirar Foto'),
              onTap: () async {
                Navigator.pop(context);
                final picked = await ImagePicker().pickImage(
                  source: ImageSource.camera,
                  imageQuality: 80,
                );
                if (picked != null && mounted) {
                  setState(() => _imagemSelecionada = File(picked.path));
                }
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.photo_library_outlined,
                color: AppColors.primary,
              ),
              title: const Text('Escolher da Galeria'),
              onTap: () async {
                Navigator.pop(context);
                final picked = await ImagePicker().pickImage(
                  source: ImageSource.gallery,
                  imageQuality: 80,
                );
                if (picked != null && mounted) {
                  setState(() => _imagemSelecionada = File(picked.path));
                }
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        GestureDetector(
          onTap: _selecionarImagem,
          child: Stack(
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primary, width: 2),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: _imagemSelecionada != null
                      ? Image.file(_imagemSelecionada!, fit: BoxFit.cover)
                      : Image.asset(
                          'assets/images/Imagem_perfil.png',
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
                    borderRadius: BorderRadius.circular(10),
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

class _PrivacidadeCard extends StatefulWidget {
  const _PrivacidadeCard();

  @override
  State<_PrivacidadeCard> createState() => _PrivacidadeCardState();
}

class _PrivacidadeCardState extends State<_PrivacidadeCard> {
  bool _perfilPublico = true;
  bool _mostrarLocalizacao = false;
  bool _mensagensDiretas = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFEEE8E9)),
      ),
      child: Column(
        children: [
          _ToggleItem(
            titulo: 'Perfil Público',
            descricao: 'Permitir que outros estudantes vejam o seu progresso.',
            valor: _perfilPublico,
            onChanged: (v) => setState(() => _perfilPublico = v),
            mostrarDivisor: true,
          ),
          _ToggleItem(
            titulo: 'Mostrar Localização',
            descricao: 'Exibir Luanda, Angola no seu cartão de perfil.',
            valor: _mostrarLocalizacao,
            onChanged: (v) => setState(() => _mostrarLocalizacao = v),
            mostrarDivisor: true,
          ),
          _ToggleItem(
            titulo: 'Mensagens Diretas',
            descricao:
                'Apenas utilizadores de Nível 4 ou superior podem contactar.',
            valor: _mensagensDiretas,
            onChanged: (v) => setState(() => _mensagensDiretas = v),
            mostrarDivisor: false,
          ),
        ],
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
                activeTrackColor: AppColors.primary.withValues(alpha: 0.3),
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
          borderRadius: BorderRadius.circular(10),
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

class _CampoTexto extends StatelessWidget {
  final TextEditingController controller;
  final int maxLines;
  final int maxCaracteres;
  final String? Function(String?)? validator;

  const _CampoTexto({
    required this.controller,
    required this.maxLines,
    this.maxCaracteres = 9999,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      maxLength: maxCaracteres,
      validator: validator,
      style: const TextStyle(fontSize: 14, color: AppColors.textDark),
      decoration: InputDecoration(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.textDark, width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFEEE8E9), width: 1.2),
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
