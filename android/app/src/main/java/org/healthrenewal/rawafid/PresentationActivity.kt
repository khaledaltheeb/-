package org.healthrenewal.rawafid

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import org.json.JSONArray
import org.json.JSONObject

data class PresentationCard(
    val title: String,
    val body: String,
    val secondary: String = "",
    val hint: String = ""
)

class PresentationActivity : ComponentActivity() {
    companion object {
        private const val EXTRA_TITLE = "presentation_title"
        private const val EXTRA_CARDS = "presentation_cards"
        private const val EXTRA_INDEX = "presentation_start_index"

        fun open(
            context: Context,
            title: String,
            cards: List<PresentationCard>,
            startIndex: Int = 0
        ) {
            if (cards.isEmpty()) return
            val payload = JSONArray().apply {
                cards.forEach { card ->
                    put(
                        JSONObject()
                            .put("title", card.title)
                            .put("body", card.body)
                            .put("secondary", card.secondary)
                            .put("hint", card.hint)
                    )
                }
            }
            context.startActivity(
                Intent(context, PresentationActivity::class.java)
                    .putExtra(EXTRA_TITLE, title)
                    .putExtra(EXTRA_CARDS, payload.toString())
                    .putExtra(EXTRA_INDEX, startIndex.coerceIn(0, cards.lastIndex))
            )
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        val title = intent.getStringExtra(EXTRA_TITLE).orEmpty().ifBlank { "عرض مباشر" }
        val cards = decodeCards(intent.getStringExtra(EXTRA_CARDS).orEmpty())
        val startIndex = intent.getIntExtra(EXTRA_INDEX, 0).coerceIn(0, (cards.size - 1).coerceAtLeast(0))

        setContent {
            RawafidTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(Modifier.fillMaxSize()) {
                        if (cards.isEmpty()) {
                            EmptyPresentation { finish() }
                        } else {
                            PresentationScreen(
                                title = title,
                                cards = cards,
                                startIndex = startIndex,
                                onExit = { finish() }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun decodeCards(raw: String): List<PresentationCard> = runCatching {
        val array = JSONArray(raw)
        buildList {
            for (index in 0 until array.length()) {
                val item = array.optJSONObject(index) ?: continue
                val body = item.optString("body").trim()
                if (body.isBlank()) continue
                add(
                    PresentationCard(
                        title = item.optString("title").trim(),
                        body = body,
                        secondary = item.optString("secondary").trim(),
                        hint = item.optString("hint").trim()
                    )
                )
            }
        }
    }.getOrDefault(emptyList())
}

@Composable
private fun PresentationScreen(
    title: String,
    cards: List<PresentationCard>,
    startIndex: Int,
    onExit: () -> Unit
) {
    var index by remember { mutableIntStateOf(startIndex) }
    val card = cards[index]

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(RawafidSpacing.Lg),
        verticalArrangement = Arrangement.spacedBy(RawafidSpacing.Md)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
        ) {
            Column(Modifier.weight(1f)) {
                Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text(
                    "${index + 1} من ${cards.size}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            OutlinedButton(onClick = onExit) { Text("خروج") }
        }

        Card(modifier = Modifier.fillMaxWidth().weight(1f)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(RawafidSpacing.Xl),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (card.title.isNotBlank()) {
                    Text(
                        card.title,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(Modifier.padding(RawafidSpacing.Xs))
                }
                Text(
                    card.body,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurface
                )
                if (card.secondary.isNotBlank()) {
                    Spacer(Modifier.padding(RawafidSpacing.Md))
                    Text(
                        card.secondary,
                        style = MaterialTheme.typography.titleMedium,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                if (card.hint.isNotBlank()) {
                    Spacer(Modifier.padding(RawafidSpacing.Md))
                    Text(
                        card.hint,
                        style = MaterialTheme.typography.bodySmall,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(RawafidSpacing.Sm)
        ) {
            OutlinedButton(
                onClick = { index -= 1 },
                enabled = index > 0,
                modifier = Modifier.weight(1f)
            ) { Text("السابق") }
            Button(
                onClick = { if (index < cards.lastIndex) index += 1 else onExit() },
                modifier = Modifier.weight(1f)
            ) { Text(if (index < cards.lastIndex) "التالي" else "إنهاء") }
        }
    }
}

@Composable
private fun EmptyPresentation(onExit: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(RawafidSpacing.Xl),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("لا توجد بطاقة جاهزة للعرض.", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.padding(RawafidSpacing.Sm))
        Button(onClick = onExit) { Text("رجوع") }
    }
}
