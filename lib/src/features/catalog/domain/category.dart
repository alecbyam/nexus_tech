import 'package:equatable/equatable.dart';

class Category extends Equatable {
  final String id;
  final String key;
  final String name;
  final int sortOrder;

  const Category({
    required this.id,
    required this.key,
    required this.name,
    required this.sortOrder,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as String,
      key: json['key'] as String,
      name: json['name'] as String,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
    );
  }

  @override
  List<Object?> get props => [id, key, name, sortOrder];
}


