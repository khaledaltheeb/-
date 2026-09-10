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
    val width: Float,
    val height: Float
) {
    fun toScreen(position: Vec3): Offset = Offset(
        x = left + (position.x - minX) * scale,
        y = top + height - (position.z - minZ) * scale
    )

    fun toWorld(offset: Offset, y: Float): Vec3 {
        val bounded = Offset(
            x = offset.x.coerceIn(left, left + width),
            y = offset.y.coerceIn(top, top + height)
        )
        return Vec3(
            x = minX + (bounded.x - left) / scale,
            y = y,
            z = minZ + (top + height - bounded.y) / scale
        )
    }
}

private fun routeViewport(
    route: List<PoseSample>,
    landmarks: List<Landmark>,
    size: IntSize
): RouteViewport? {
    if (route.isEmpty() || size.width <= 0 || size.height <= 0) return null
    val xs = route.map { it.position.x } + landmarks.map { it.position.x }
    val zs = route.map { it.position.z } + landmarks.map { it.position.z }
    val rawMinX = xs.minOrNull() ?: 0f
    val rawMaxX = xs.maxOrNull() ?: rawMinX + 1f
    val rawMinZ = zs.minOrNull() ?: 0f
    val rawMaxZ = zs.maxOrNull() ?: rawMinZ + 1f
    val spanX = max(rawMaxX - rawMinX, 0.8f)
    val spanZ = max(rawMaxZ - rawMinZ, 0.8f)
    val marginPx = 32f
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
        width = drawnW,
        height = drawnH
    )
}

private fun nearestRoutePoint(offset: Offset, viewport: RouteViewport, route: List<PoseSample>): Int =
    route.indices.minByOrNull { index ->
        val p = viewport.toScreen(route[index].position)
        val dx = p.x - offset.x
        val dy = p.y - offset.y
        dx * dx + dy * dy
    } ?: -1

/**
 * Sighted-helper top-down route editor.
 *
 * The viewport is frozen for the lifetime of each drag gesture. This matters:
 * recomputing fit-to-screen after every point movement would move the coordinate
 * frame under the user's finger and make precise correction impossible.
 * Elevation (Y) is preserved; editing changes only floor-plane X/Z.
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
    var dragViewport by remember { mutableStateOf<RouteViewport?>(null) }
    val routeSnapshot = route.toList()
    val landmarksSnapshot = landmarks.toList()
    val latestRoute by rememberUpdatedState(routeSnapshot)
    val latestLandmarks by rememberUpdatedState(landmarksSnapshot)

    val primary = MaterialTheme.colorScheme.primary
    val selectedColor = MaterialTheme.colorScheme.error
    val pointColor = MaterialTheme.colorScheme.onSurface
    val landmarkColor = MaterialTheme.colorScheme.tertiary
    val surface = MaterialTheme.colorScheme.surfaceVariant

    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("معاينة المسار وتحريره", fontWeight = FontWeight.Bold)
            Text(
                "هذه خريطة علوية للمسار بعد إنهاء التسجيل. اضغط أي نقطة لاختيارها ثم اسحبها، أو استخدم أزرار 10 سم للتصحيح الدقيق. الارتفاع المسجل لا يتغير.",
                style = MaterialTheme.typography.bodySmall
            )
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(320.dp)
                    .background(surface)
                    .onSizeChanged { canvasSize = it }
                    .pointerInput(canvasSize) {
                        detectTapGestures { offset ->
                            val currentRoute = latestRoute
                            val vp = routeViewport(currentRoute, latestLandmarks, canvasSize)
                            if (vp != null) selectedIndex = nearestRoutePoint(offset, vp, currentRoute)
                        }
                    }
                    .pointerInput(canvasSize) {
                        detectDragGestures(
                            onDragStart = { offset ->
                                val currentRoute = latestRoute
                                val vp = routeViewport(currentRoute, latestLandmarks, canvasSize)
                                dragViewport = vp
                                if (vp != null) selectedIndex = nearestRoutePoint(offset, vp, currentRoute)
                            },
                            onDragEnd = { dragViewport = null },
                            onDragCancel = { dragViewport = null },
                            onDrag = { change, _ ->
                                val currentRoute = latestRoute
                                val index = selectedIndex
                                val vp = dragViewport ?: return@detectDragGestures
                                if (index !in currentRoute.indices) return@detectDragGestures
                                val current = currentRoute[index]
                                onMovePoint(index, vp.toWorld(change.position, current.position.y))
                                change.consume()
                            }
                        )
                    }
            ) {
                val vp = routeViewport(routeSnapshot, landmarksSnapshot, IntSize(size.width.toInt(), size.height.toInt())) ?: return@Canvas
                for (i in 0 until routeSnapshot.lastIndex) {
                    drawLine(
                        color = primary,
                        start = vp.toScreen(routeSnapshot[i].position),
                        end = vp.toScreen(routeSnapshot[i + 1].position),
                        strokeWidth = 5f,
                        cap = StrokeCap.Round
                    )
                }
                landmarksSnapshot.forEach { landmark ->
                    drawCircle(landmarkColor, radius = 8f, center = vp.toScreen(landmark.position))
                }
                routeSnapshot.forEachIndexed { index, sample ->
                    drawCircle(
                        color = if (index == selectedIndex) selectedColor else pointColor,
                        radius = if (index == selectedIndex) 11f else 5f,
                        center = vp.toScreen(sample.position)
                    )
                }
                routeSnapshot.firstOrNull()?.let {
                    drawCircle(Color.White, radius = 4f, center = vp.toScreen(it.position))
                }
            }

            if (selectedIndex in routeSnapshot.indices) {
                val selected = routeSnapshot[selectedIndex]
                Text(
                    "النقطة ${selectedIndex + 1} من ${routeSnapshot.size} • X %.2f م • Z %.2f م".format(selected.position.x, selected.position.z),
                    fontWeight = FontWeight.SemiBold
                )
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedButton(
                        onClick = { onMovePoint(selectedIndex, selected.position.copy(x = selected.position.x - 0.10f)) },
                        modifier = Modifier.weight(1f)
                    ) { Text("يسار 10سم") }
                    OutlinedButton(
                        onClick = { onMovePoint(selectedIndex, selected.position.copy(x = selected.position.x + 0.10f)) },
                        modifier = Modifier.weight(1f)
                    ) { Text("يمين 10سم") }
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedButton(
                        onClick = { onMovePoint(selectedIndex, selected.position.copy(z = selected.position.z + 0.10f)) },
                        modifier = Modifier.weight(1f)
                    ) { Text("أمام 10سم") }
                    OutlinedButton(
                        onClick = { onMovePoint(selectedIndex, selected.position.copy(z = selected.position.z - 0.10f)) },
                        modifier = Modifier.weight(1f)
                    ) { Text("خلف 10سم") }
                }
                TextButton(onClick = { onResetPoint(selectedIndex) }, modifier = Modifier.fillMaxWidth()) {
                    Text("إرجاع هذه النقطة كما سُجلت")
                }
            }
            TextButton(onClick = onResetAll, modifier = Modifier.fillMaxWidth()) {
                Text("إلغاء جميع تعديلات المسار")
            }
            Text(
                "الخط = مسار الحركة • النقاط = عينات المسار • الدوائر الأخرى = العلامات/الوجهات",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
