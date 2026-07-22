package com.mayekengine.ime

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.view.inputmethod.InputMethodManager
import androidx.annotation.NonNull
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.embedding.engine.dart.DartExecutor
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.embedding.engine.plugins.activity.ActivityAware
import io.flutter.embedding.engine.plugins.activity.ActivityPluginBinding
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result

class MayekEngineImePlugin : FlutterPlugin, MethodCallHandler, ActivityAware {
  private lateinit var channel: MethodChannel
  private var activity: Activity? = null
  private var applicationContext: Context? = null

  override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
    channel = MethodChannel(flutterPluginBinding.binaryMessenger, "mayekengine_ime")
    channel.setMethodCallHandler(this)
    applicationContext = flutterPluginBinding.applicationContext
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
      "replaceText" -> {
        val original = call.argument<String>("original") ?: ""
        val replacement = call.argument<String>("replacement") ?: ""
        ImeBridge.handleReplaceText(original, replacement)
        result.success(null)
      }
      "openInputMethodSettings" -> {
        val ctx = activity ?: flutterApplicationContext()
        try {
          val intent = Intent(Settings.ACTION_INPUT_METHOD_SETTINGS)
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          ctx.startActivity(intent)
          result.success(null)
        } catch (e: Exception) {
          result.error("error", e.message, null)
        }
      }
      "showInputMethodPicker" -> {
        val act = activity
        if (act != null) {
          try {
            val imm = act.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            imm.showInputMethodPicker()
            result.success(null)
          } catch (e: Exception) {
            result.error("error", e.message, null)
          }
        } else {
          result.error("no_activity", "Activity not attached", null)
        }
      }
      else -> result.notImplemented()
    }
  }

  // ActivityAware callbacks
  override fun onAttachedToActivity(binding: ActivityPluginBinding) {
    activity = binding.activity
  }

  override fun onDetachedFromActivityForConfigChanges() {
    activity = null
  }

  override fun onReattachedToActivityForConfigChanges(binding: ActivityPluginBinding) {
    activity = binding.activity
  }

  override fun onDetachedFromActivity() {
    activity = null
  }

  private fun flutterApplicationContext(): Context {
    // Fallback to application context if activity isn't available
    return applicationContext ?: throw IllegalStateException("No context available")
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

  fun handleReplaceText(original: String, replacement: String) {
    currentService?.replaceText(original, replacement)
  }
}
