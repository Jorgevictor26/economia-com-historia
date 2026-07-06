import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../services/forum_service.dart';
import '../services/taxonomy_service.dart';
import '../theme/app_colors.dart';

class CriarSalaDebateScreen extends StatefulWidget {
  const CriarSalaDebateScreen({super.key});

  @override
  State<CriarSalaDebateScreen> createState() => _CriarSalaDebateScreenState();
}

class _CriarSalaDebateScreenState extends State<CriarSalaDebateScreen> {
  final _nomeController = TextEditingController();
  final _descricaoController = TextEditingController();
  final _service = ForumService();
  final _taxonomyService = TaxonomyService();
  String? _categoriaSelecionada;
  bool _isPublico = true;
  bool _aceitouDiretrizes = false;
  bool _isLoading = false;
  bool _isLoadingCategorias = true;
  List<String> _categorias = [];

  @override
  void initState() {
    super.initState();
    _loadCategorias();
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _descricaoController.dispose();
    super.dispose();
  }

  Future<void> _loadCategorias() async {
    try {
      final categorias = await _taxonomyService.getCategories();
      if (!mounted) return;
      setState(() {
        _categorias = categorias
            .map((categoria) => categoria.name)
            .where((name) => name.trim().isNotEmpty)
            .toList();
        _isLoadingCategorias = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _categorias = [];
        _isLoadingCategorias = false;
      });
    }
  }

  Future<void> _criar() async {
    final nome = _nomeController.text.trim();
    final descricao = _descricaoController.text.trim();
    if (nome.isEmpty || _categoriaSelecionada == null || !_aceitouDiretrizes) {
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _service.createForum(
        name: nome,
        description: descricao.isEmpty ? null : descricao,
        category: _categoriaSelecionada,
        visibility: _isPublico ? 'public' : 'private',
        rules: _aceitouDiretrizes
            ? 'Concordo com as diretrizes académicas da comunidade.'
            : null,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Fórum enviado com sucesso. Avisaremos quando estiver disponível.',
          ),
          backgroundColor: AppColors.primary,
        ),
      );
      Navigator.maybePop(context);
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } catch (_) {
      if (mounted) _showSnackBar('Erro ao criar fórum.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.primary),
    );
  }

  @override
  Widget build(BuildContext context) {
    final podeCriar =
        _aceitouDiretrizes &&
        _nomeController.text.trim().isNotEmpty &&
        _categoriaSelecionada != null;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const _AppBar(),
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
                    const Divider(color: AppColors.line, height: 24),
                    const _RotuloCampo(label: 'Nome da Sala'),
                    const SizedBox(height: 8),
                    _CampoTexto(
                      controller: _nomeController,
                      hint: 'Ex: Impactos da Industrialização em Luanda',
                      maxLines: 1,
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 20),
                    const _RotuloCampo(label: 'Categoria'),
                    const SizedBox(height: 8),
                    _DropdownCategoria(
                      valor: _categoriaSelecionada,
                      opcoes: _categorias,
                      isLoading: _isLoadingCategorias,
                      onChanged: (value) =>
                          setState(() => _categoriaSelecionada = value),
                    ),
                    const SizedBox(height: 20),
                    const _RotuloCampo(label: 'Descrição'),
                    const SizedBox(height: 8),
                    _CampoTexto(
                      controller: _descricaoController,
                      hint:
                          'Descreva o propósito deste fórum e os principais tópicos de debate...',
                      maxLines: 5,
                    ),
                    const SizedBox(height: 20),
                    const _RotuloCampo(label: 'Privacidade'),
                    const SizedBox(height: 8),
                    _SeletorPrivacidade(
                      isPublico: _isPublico,
                      onChanged: (value) => setState(() => _isPublico = value),
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
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: podeCriar && !_isLoading ? _criar : null,
                      icon: Icon(
                        _isLoading
                            ? Icons.hourglass_empty_rounded
                            : Icons.add_comment_outlined,
                        size: 18,
                      ),
                      label: Text(_isLoading ? 'A criar...' : 'Criar Sala'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        disabledBackgroundColor: AppColors.line,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () => Navigator.maybePop(context),
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
            ),
          ],
        ),
      ),
    );
  }
}

class _AppBar extends StatelessWidget {
  const _AppBar();

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
  final ValueChanged<String>? onChanged;

  const _CampoTexto({
    required this.controller,
    required this.hint,
    required this.maxLines,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isMultiline = maxLines > 1;
    return TextField(
      controller: controller,
      maxLines: maxLines,
      onChanged: onChanged,
      style: const TextStyle(fontSize: 14, color: AppColors.textDark),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(fontSize: 14, color: AppColors.textLight),
        filled: true,
        fillColor: Colors.white,
        border: isMultiline
            ? OutlineInputBorder(
                borderRadius: BorderRadius.circular(0),
                borderSide: const BorderSide(color: AppColors.line),
              )
            : const UnderlineInputBorder(
                borderSide: BorderSide(color: AppColors.line),
              ),
        enabledBorder: isMultiline
            ? OutlineInputBorder(
                borderRadius: BorderRadius.circular(0),
                borderSide: const BorderSide(color: AppColors.line),
              )
            : const UnderlineInputBorder(
                borderSide: BorderSide(color: AppColors.line),
              ),
        focusedBorder: isMultiline
            ? OutlineInputBorder(
                borderRadius: BorderRadius.circular(0),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 1.5,
                ),
              )
            : const UnderlineInputBorder(
                borderSide: BorderSide(color: AppColors.primary, width: 1.5),
              ),
        contentPadding: EdgeInsets.symmetric(
          horizontal: isMultiline ? 14 : 0,
          vertical: isMultiline ? 14 : 10,
        ),
        isDense: true,
      ),
    );
  }
}

class _DropdownCategoria extends StatelessWidget {
  final String? valor;
  final List<String> opcoes;
  final bool isLoading;
  final ValueChanged<String?> onChanged;

  const _DropdownCategoria({
    required this.valor,
    required this.opcoes,
    required this.isLoading,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.line)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: valor,
          hint: Text(
            isLoading
                ? 'A carregar categorias...'
                : opcoes.isEmpty
                ? 'Ainda não há categorias disponíveis'
                : 'Selecione uma categoria',
            style: const TextStyle(fontSize: 14, color: AppColors.textLight),
          ),
          isExpanded: true,
          icon: const Icon(
            Icons.keyboard_arrow_down_rounded,
            color: AppColors.primary,
          ),
          items: opcoes
              .map(
                (opcao) => DropdownMenuItem(
                  value: opcao,
                  child: Text(
                    opcao,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textDark,
                    ),
                  ),
                ),
              )
              .toList(),
          onChanged: isLoading || opcoes.isEmpty ? null : onChanged,
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
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.soft,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Expanded(
            child: _OpcaoPrivacidade(
              icone: Icons.public_rounded,
              label: 'Público',
              ativo: isPublico,
              onTap: () => onChanged(true),
            ),
          ),
          Expanded(
            child: _OpcaoPrivacidade(
              icone: Icons.lock_outline_rounded,
              label: 'Privado',
              ativo: !isPublico,
              onTap: () => onChanged(false),
            ),
          ),
        ],
      ),
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
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: ativo ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icone,
              size: 16,
              color: ativo ? AppColors.primary : AppColors.textMedium,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
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
            ? AppColors.primary.withValues(alpha: 0.05)
            : AppColors.soft,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: valor ? AppColors.primary : AppColors.line,
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
              'Concordo com as diretrizes académicas da comunidade.',
              style: TextStyle(
                fontSize: 13,
                color: valor ? AppColors.primary : AppColors.textMedium,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
