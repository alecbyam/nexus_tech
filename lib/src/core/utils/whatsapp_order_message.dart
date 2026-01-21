import '../../features/cart/domain/cart_item.dart';

class WhatsAppOrderMessage {
  static String build({
    required String storeName,
    required String orderId,
    required String currency,
    required List<CartItem> items,
    required int totalCents,
    String? customerEmail,
    String? customerPhone,
    String? note,
  }) {
    final b = StringBuffer();
    b.writeln('Bonjour $storeName');
    b.writeln('Je veux confirmer une commande via WhatsApp.');
    b.writeln('');
    b.writeln('ID commande: $orderId');

    if ((customerEmail ?? '').trim().isNotEmpty) b.writeln('Email: ${customerEmail!.trim()}');
    if ((customerPhone ?? '').trim().isNotEmpty) b.writeln('Téléphone: ${customerPhone!.trim()}');
    b.writeln('');
    b.writeln('Articles:');

    for (final i in items) {
      final unit = (i.priceCents / 100).toStringAsFixed(2);
      final line = ((i.priceCents * i.quantity) / 100).toStringAsFixed(2);
      b.writeln('- ${i.name} | x${i.quantity} | $currency $unit | Total: $currency $line');
    }

    b.writeln('');
    final total = (totalCents / 100).toStringAsFixed(2);
    b.writeln('TOTAL: $currency $total');

    if ((note ?? '').trim().isNotEmpty) {
      b.writeln('');
      b.writeln('Note: ${note!.trim()}');
    }

    b.writeln('');
    b.writeln('Merci.');
    return b.toString();
  }
}


