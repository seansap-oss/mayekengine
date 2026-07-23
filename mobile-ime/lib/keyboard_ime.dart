import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

const MethodChannel _imeChannel = MethodChannel('mayekengine_ime');
const String _productionApiBaseUrl = 'https://mayekengine.vercel.app/api/v1';

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

  final List<Map<String, String>> _localDictionary = [];
  final List<Map<String, String>> _suggestions = [];
  String _currentInput = '';
  bool _isTranslating = false;
  bool _isLoadingDictionary = false;

  Future<void> _translateCurrentInput() async {
    if (_currentInput.trim().isEmpty) return;

    setState(() {
      _isTranslating = true;
    });

    try {
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 5);
      final request = await client
          .postUrl(Uri.parse('$_productionApiBaseUrl/translate'))
          .timeout(const Duration(seconds: 5));
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode({'text': _currentInput}));
      final response =
          await request.close().timeout(const Duration(seconds: 5));
      final body = await response.transform(utf8.decoder).join();
      if (response.statusCode == 200) {
        final data = jsonDecode(body) as Map<String, dynamic>;
        final translation = data['translation'] as String? ?? _currentInput;
        await replaceText(_currentInput, translation + ' ');
        if (!mounted) return;
        setState(() {
          _currentInput = translation;
        });
      } else {
        await replaceText(_currentInput, _currentInput + ' ');
      }
    } catch (_) {
      await replaceText(_currentInput, _currentInput + ' ');
    } finally {
      if (!mounted) return;
      setState(() {
        _isTranslating = false;
      });
    }
  }

  Future<void> _updateSuggestions() async {
    final prefix = _currentInput.toLowerCase();
    if (prefix.isEmpty) {
      final candidates = _dictionary
          .take(6)
          .map((e) => {
                'display': '${e['rm']} — ${e['en']}',
                'insert': e['rm'] ?? e['en'] ?? ''
              })
          .toList();
      if (!mounted) return;
      setState(() {
        _suggestions
          ..clear()
          ..addAll(candidates);
      });
      return;
    }

    final fallbackCandidates = _getLocalSuggestions(prefix);
    if (!mounted) return;
    setState(() {
      _suggestions
        ..clear()
        ..addAll(fallbackCandidates);
    });

    final remoteCandidates = await _fetchRemoteSuggestions(prefix);
    if (remoteCandidates.isNotEmpty && mounted) {
      setState(() {
        _suggestions
          ..clear()
          ..addAll(remoteCandidates);
      });
    }
  }

  List<Map<String, String>> _getLocalSuggestions(String prefix) {
    final candidates = <Map<String, String>>[];
    final source = _localDictionary.isNotEmpty ? _localDictionary : _dictionary;

    for (var entry in source) {
      final en = (entry['en'] ?? '').toLowerCase();
      final rm = (entry['rm'] ?? '').toLowerCase();
      if (en.startsWith(prefix) ||
          rm.startsWith(prefix) ||
          en.contains(prefix) ||
          rm.contains(prefix)) {
        candidates.add({
          'display': '${entry['rm']} — ${entry['en']}',
          'insert': entry['rm'] ?? entry['en'] ?? ''
        });
      }
      if (candidates.length >= 6) break;
    }

    return _uniqueSuggestions(candidates);
  }

  Future<List<Map<String, String>>> _fetchRemoteSuggestions(
      String prefix) async {
    try {
      final client = HttpClient();
      client.connectionTimeout = const Duration(milliseconds: 700);
      final query = Uri.parse(
          '$_productionApiBaseUrl/predict?q=${Uri.encodeComponent(prefix)}&limit=6');
      final request =
          await client.getUrl(query).timeout(const Duration(milliseconds: 700));
      final response =
          await request.close().timeout(const Duration(milliseconds: 700));
      final body = await response.transform(utf8.decoder).join();
      if (response.statusCode == 200) {
        final data = jsonDecode(body) as Map<String, dynamic>;
        final predictions = data['predictions'] as List<dynamic>?;
        if (predictions != null && predictions.isNotEmpty) {
          final results = predictions
              .map<Map<String, String>>((item) {
                final map = item as Map<String, dynamic>;
                final display =
                    '${map['standardRoman'] ?? ''} — ${map['englishTranslation'] ?? ''}';
                return {
                  'display': display,
                  'insert': map['standardRoman'] ?? ''
                };
              })
              .where((item) => item['insert']?.isNotEmpty ?? false)
              .take(6)
              .toList();
          return _uniqueSuggestions(results);
        }
      }
    } catch (_) {
      // Use offline fallback if remote fails or is slow.
    }
    return _getLocalSuggestions(prefix);
  }

  List<Map<String, String>> _uniqueSuggestions(
      List<Map<String, String>> candidates) {
    final seen = <String>{};
    final unique = <Map<String, String>>[];
    for (var candidate in candidates) {
      final insert = candidate['insert'] ?? '';
      if (insert.isNotEmpty && !seen.contains(insert)) {
        seen.add(insert);
        unique.add(candidate);
      }
      if (unique.length >= 6) break;
    }
    return unique;
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
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            padding: const EdgeInsets.symmetric(vertical: 18),
          ),
          onPressed: () => _handleKey(label),
          child: Text(label,
              style: const TextStyle(fontSize: 16, letterSpacing: 1.2)),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadLocalDictionary();
    _updateSuggestions();
  }

  Future<void> _loadLocalDictionary() async {
    if (_isLoadingDictionary) return;
    _isLoadingDictionary = true;
    for (final candidatePath in [
      'assets/dict.json',
      'packages/mayekengine_ime/assets/dict.json'
    ]) {
      try {
        final jsonString = await rootBundle
            .loadString(candidatePath)
            .timeout(const Duration(seconds: 3));
        final data = jsonDecode(jsonString) as List<dynamic>;
        final loaded = data
            .whereType<Map<String, dynamic>>()
            .map<Map<String, String>>((entry) {
              return {
                'en': entry['en']?.toString() ?? '',
                'rm': entry['rm']?.toString() ?? '',
              };
            })
            .where(
                (entry) => entry['rm']!.isNotEmpty || entry['en']!.isNotEmpty)
            .toList();
        if (!mounted) return;
        setState(() {
          _localDictionary
            ..clear()
            ..addAll(loaded);
        });
        return;
      } catch (_) {
        // Try the next possible asset path.
      }
    }
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
                const Text('Top predictions',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 10,
                  runSpacing: 8,
                  children: _suggestions.map((suggestion) {
                    final display =
                        suggestion['display'] ?? suggestion['insert'] ?? '';
                    return ActionChip(
                      label: Text(display,
                          style: const TextStyle(color: Colors.white)),
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
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        onPressed:
                            _isTranslating ? null : _translateCurrentInput,
                        child: Text(
                          _isTranslating
                              ? 'Translating...'
                              : 'Translate to Roman',
                          style: const TextStyle(
                              color: Colors.white, fontSize: 14),
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
              style: const TextStyle(
                  color: Colors.white, fontSize: 18, letterSpacing: 0.3),
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
          const Text(
              'Press keys to simulate text insertion and suggestion selection.',
              style: TextStyle(color: Colors.white70, fontSize: 12)),
        ],
      ),
    );
  }
}
