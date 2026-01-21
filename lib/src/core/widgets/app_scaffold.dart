import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../utils/responsive.dart';

class AppScaffold extends StatelessWidget {
  final String title;
  final Widget child;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final bool useMaxWidth;

  const AppScaffold({
    super.key,
    required this.title,
    required this.child,
    this.actions,
    this.floatingActionButton,
    this.useMaxWidth = true,
  });

  @override
  Widget build(BuildContext context) {
    final padding = Responsive.screenPadding(context);
    final maxWidth = useMaxWidth ? Responsive.maxContentWidth(context) : null;

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: actions,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: AppColors.border),
        ),
      ),
      floatingActionButton: floatingActionButton,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: maxWidth != null
                ? BoxConstraints(maxWidth: maxWidth)
                : const BoxConstraints(),
            child: Padding(
              padding: padding,
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}


