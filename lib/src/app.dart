import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';

class NexusTechApp extends ConsumerWidget {
  const NexusTechApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    // On privilégie Material pour la cohérence cross-platform, avec quelques
    // touches Cupertino dans certains widgets/écrans.
    return MaterialApp.router(
      title: 'NEXUS TECH',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      routeInformationParser: router.routeInformationParser,
      routeInformationProvider: router.routeInformationProvider,
      routerDelegate: router.routerDelegate,
      builder: (context, child) {
        return CupertinoTheme(
          data: const CupertinoThemeData(brightness: Brightness.light),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}


