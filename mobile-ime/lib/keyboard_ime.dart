import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

const MethodChannel _imeChannel = MethodChannel('mayekengine_ime');

Future<void> insertText(String text) async {
  await _imeChannel.invokeMethod('insertText', {'text': text});
}

Future<void> replaceText(String original, String replacement) async {
  await _imeChannel.invokeMethod('replaceText', {
    'original': original,
    'replacement': replacement,
  });
}

class MayekKeyboard extends StatefulWidget {
  const MayekKeyboard({super.key});

  @override
  State<MayekKeyboard> createState() => _MayekKeyboardState();
}

class _MayekKeyboardState extends State<MayekKeyboard> {
  // Dictionary entries pair English -> Roman Manipuri
  static const List<Map<String, String>> _dictionary = [
    {'en': 'read', 'rm': 'paba'},
    {'en': 'place', 'rm': 'thaba'},
    {'en': 'girl', 'rm': 'nupi'},
    {'en': 'house', 'rm': 'yum'},
    {'en': 'food', 'rm': 'cha'},
    {'en': 'water', 'rm': 'ima'},
    {'en': 'friend', 'rm': 'khongchatpa'},
    {'en': 'love', 'rm': 'thabak'},
    {'en': 'story', 'rm': 'phajabi'},
    {'en': 'work', 'rm': 'nao-tak'},
  ];

  // suggestions hold maps with display text and insert form
  final List<Map<String, String>> _suggestions = [];
  String _currentInput = '';
  bool _isTranslating = false;

  Future<void> _translateCurrentInput() async {
    if (_currentInput.trim().isEmpty) return;

    setState(() {
      _isTranslating = true;
    });

    try {
      final client = HttpClient();
      final request = await client.postUrl(Uri.parse('http://10.0.2.2:3000/api/v1/translate'));
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode({'text': _currentInput}));
      final response = await request.close();
      final body = await response.transform(utf8.decoder).join();
      if (response.statusCode == 200) {
        final data = jsonDecode(body) as Map<String, dynamic>;
        final translation = data['translation'] as String? ?? _currentInput;
        await replaceText(_currentInput, translation + ' ');
        setState(() {
          _currentInput = translation;
        });
      }
    } catch (_) {
      // Ignore network errors for preview mode.
    } finally {
      setState(() {
        _isTranslating = false;
      });
    }
  }

  void _updateSuggestions() {
    final prefix = _currentInput.toLowerCase();

    List<Map<String, String>> candidates = [];

    if (prefix.isEmpty) {
      candidates = _dictionary.take(6).map((e) => {'display': '${e['rm']} — ${e['en']}', 'insert': e['rm'] ?? e['en'] ?? ''}).toList();
    } else {
      for (var entry in _dictionary) {
        final en = (entry['en'] ?? '').toLowerCase();
        final rm = (entry['rm'] ?? '').toLowerCase();
        if (en.startsWith(prefix) || rm.startsWith(prefix)) {
          candidates.add({'display': '${entry['rm']} — ${entry['en']}', 'insert': entry['rm'] ?? entry['en'] ?? ''});
        }
        if (candidates.length >= 6) break;
      }

      // also include any dictionary rm entries that include prefix
      if (candidates.isEmpty) {
        for (var entry in _dictionary) {
          final rm = (entry['rm'] ?? '').toLowerCase();
          if (rm.contains(prefix) || (entry['en'] ?? '').contains(prefix)) {
            candidates.add({'display': '${entry['rm']} — ${entry['en']}', 'insert': entry['rm'] ?? entry['en'] ?? ''});
          }
          if (candidates.length >= 6) break;
        }
      }
    }

    // Ensure unique insert values
    final seen = <String>{};
    final unique = <Map<String, String>>[];
    for (var c in candidates) {
      if (!seen.contains(c['insert'])) {
        seen.add(c['insert']!);
        unique.add(c);
      }
    }

    setState(() {
      _suggestions
        ..clear()
        ..addAll(unique);
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

  void _useSuggestion(Map<String, String> suggestion) {
    final insert = suggestion['insert'] ?? '';
    setState(() {
      _currentInput = insert;
    });
    insertText('$insert ');
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
                    final display = suggestion['display'] ?? suggestion['insert'] ?? '';
                    return ActionChip(
                      label: Text(display, style: const TextStyle(color: Colors.white)),
                      backgroundColor: const Color(0xFF1E293B),
                      onPressed: () => _useSuggestion(suggestion),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF64748B),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        onPressed: _isTranslating ? null : _translateCurrentInput,
                        child: Text(
                          _isTranslating ? 'Translating...' : 'Translate to Roman',
                          style: const TextStyle(color: Colors.white, fontSize: 14),
                        ),
                      ),
                    ),
                  ],
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
