import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'keyboard_ime.dart';

const MethodChannel _imeSetupChannel = MethodChannel('mayekengine_ime');

void main() {
  runApp(const MayekEngineImeApp());
}

class MayekEngineImeApp extends StatelessWidget {
  const MayekEngineImeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MeiteiRoman IME',
      theme: ThemeData.dark(useMaterial3: true),
      home: const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: SafeArea(
          child: _OnboardingWrapper(),
        ),
      ),
    );
  }
}

class _OnboardingWrapper extends StatefulWidget {
  const _OnboardingWrapper({Key? key}) : super(key: key);

  @override
  State<_OnboardingWrapper> createState() => _OnboardingWrapperState();
}

class _OnboardingWrapperState extends State<_OnboardingWrapper> {
  int _step = 1;
  bool _isActive = false;
  String _statusMessage = '';

  Future<void> _openSystemKeyboardSettings() async {
    try {
      await _imeSetupChannel.invokeMethod('openInputMethodSettings');
      setState(() {
        _step = 2;
        _statusMessage = 'Opened system keyboard settings. Please enable MeiteiRoman in Input Methods.';
      });
    } catch (e) {
      setState(() {
        _statusMessage = 'Failed to open system settings.';
      });
    }
  }

  Future<void> _showKeyboardPicker() async {
    try {
      await _imeSetupChannel.invokeMethod('showInputMethodPicker');
      setState(() {
        _isActive = true;
        _statusMessage = 'MeiteiRoman is now active! Type seamlessly in both English and Roman Manipuri across all apps.';
      });
    } catch (e) {
      setState(() {
        _statusMessage = 'Failed to open input method picker.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (_isActive)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.check_circle_outline, color: Colors.white),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'MeiteiRoman is now active! Type seamlessly in both English and Roman Manipuri across all apps.',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),

        if (!_isActive)
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            color: const Color(0xFF041022),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('MeiteiRoman Setup', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  if (_step == 1) ...[
                    const Text('Step 1: Enable MeiteiRoman in system Input Methods.'),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _openSystemKeyboardSettings,
                      child: const Text('Open System Keyboard Settings'),
                    ),
                  ] else ...[
                    const Text('Step 2: Set MeiteiRoman as the active keyboard.'),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _showKeyboardPicker,
                      child: const Text('Show Keyboard Picker'),
                    ),
                  ],
                  const SizedBox(height: 12),
                  Text(_statusMessage, style: const TextStyle(color: Colors.white70)),
                ],
              ),
            ),
          ),

        const SizedBox(height: 20),

        // Always allow preview of the keyboard
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: Column(
            children: const [
              Text('Preview keyboard (tap keys to simulate)', style: TextStyle(color: Colors.white70)),
              SizedBox(height: 12),
              MayekKeyboard(),
            ],
          ),
        ),
      ],
    );
  }
}
