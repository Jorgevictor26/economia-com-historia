import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class FilterChipOption {
  final String id;
  final String label;

  const FilterChipOption({required this.id, required this.label});
}

class AppFilterChipBar extends StatelessWidget {
  final List<FilterChipOption> options;
  final String selectedId;
  final ValueChanged<String> onSelected;
  final EdgeInsetsGeometry padding;
  final bool allowDeselect;

  const AppFilterChipBar({
    super.key,
    required this.options,
    required this.selectedId,
    required this.onSelected,
    this.padding = const EdgeInsets.symmetric(horizontal: 20),
    this.allowDeselect = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: padding,
        itemCount: options.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (_, index) {
          final option = options[index];
          final selected = option.id == selectedId;
          return InkWell(
            borderRadius: BorderRadius.circular(10),
            onTap: () => onSelected(
              selected && allowDeselect ? options.first.id : option.id,
            ),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              decoration: BoxDecoration(
                color: selected ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: selected ? AppColors.primary : AppColors.borderSoft,
                  width: 1.2,
                ),
              ),
              child: Text(
                option.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: selected ? Colors.white : AppColors.textMedium,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
