import 'package:flutter/material.dart';

class PerfilService extends ChangeNotifier {
  String _nome = 'Estudante Académico';
  String _bio = 'Investigador de História Económica';

  String get nome => _nome;
  String get bio => _bio;

  void atualizarPerfil(String nome, String bio) {
    _nome = nome;
    _bio = bio;
    notifyListeners();
  }
}
