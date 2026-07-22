package com.mayekengine.ime

import androidx.annotation.NonNull
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.embedding.engine.dart.DartExecutor
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result

class MayekEngineImePlugin : FlutterPlugin, MethodCallHandler {
  private lateinit var channel: MethodChannel

  override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
    channel = MethodChannel(flutterPluginBinding.binaryMessenger, "mayekengine_ime")
    channel.setMethodCallHandler(this)
  }

  override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
    channel.setMethodCallHandler(null)
  }

  override fun onMethodCall(call: MethodCall, result: Result) {
    when (call.method) {
      "insertText" -> {
        val text = call.argument<String>("text") ?: ""
        ImeBridge.handleInsertText(text)
        result.success(null)
      }
      else -> result.notImplemented()
    }
  }
}

object ImeBridge {
  private var currentService: MayekEngineImeService? = null

  fun bindService(service: MayekEngineImeService) {
    currentService = service
  }

  fun handleInsertText(text: String) {
    currentService?.insertText(text)
  }
}
