import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../core/exceptions/app_exceptions.dart';
import '../services/perfil_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import '../widgets/profile_photo_image.dart';

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
  File? _fotoSelecionada;
  String? _fotoPayload;
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
        photo: _fotoPayload,
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

  Future<void> _abrirAlterarPalavraPasse() async {
    final perfil = context.read<PerfilService>();
    final formKey = GlobalKey<FormState>();
    final passwordController = TextEditingController();
    final confirmationController = TextEditingController();
    var isSavingPassword = false;
    var obscurePassword = true;
    var obscureConfirmation = true;

    try {
      await showDialog<void>(
        context: context,
        builder: (dialogContext) {
          return StatefulBuilder(
            builder: (context, setDialogState) {
              Future<void> submit() async {
                if (!formKey.currentState!.validate() || isSavingPassword) {
                  return;
                }

                setDialogState(() => isSavingPassword = true);
                try {
                  await perfil.atualizarPalavraPasse(
                    passwordController.text.trim(),
                    confirmationController.text.trim(),
                  );
                  if (!dialogContext.mounted) return;
                  Navigator.pop(dialogContext);
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Palavra-passe atualizada com sucesso.'),
                    ),
                  );
                } on AppException catch (e) {
                  if (dialogContext.mounted) {
                    setDialogState(() => isSavingPassword = false);
                  }
                  if (mounted) _showError(e.message);
                } catch (_) {
                  if (dialogContext.mounted) {
                    setDialogState(() => isSavingPassword = false);
                  }
                  if (mounted) _showError('Erro ao atualizar palavra-passe.');
                }
              }

              return AlertDialog(
                title: const Text('Alterar Palavra-passe'),
                content: Form(
                  key: formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        controller: passwordController,
                        obscureText: obscurePassword,
                        decoration: InputDecoration(
                          labelText: 'Nova palavra-passe',
                          suffixIcon: IconButton(
                            onPressed: () => setDialogState(
                              () => obscurePassword = !obscurePassword,
                            ),
                            icon: Icon(
                              obscurePassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                            ),
                          ),
                        ),
                        validator: (value) {
                          final password = value?.trim() ?? '';
                          if (password.isEmpty) {
                            return 'Informe a nova palavra-passe.';
                          }
                          if (password.length < 8) {
                            return 'Use pelo menos 8 caracteres.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: confirmationController,
                        obscureText: obscureConfirmation,
                        decoration: InputDecoration(
                          labelText: 'Confirmar palavra-passe',
                          suffixIcon: IconButton(
                            onPressed: () => setDialogState(
                              () => obscureConfirmation = !obscureConfirmation,
                            ),
                            icon: Icon(
                              obscureConfirmation
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                            ),
                          ),
                        ),
                        validator: (value) {
                          final confirmation = value?.trim() ?? '';
                          if (confirmation.isEmpty) {
                            return 'Confirme a palavra-passe.';
                          }
                          if (confirmation != passwordController.text.trim()) {
                            return 'As palavras-passe não coincidem.';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: isSavingPassword
                        ? null
                        : () => Navigator.pop(dialogContext),
                    child: const Text('Cancelar'),
                  ),
                  ElevatedButton(
                    onPressed: isSavingPassword ? null : submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                    child: isSavingPassword
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text('Guardar'),
                  ),
                ],
              );
            },
          );
        },
      );
    } finally {
      passwordController.dispose();
      confirmationController.dispose();
    }
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.watch<PerfilService>().usuario;

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
            Center(
              child: _FotoPerfil(
                fotoAtual: usuario?.photo,
                nome: _nomeController.text.trim().isEmpty
                    ? usuario?.name
                    : _nomeController.text.trim(),
                fotoSelecionada: _fotoSelecionada,
                onFotoSelecionada: (file, payload) {
                  setState(() {
                    _fotoSelecionada = file;
                    _fotoPayload = payload;
                  });
                },
              ),
            ),
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
            const SizedBox(height: 16),
            _ItemAcao(
              icone: Icons.more_horiz_rounded,
              label: 'Alterar Palavra-passe',
              onTap: _abrirAlterarPalavraPasse,
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

class _FotoPerfil extends StatelessWidget {
  final String? fotoAtual;
  final String? nome;
  final File? fotoSelecionada;
  final void Function(File file, String payload) onFotoSelecionada;

  const _FotoPerfil({
    required this.fotoAtual,
    required this.nome,
    required this.fotoSelecionada,
    required this.onFotoSelecionada,
  });

  Future<void> _selecionarImagem(BuildContext context) async {
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
              onTap: () => _pickImage(context, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(
                Icons.photo_library_outlined,
                color: AppColors.primary,
              ),
              title: const Text('Escolher da Galeria'),
              onTap: () => _pickImage(context, ImageSource.gallery),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage(BuildContext context, ImageSource source) async {
    Navigator.pop(context);
    final picked = await ImagePicker().pickImage(
      source: source,
      imageQuality: 80,
    );
    if (picked == null || !context.mounted) return;

    final file = File(picked.path);
    final bytes = await file.readAsBytes();
    if (!context.mounted) return;
    final payload =
        'data:${_mimeType(picked.path)};base64,${base64Encode(bytes)}';
    onFotoSelecionada(file, payload);
  }

  String _mimeType(String path) {
    final lower = path.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        GestureDetector(
          onTap: () => _selecionarImagem(context),
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
                  child: fotoSelecionada != null
                      ? Image.file(fotoSelecionada!, fit: BoxFit.cover)
                      : ProfilePhotoImage(
                          photo: fotoAtual,
                          name: nome,
                          initialsFontSize: 24,
                          iconSize: 40,
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
