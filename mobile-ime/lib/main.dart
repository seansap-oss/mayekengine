import 'package:flutter/material.dart';
import 'keyboard_ime.dart';

void main() {
  runApp(const MayekEngineImeApp());
}

class MayekEngineImeApp extends StatelessWidget {
  const MayekEngineImeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MayekEngine IME',
      theme: ThemeData.dark(useMaterial3: true),
      home: const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: SafeArea(
          child: Center(
            child: MayekKeyboard(),
          ),
        ),
      ),
    );
  }
}
