package org.healthrenewal.basira.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import org.healthrenewal.basira.data.Landmark
import org.healthrenewal.basira.data.PoseSample
import org.healthrenewal.basira.data.Vec3
import kotlin.math.max
import kotlin.math.min

private data class RouteViewport(
    val minX: Float,
    val minZ: Float,
    val scale: Float,
    val left: Float,
    val top: Float,
    val height: Float
) {
    fun toScreen(position: Vec3): Offset = Offset(
        x = left + (position.x - minX) * scale,
        y = top + height - (position.z - minZ) * scale
    )

    fun toWorld(offset: Offset, y: Float): Vec3 = Vec3(
        x = minX + (offset.x - left) / scale,
        y = y,
        z = minZ + (top + height - offset.y) / scale
    )
}

/**
 * Sighted-helper top-down route editor.
 * Every recorded sample remains individually selectable and draggable.
 * Y/elevation is intentionally preserved; the editor changes only the floor-plane X/Z position.
 */
@Composable
internal fun EditableRoutePreview(
    route: List<PoseSample>,
    landmarks: List<Landmark>,
    onMovePoint: (index: Int, newPosition: Vec3) -> Unit,
    onResetPoint: (index: Int) -> Unit,
    onResetAll: () -> Unit
) {
    var selectedIndex by remember(route.size) { mutableIntStateOf(if (route.isEmpty()) -1 else 0) }
    var canvasSize by remember { mutableStateOf(IntSize.Zero) }
    val routeSnapshot = route.toList()
    val primary = MaterialTheme.colorScheme.primary
    val selectedColor = MaterialTheme.colorScheme.error
    val pointColor = MaterialTheme.colorScheme.onSurface
    val landmarkColor = MaterialTheme.colorScheme.tertiary
    val surface = MaterialTheme.colorScheme.surfaceVariant

    fun viewport(size: IntSize): RouteViewport? {
        if (routeSnapshot.isEmpty() || size.width <= 0 || size.height <= 0) return null
        val xs = routeSnapshot.map { it.position.x } + landmarks.map { it.position.x }
        val zs = routeSnapshot.map { it.position.z } + landmarks.map { it.position.z }
        val rawMinX = xs.minOrNull() ?: 0f
        val rawMaxX = xs.maxOrNull() ?: rawMinX + 1f
        val rawMinZ = zs.minOrNull() ?: 0f
        val rawMaxZ = zs.maxOrNull() ?: rawMinZ + 1f
        val spanX = max(rawMaxX - rawMinX, 0.8f)
        val spanZ = max(rawMaxZ - rawMinZ, 0.8f)
        val marginPx = 28f
        val usableW = max(size.width.toFloat() - marginPx * 2f, 1f)
        val usableH = max(size.height.toFloat() - marginPx * 2f, 1f)
        val scale = min(usableW / spanX, usableH / spanZ).coerceAtLeast(1f)
        val drawnW = spanX * scale
        val drawnH = spanZ * scale
        return RouteViewport(
            minX = rawMinX - (spanX - (rawMaxX - rawMinX)) / 2f,
            minZ = rawMinZ - (spanZ - (rawMaxZ - rawMinZ)) / 2f,
            scale = scale,
            left = (size.width - drawnW) / 2f,
            top = (size.height - drawnH) / 2f,
            height = drawnH
        )
    }

    fun nearestIndex(offset: Offset): Int {
        val vp = viewport(canvasSize) ?: return -1
        return routeSnapshot.indices.minByOrNull { index ->
            val p = vp.toScreen(routeSnapshot[index].position)
            val dx = p.x - offset.x
            val dy = p.y - offset.y
            dx * dx + dy * dy
        } ?: -1
    }

    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("معاينة المسار وتحريره", fontWeight = FontWeight.Bold)
            Text(
                "هذه خريطة علوية للمسار بعد إنهاء التسجيل. اضغط أي نقطة لاختيارها ثم اسحبها إلى الموضع الصحيح. التعديل هنا أفقي فقط ولا يغيّر الارتفاع المسجل.",
                style = MaterialTheme.typography.bodySmall
            )
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp)
                    .background(surface)
                    .onSizeChanged { canvasSize = it }
                    .pointerInput(routeSnapshot, canvasSize) {
                        detectTapGestures { offset ->
                            selectedIndex = nearestIndex(offset)
                        }
                    }
                    .pointerInput(routeSnapshot, canvasSize, selectedIndex) {
                        detectDragGestures(
                            onDragStart = { offset -> selectedIndex = nearestIndex(offset) },
                            onDrag = { change, _ ->
                                val index = selectedIndex
                                val vp = viewport(canvasSize)
                                if (index !in routeSnapshot.indices || vp == null) return@detectDragGestures
                                val current = routeSnapshot[index]
                                onMovePoint(index, vp.toWorld(change.position, current.position.y))
                                change.consume()
                            }
                        )
                    }
            ) {
                val vp = viewport(IntSize(size.width.toInt(), size.height.toInt())) ?: return@Canvas
                for (i in 0 until routeSnapshot.lastIndex) {
                    drawLine(
                        color = primary,
                        start = vp.toScreen(routeSnapshot[i].position),
                        end = vp.toScreen(routeSnapshot[i + 1].position),
                        strokeWidth = 5f,
                        cap = StrokeCap.Round
                    )
                }
                landmarks.forEach { landmark ->
                    drawCircle(landmarkColor, radius = 8f, center = vp.toScreen(landmark.position))
                }
                routeSnapshot.forEachIndexed { index, sample ->
                    drawCircle(
                        color = if (index == selectedIndex) selectedColor else pointColor,
                        radius = if (index == selectedIndex) 10f else 5f,
                        center = vp.toScreen(sample.position)
                    )
                }
                routeSnapshot.firstOrNull()?.let { drawCircle(Color.White, radius = 4f, center = vp.toScreen(it.position)) }
            }

            if (selectedIndex in routeSnapshot.indices) {
                val selected = routeSnapshot[selectedIndex]
                Text(
                    "النقطة ${selectedIndex + 1} من ${routeSnapshot.size} • X %.2f م • Z %.2f م".format(selected.position.x, selected.position.z),
                    fontWeight = FontWeight.SemiBold
                )
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedButton(onClick = { onMovePoint(selectedIndex, selected.position.copy(x = selected.position.x - 0.10f)) }, modifier = Modifier.weight(1f)) { Text("يسار 10سم") }
                    OutlinedButton(onClick = { onMovePoint(selectedIndex, selected.position.copy(x = selected.position.x + 0.10f)) }, modifier = Modifier.weight(1f)) { Text("يمين 10سم") }
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedButton(onClick = { onMovePoint(selectedIndex, selected.position.copy(z = selected.position.z + 0.10f)) }, modifier = Modifier.weight(1f)) { Text("أمام 10سم") }
                    OutlinedButton(onClick = { onMovePoint(selectedIndex, selected.position.copy(z = selected.position.z - 0.10f)) }, modifier = Modifier.weight(1f)) { Text("خلف 10سم") }
                }
                TextButton(onClick = { onResetPoint(selectedIndex) }, modifier = Modifier.fillMaxWidth()) { Text("إرجاع هذه النقطة كما سُجلت") }
            }
            TextButton(onClick = onResetAll, modifier = Modifier.fillMaxWidth()) { Text("إلغاء جميع تعديلات المسار") }
            Text("الخط = مسار الحركة • النقاط = عينات المسار • الدوائر الأخرى = العلامات/الوجهات", style = MaterialTheme.typography.bodySmall)
        }
    }
}
