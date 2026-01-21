import 'package:flutter/material.dart';

/// Utilitaires responsive pour mobile-first design
class Responsive {
  /// Breakpoints
  static const double mobileMax = 600;
  static const double tabletMax = 1024;
  static const double desktopMin = 1025;

  /// Vérifie si on est sur mobile
  static bool isMobile(BuildContext context) {
    return MediaQuery.of(context).size.width < mobileMax;
  }

  /// Vérifie si on est sur tablette
  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= mobileMax && width < desktopMin;
  }

  /// Vérifie si on est sur desktop
  static bool isDesktop(BuildContext context) {
    return MediaQuery.of(context).size.width >= desktopMin;
  }

  /// Retourne le nombre de colonnes selon la taille d'écran
  static int gridColumns(BuildContext context) {
    if (isMobile(context)) return 2;
    if (isTablet(context)) return 3;
    return 4;
  }

  /// Padding adaptatif
  static EdgeInsets screenPadding(BuildContext context) {
    if (isMobile(context)) {
      return const EdgeInsets.symmetric(horizontal: 16, vertical: 12);
    }
    if (isTablet(context)) {
      return const EdgeInsets.symmetric(horizontal: 24, vertical: 16);
    }
    return const EdgeInsets.symmetric(horizontal: 32, vertical: 20);
  }

  /// Taille de police adaptative
  static double fontSize(BuildContext context, {required double mobile, double? tablet, double? desktop}) {
    if (isMobile(context)) return mobile;
    if (isTablet(context)) return tablet ?? mobile * 1.1;
    return desktop ?? mobile * 1.2;
  }

  /// Espacement adaptatif
  static double spacing(BuildContext context, {required double mobile, double? tablet, double? desktop}) {
    if (isMobile(context)) return mobile;
    if (isTablet(context)) return tablet ?? mobile * 1.2;
    return desktop ?? mobile * 1.5;
  }

  /// Largeur max du contenu (centré sur desktop)
  static double? maxContentWidth(BuildContext context) {
    if (isDesktop(context)) return 1200;
    return null;
  }
}

