import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../core/constants/api_constants.dart';
import '../core/utils/formatters.dart';
import '../theme/app_colors.dart';

class ProfilePhotoImage extends StatelessWidget {
  final String? photo;
  final String? name;
  final double initialsFontSize;
  final double iconSize;

  const ProfilePhotoImage({
    super.key,
    required this.photo,
    required this.name,
    this.initialsFontSize = 22,
    this.iconSize = 38,
  });

  @override
  Widget build(BuildContext context) {
    final value = photo?.trim();
    if (value == null || value.isEmpty) return _fallback();

    final bytes = _decodeDataUrl(value);
    if (bytes != null) {
      return Image.memory(
        bytes,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => _fallback(iconOnly: true),
      );
    }

    final url = ApiConstants.mediaUrl(value);
    if (url == null || url.isEmpty) return _fallback();

    return Image.network(
      url,
      fit: BoxFit.cover,
      errorBuilder: (_, _, _) => _fallback(iconOnly: true),
    );
  }

  Widget _fallback({bool iconOnly = false}) {
    return Container(
      color: AppColors.blush,
      child: Center(
        child: iconOnly
            ? Icon(
                Icons.person_rounded,
                size: iconSize,
                color: AppColors.textLight,
              )
            : Text(
                initials(name),
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: initialsFontSize,
                  fontWeight: FontWeight.w800,
                ),
              ),
      ),
    );
  }

  Uint8List? _decodeDataUrl(String value) {
    if (!value.startsWith('data:image')) return null;
    final marker = 'base64,';
    final index = value.indexOf(marker);
    if (index == -1) return null;

    try {
      return base64Decode(value.substring(index + marker.length));
    } catch (_) {
      return null;
    }
  }
}
