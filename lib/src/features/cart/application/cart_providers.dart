import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'cart_controller.dart';

final cartControllerProvider = AsyncNotifierProvider<CartController, CartState>(CartController.new);


