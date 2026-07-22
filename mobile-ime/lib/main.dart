// ignore_for_file: deprecated_member_use
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
      home: const OnboardingHost(),
    );
  }
}

class OnboardingHost extends StatefulWidget {
  const OnboardingHost({Key? key}) : super(key: key);

  @override
  State<OnboardingHost> createState() => _OnboardingHostState();
}

class _OnboardingHostState extends State<OnboardingHost> {
  int _step = 1;
  bool _isActive = false;
  String _statusMessage = '';
  DateTime? _lastBackPressed;

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

  Future<bool> _onWillPop() async {
    // If not on the first step or not active, go back one step to home-like view
    if (_step != 1 || !_isActive) {
      setState(() {
        _step = 1;
        _isActive = false;
        _statusMessage = '';
      });
      return false; // do not exit
    }

    final now = DateTime.now();
    if (_lastBackPressed == null || now.difference(_lastBackPressed!) > const Duration(seconds: 2)) {
      _lastBackPressed = now;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Press back again to exit')));
      return false;
    }

    // Exit the app
    await SystemNavigator.pop();
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        body: SafeArea(
          child: Column(
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
          ),
        ),
      ),
    );
  }
}
