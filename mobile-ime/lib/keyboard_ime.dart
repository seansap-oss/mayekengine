import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

const MethodChannel _imeChannel = MethodChannel('mayekengine_ime');

Future<void> insertText(String text) async {
  await _imeChannel.invokeMethod('insertText', {'text': text});
}

class MayekKeyboard extends StatefulWidget {
  const MayekKeyboard({super.key});

  @override
  State<MayekKeyboard> createState() => _MayekKeyboardState();
}

class _MayekKeyboardState extends State<MayekKeyboard> {
  static const List<String> _dictionary = [
    'paba',
    'paaba',
    'thaba',
    'kari',
    'karri',
    'yena',
    'thangka',
    'pabak',
    'nupi',
    'lam',
  ];

  final List<String> _suggestions = ['paba', 'kari', 'thaba'];
  String _currentInput = '';

  void _updateSuggestions() {
    final prefix = _currentInput.toLowerCase();
    final candidateList = prefix.isEmpty
        ? _dictionary.take(5).toList()
        : _dictionary.where((word) => word.startsWith(prefix)).take(5).toList();

    setState(() {
      _suggestions
        ..clear()
        ..addAll(candidateList);
    });
  }

  void _handleKey(String value) {
    if (value == '⌫') {
      _handleBackspace();
      return;
    }

    if (value == 'Space') {
      _handleKey(' ');
      return;
    }

    setState(() {
      _currentInput += value;
    });
    insertText(value);
    _updateSuggestions();
  }

  void _handleBackspace() {
    if (_currentInput.isEmpty) {
      insertText('⌫');
      return;
    }
    setState(() {
      _currentInput = _currentInput.substring(0, _currentInput.length - 1);
    });
    insertText('⌫');
    _updateSuggestions();
  }

  void _useSuggestion(String suggestion) {
    setState(() {
      _currentInput = suggestion;
    });
    insertText('$suggestion ');
    _updateSuggestions();
  }

  Widget _buildKey(String label, {double flex = 1}) {
    return Expanded(
      flex: flex.toInt(),
      child: Padding(
        padding: const EdgeInsets.all(4),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF334155),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            padding: const EdgeInsets.symmetric(vertical: 18),
          ),
          onPressed: () => _handleKey(label),
          child: Text(label, style: const TextStyle(fontSize: 16, letterSpacing: 1.2)),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _updateSuggestions();
  }

  @override
  Widget build(BuildContext context) {
    final keys = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF020617),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFF334155), width: 1.5),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Top predictions', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 10,
                  runSpacing: 8,
                  children: _suggestions.map((suggestion) {
                    return ActionChip(
                      label: Text(suggestion, style: const TextStyle(color: Colors.white)),
                      backgroundColor: const Color(0xFF1E293B),
                      onPressed: () => _useSuggestion(suggestion),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _currentInput.isEmpty ? 'Realtime input preview' : _currentInput,
              style: const TextStyle(color: Colors.white, fontSize: 18, letterSpacing: 0.3),
            ),
          ),
          const SizedBox(height: 18),
          ...keys.map(
            (row) => Row(
              children: row.map((key) => _buildKey(key)).toList(),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildKey('Space', flex: 4),
              _buildKey('⌫', flex: 2),
            ],
          ),
          const SizedBox(height: 8),
          const Text('Press keys to simulate text insertion and suggestion selection.', style: TextStyle(color: Colors.white70, fontSize: 12)),
        ],
      ),
    );
  }
}
