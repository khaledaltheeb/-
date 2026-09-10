@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package org.healthrenewal.basira.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.healthrenewal.basira.ar.ArCameraView
import org.healthrenewal.basira.data.*
import org.healthrenewal.basira.nav.*
import org.healthrenewal.basira.perception.ArFrameState
import java.util.UUID

private const val RC7_ANCHOR_LIMIT = 12

@Composable
fun ScanScreen(store: JsonStore, onSaved: (PlaceMap) -> Unit, onBack: () -> Unit) {
    BackHandler(onBack = onBack)
    val context = LocalContext.current
    val locator = remember { org.healthrenewal.basira.location.ForegroundPlaceLocator(context) }
    var geoSignature by remember { mutableStateOf<GeoSignature?>(null) }
    var locationResolved by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        locator.currentLocation { fix -> geoSignature = fix; locationResolved = true }
    }
    val mapId = remember { UUID.randomUUID().toString() }
    val mapCreatedAt = remember { System.currentTimeMillis() }
    val pendingAnchorFiles = remember { mutableStateListOf<String>() }
    val route = remember { mutableStateListOf<PoseSample>() }
    val landmarks = remember { mutableStateListOf<Landmark>() }
    val visualAnchors = remember { mutableStateListOf<VisualAnchor>() }
    var latest by remember { mutableStateOf<ArFrameState?>(null) }
    var arView by remember { mutableStateOf<ArCameraView?>(null) }
    var status by remember { mutableStateOf("تهيئة ARCore…") }
    var recording by remember { mutableStateOf(false) }
    var coverageScope by remember { mutableStateOf(MapCoverageScope.WHOLE_HOME) }
    var mapName by remember { mutableStateOf("المنزل ${store.loadMaps().size + 1}") }
    var landmarkLabel by remember { mutableStateOf("") }
    var anchorLabel by remember { mutableStateOf("") }
    var anchorMessage by remember { mutableStateOf<String?>(null) }
    var qualityReport by remember { mutableStateOf<MapQualityReport?>(null) }
    var mapperSafetyReviewed by remember { mutableStateOf(false) }
    val mappingMonitor = remember { MappingQualityMonitor() }
    var liveMappingQuality by remember { mutableStateOf<MappingLiveQuality?>(null) }
    var editorBaseline by remember { mutableStateOf<List<PoseSample>>(emptyList()) }
    var draftMessage by remember { mutableStateOf<String?>(null) }
    var workingCopyDirty by remember { mutableStateOf(false) }

    fun normalizedWorkingMap(): PlaceMap = MapCoordinateFrame.normalizeMap(
        PlaceMap(
            id = mapId,
            name = mapName.trim().ifBlank { "مكان" },
            createdAt = mapCreatedAt,
            route = route.toList(),
            landmarks = landmarks.toList(),
            visualAnchors = visualAnchors.toList(),
            mapperSafetyReviewed = mapperSafetyReviewed,
            captureMode = MapCaptureMode.FAMILY_GUIDED,
            coverageScope = coverageScope,
            geoSignature = geoSignature,
            updatedAt = System.currentTimeMillis()
        )
    )

    fun adoptNormalizedWorkingCopy(map: PlaceMap) {
        route.clear(); route.addAll(map.route)
        landmarks.clear(); landmarks.addAll(map.landmarks)
        visualAnchors.clear(); visualAnchors.addAll(map.visualAnchors)
    }

    fun persistDraft(adoptNormalized: Boolean = true): PlaceMap? {
        if (route.size < 2) return null
        val normalized = normalizedWorkingMap()
        val report = MapQualityValidator.validate(normalized)
        store.saveMap(normalized) // Draft persistence is unconditional; navigation readiness remains strict.
        pendingAnchorFiles.clear()
        qualityReport = report
        if (adoptNormalized) adoptNormalizedWorkingCopy(normalized)
        workingCopyDirty = false
        draftMessage = if (report.navigationReady) {
            "تم حفظ الخريطة. المسار جاهز لاختبار ملاحة مُشرف عليه بعد المراجعة النهائية."
        } else {
            "تم حفظ التسجيل كمسودة محلية. لن يصدر بصيرة أوامر حركة منها حتى تستوفي متطلبات السلامة والجودة."
        }
        return normalized
    }

    DisposableEffect(Unit) {
        onDispose { pendingAnchorFiles.toList().forEach(store::deleteAnchorImage) }
    }

    Box(Modifier.fillMaxSize()) {
        ArView(
            modifier = Modifier.fillMaxSize(),
            onReady = { arView = it },
            onFrame = { frame ->
                latest = frame
                val p = frame.pose
                if (recording) {
                    val liveQuality = mappingMonitor.observe(p)
                    liveMappingQuality = liveQuality
                    if (p.trackingConfidence >= 0.70f && liveQuality.samplingAllowed) {
                        val last = route.lastOrNull()
                        if (last == null || RoutePlanner.horizontalDistance(last.position, p.position) >= 0.10f || p.t - last.t >= 650L) {
                            route += p
                        }
                    }
                }
            },
            onStatus = { status = it }
        )

        Column(
            Modifier.align(Alignment.TopCenter).fillMaxWidth().background(Color.Black.copy(alpha = .72f)).padding(12.dp)
        ) {
            Text("تعليم المكان", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Text(status, color = Color.White, fontSize = 13.sp)
            Text(scanInstruction(route.size, recording), color = Color.White)
            if (recording) liveMappingQuality?.let { live ->
                Text(live.message, color = if (live.samplingAllowed) Color.White else MaterialTheme.colorScheme.errorContainer, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        Card(Modifier.align(Alignment.BottomCenter).fillMaxWidth().padding(10.dp)) {
            Column(
                Modifier.padding(14.dp).heightIn(max = 410.dp).verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(9.dp)
            ) {
                OutlinedTextField(
                    value = mapName,
                    onValueChange = { mapName = it.take(60) },
                    label = { Text("اسم المكان") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Text("نطاق الخريطة", fontWeight = FontWeight.SemiBold)
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilterChip(
                        selected = coverageScope == MapCoverageScope.WHOLE_HOME,
                        onClick = { coverageScope = MapCoverageScope.WHOLE_HOME },
                        label = { Text("منزل كامل") }
                    )
                    FilterChip(
                        selected = coverageScope == MapCoverageScope.ROOM_OR_AREA,
                        onClick = { coverageScope = MapCoverageScope.ROOM_OR_AREA },
                        label = { Text("غرفة/مساحة") }
                    )
                    FilterChip(
                        selected = coverageScope == MapCoverageScope.ROUTE,
                        onClick = { coverageScope = MapCoverageScope.ROUTE },
                        label = { Text("مسار") }
                    )
                }
                Text(
                    when (coverageScope) {
                        MapCoverageScope.WHOLE_HOME -> "مرّ على الممرات الرئيسية واربط كل غرفة بوجهة واضحة مثل الحمام والمطبخ وغرفة النوم، وأعد تسمية نقاط التقاطع نفسها عند الرجوع إليها."
                        MapCoverageScope.ROOM_OR_AREA -> "امسح المساحة وحدود الحركة ومداخلها والعوائق الثابتة، وأضف وجهة باسم الغرفة."
                        MapCoverageScope.ROUTE -> "سجّل مسارًا محددًا من نقطة بداية ثابتة إلى وجهة واحدة أو أكثر."
                    },
                    fontSize = 12.sp
                )
                Text("نقاط المسار: ${route.size} • العلامات: ${landmarks.size} • المراسي: ${visualAnchors.size}/$RC7_ANCHOR_LIMIT")
                Text(if (!locationResolved) "تحديد موقع المكان…" else if (geoSignature != null) "تم ربط المكان بموقع تقريبي للعثور عليه لاحقًا" else "الموقع غير متاح؛ يمكن حفظ الخريطة لكن لن تُقترح تلقائيًا عند العودة", fontSize = 12.sp)
                if (!recording) {
                    Button(
                        onClick = {
                            qualityReport = null
                            draftMessage = null
                            editorBaseline = emptyList()
                            workingCopyDirty = false
                            route.clear()
                            landmarks.clear()
                            visualAnchors.clear()
                            mapperSafetyReviewed = false
                            pendingAnchorFiles.toList().forEach(store::deleteAnchorImage)
                            pendingAnchorFiles.clear()
                            mappingMonitor.reset()
                            liveMappingQuality = null
                            recording = true
                        },
                        enabled = latest?.pose?.trackingConfidence ?: 0f >= .7f,
                        modifier = Modifier.fillMaxWidth().heightIn(min = 56.dp)
                    ) { Text("ابدأ تسجيل المسار") }
                } else {
                    Button(
                        onClick = {
                            recording = false
                            val saved = persistDraft(adoptNormalized = true)
                            if (saved != null) {
                                editorBaseline = saved.route.toList()
                                draftMessage = "تم إنهاء التسجيل وحفظ مسودة تلقائيًا. راجع الرسم أدناه واسحب أي نقطة تحتاج تصحيحًا، ثم احفظ التعديلات."
                            } else {
                                draftMessage = "لم تُحفظ مسودة بعد لأن التسجيل لا يحتوي نقطتين موثوقتين على الأقل."
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("أنهِ التسجيل واعرض المسار") }
                }

                if (!recording && route.size >= 2 && editorBaseline.isNotEmpty()) {
                    EditableRoutePreview(
                        route = route,
                        landmarks = landmarks,
                        onMovePoint = { index, newPosition ->
                            if (index in route.indices) {
                                route[index] = route[index].copy(position = newPosition)
                                workingCopyDirty = true
                                qualityReport = null
                                draftMessage = "تم تعديل النقطة ${index + 1}. التعديل الحالي لم يُحفظ بعد."
                            }
                        },
                        onResetPoint = { index ->
                            if (index in route.indices && index in editorBaseline.indices) {
                                route[index] = editorBaseline[index]
                                workingCopyDirty = true
                                qualityReport = null
                                draftMessage = "أُعيدت النقطة ${index + 1} إلى موضعها الأصلي. احفظ المسودة لتثبيت التغيير."
                            }
                        },
                        onResetAll = {
                            route.clear(); route.addAll(editorBaseline)
                            workingCopyDirty = true
                            qualityReport = null
                            draftMessage = "أُلغيت تعديلات المسار وعاد الرسم إلى التسجيل الأصلي. احفظ المسودة لتثبيت ذلك."
                        }
                    )
                    OutlinedButton(
                        onClick = { persistDraft(adoptNormalized = true) },
                        modifier = Modifier.fillMaxWidth()
                    ) { Text(if (workingCopyDirty) "احفظ تعديلات المسار كمسودة" else "احفظ المسودة مرة أخرى") }
                }

                draftMessage?.let {
                    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                        Text(it, Modifier.padding(10.dp), fontSize = 13.sp)
                    }
                }

                latest?.pose?.takeIf { recording && it.trackingConfidence >= .7f }?.let { pose ->
                    OutlinedTextField(
                        value = landmarkLabel,
                        onValueChange = { landmarkLabel = it.take(50) },
                        label = { Text("اسم العلامة أو الوجهة") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    LandmarkChips(pose, landmarkLabel) { type, fallback ->
                        landmarks += Landmark(
                            id = UUID.randomUUID().toString(),
                            label = landmarkLabel.trim().ifBlank { fallback },
                            type = type,
                            position = pose.position,
                            yawRad = pose.yawRad
                        )
                        landmarkLabel = ""
                    }
                }

                if (visualAnchors.size < RC7_ANCHOR_LIMIT) {
                    OutlinedTextField(
                        value = anchorLabel,
                        onValueChange = { anchorLabel = it.take(50) },
                        label = { Text("اسم المرساة: مثال لوحة قرب المدخل") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedButton(
                        onClick = {
                            val view = arView ?: return@OutlinedButton
                            anchorMessage = "ثبّت الهاتف…"
                            view.requestVisualAnchorCapture { result ->
                                anchorMessage = result.message
                                if (result.accepted && result.pngBytes != null && result.worldAnchorPose != null) {
                                    val anchorId = UUID.randomUUID().toString()
                                    val fileName = "anchor-${mapId.take(8)}-${anchorId.take(8)}.bin"
                                    runCatching { store.saveAnchorImage(fileName, result.pngBytes) }
                                        .onSuccess {
                                            pendingAnchorFiles += fileName
                                            visualAnchors += VisualAnchor(
                                                id = anchorId,
                                                label = anchorLabel.trim().ifBlank { "مرساة ${visualAnchors.size + 1}" },
                                                mapPose = result.worldAnchorPose,
                                                imageFileName = fileName
                                            )
                                            anchorLabel = ""
                                        }
                                        .onFailure { anchorMessage = "تعذر تشفير المرساة وحفظها محليًا" }
                                }
                            }
                        },
                        enabled = latest?.pose?.trackingConfidence ?: 0f >= .9f,
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("التقط مرساة بصرية ثابتة") }
                    Text("اختر لوحة أو علامة ثابتة على سطح رأسي غني بالتفاصيل، وصوّرها من الأمام بعد أن يتعرف ARCore على السطح. لا تستخدم شخصًا أو شاشة متغيرة أو سطحًا أفقيًا.", fontSize = 12.sp)
                    anchorMessage?.let { Text(it, fontSize = 13.sp) }
                }

                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                    Row(Modifier.fillMaxWidth().padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = mapperSafetyReviewed, onCheckedChange = { mapperSafetyReviewed = it })
                        Text("أنا الشخص المبصر الذي صوّر المكان، وقد راجعت الدرج والحواف والعوائق الثابتة ومناطق الخطر وأضفت العلامات اللازمة.", Modifier.weight(1f), fontSize = 13.sp)
                    }
                }

                val canEvaluate = !recording && route.size >= 2
                Button(
                    onClick = {
                        val saved = persistDraft(adoptNormalized = true)
                        if (saved != null) onSaved(saved)
                    },
                    enabled = canEvaluate,
                    modifier = Modifier.fillMaxWidth().heightIn(min = 58.dp)
                ) { Text("احفظ الخريطة والعودة") }

                qualityReport?.let { QualityReportCard(it) }
                OutlinedButton(onClick = onBack, modifier = Modifier.fillMaxWidth()) { Text("إلغاء والعودة") }
            }
        }
    }
}
