package com.mayekengine.ime

import android.inputmethodservice.InputMethodService
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.setPadding
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

class MayekEngineImeService : InputMethodService() {
  companion object {
    private const val PRODUCTION_PREDICT_URL = "https://mayekengine.vercel.app/api/v1/translate"
  }

  private lateinit var candidateBar: LinearLayout
  private var currentComposition = ""
  private val dictionary = listOf(
    "paba", "paaba", "thaba", "kari", "karri", "yena", "thangka", "pabak", "nupi", "lam"
  )

  override fun onCreate() {
    super.onCreate()
    ImeBridge.bindService(this)
  }

  override fun onCreateInputView(): View {
    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
      setPadding(16)
      setBackgroundColor(0xFF0A0F1A.toInt())
    }

    candidateBar = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
      gravity = Gravity.CENTER_VERTICAL
      setPadding(10)
    }
    root.addView(candidateBar)
    updateCandidates()

    val keyboardContainer = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
      setPadding(8)
    }

    val rows = listOf(
      listOf("Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"),
      listOf("A", "S", "D", "F", "G", "H", "J", "K", "L"),
      listOf("Z", "X", "C", "V", "B", "N", "M")
    )

    rows.forEach { row ->
      val rowLayout = LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        gravity = Gravity.CENTER
      }
      row.forEach { key ->
        rowLayout.addView(Button(this).apply {
          text = key
          setOnClickListener { onKeyPressed(key) }
          layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
            setMargins(4, 4, 4, 4)
          }
        })
      }
      keyboardContainer.addView(rowLayout)
    }

    val controlRow = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
      gravity = Gravity.CENTER
    }

    controlRow.addView(Button(this).apply {
      text = "Space"
      setOnClickListener { onKeyPressed(" ") }
      layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 3f).apply {
        setMargins(4, 4, 4, 4)
      }
    })

    controlRow.addView(Button(this).apply {
      text = "⌫"
      setOnClickListener { onBackspacePressed() }
      layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
        setMargins(4, 4, 4, 4)
      }
    })

    keyboardContainer.addView(controlRow)
    root.addView(keyboardContainer)

    return root
  }

  private fun onKeyPressed(key: String) {
    if (key == " ") {
      commitCurrentComposition(addTrailingSpace = true)
      return
    }
    currentComposition += key
    currentInputConnection?.setComposingText(currentComposition, 1)
    updateCandidates()
  }

  private fun onBackspacePressed() {
    if (currentComposition.isNotEmpty()) {
      currentComposition = currentComposition.dropLast(1)
      if (currentComposition.isEmpty()) {
        currentInputConnection?.finishComposingText()
      } else {
        currentInputConnection?.setComposingText(currentComposition, 1)
      }
      updateCandidates()
      return
    }
    currentInputConnection?.deleteSurroundingText(1, 0)
  }

  private fun updateCandidates() {
    candidateBar.removeAllViews()
    val predictions = predictCandidates(currentComposition)
    if (predictions.isEmpty()) {
      candidateBar.addView(TextView(this).apply {
        text = "No suggestions"
        setTextColor(0xFF94A3B8.toInt())
        setPadding(16, 10, 16, 10)
      })
      return
    }
    addCandidateViews(predictions)
    if (currentComposition.isNotEmpty()) {
      fetchRemoteCandidates(currentComposition)
    }
  }

  private fun addCandidateViews(suggestions: List<String>) {
    suggestions.forEach { suggestion ->
      candidateBar.addView(TextView(this).apply {
        text = suggestion
        setTextColor(0xFFFFFFFF.toInt())
        setPadding(22, 14, 22, 14)
        setBackgroundResource(android.R.drawable.alert_dark_frame)
        setOnClickListener { commitCandidate(suggestion) }
        layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply {
          setMargins(6, 6, 6, 6)
        }
      })
    }
  }

  private fun fetchRemoteCandidates(prefix: String) {
    Thread {
      try {
        val url = URL("$PRODUCTION_PREDICT_URL?q=${URLEncoder.encode(prefix, "UTF-8")}&limit=5")
        val connection = url.openConnection() as HttpURLConnection
        connection.connectTimeout = 600
        connection.readTimeout = 600
        connection.requestMethod = "GET"
        if (connection.responseCode == HttpURLConnection.HTTP_OK) {
          val body = connection.inputStream.bufferedReader().use { it.readText() }
          val results = mutableListOf<String>()
          val json = JSONObject(body)
          val predictions = json.optJSONArray("predictions")
          if (predictions != null) {
            for (i in 0 until predictions.length()) {
              val item = predictions.optJSONObject(i)
              item?.optString("standardRoman")?.takeIf { it.isNotBlank() }?.let { results.add(it) }
            }
          }
          if (results.isNotEmpty()) {
            Handler(Looper.getMainLooper()).post {
              candidateBar.removeAllViews()
              addCandidateViews(results)
            }
          }
        }
      } catch (ignored: Exception) {
        // Let the local dictionary fallback remain visible.
      }
    }.start()
  }

  private fun commitCandidate(candidate: String) {
    currentInputConnection?.finishComposingText()
    currentInputConnection?.commitText("$candidate ", 1)
    currentComposition = ""
    updateCandidates()
  }

  private fun commitCurrentComposition(addTrailingSpace: Boolean = false) {
    currentInputConnection?.finishComposingText()
    val commit = if (currentComposition.isEmpty()) " " else if (addTrailingSpace) "$currentComposition " else currentComposition
    currentInputConnection?.commitText(commit, 1)
    currentComposition = ""
    updateCandidates()
  }

  private fun predictCandidates(prefix: String): List<String> {
    if (prefix.isEmpty()) {
      return dictionary.take(5)
    }
    return dictionary.filter { it.startsWith(prefix.lowercase()) }.take(5)
  }

  fun insertText(text: String) {
    when (text) {
      "⌫" -> onBackspacePressed()
      " " -> onKeyPressed(" ")
      else -> onKeyPressed(text)
    }
  }

  fun replaceText(original: String, replacement: String) {
    currentInputConnection?.let {
      if (original.isNotEmpty()) {
        it.deleteSurroundingText(original.length, 0)
      }
      it.commitText(replacement, 1)
    }
  }
}
