package org.healthrenewal.rawafid

import android.content.Context
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning

/**
 * Privacy-minimized Rawafid ID scanner.
 *
 * Google Code Scanner owns the camera UI through Google Play services, so the
 * Rawafid app does not request CAMERA permission and receives only the decoded
 * value. Scanning never sends a Circle request automatically: the caller only
 * receives a validated RFD identifier to review in the existing form.
 */
object CircleQrScanner {
    private val options = GmsBarcodeScannerOptions.Builder()
        .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
        .enableAutoZoom()
        .build()

    fun normalizedRawafidId(rawValue: String?): String? {
        val candidate = CircleRules.normalizeRawafidId(rawValue.orEmpty()).take(24)
        return candidate.takeIf(CircleRules::isValidRawafidId)
    }

    fun start(
        context: Context,
        onSuccess: (String) -> Unit,
        onCanceled: () -> Unit,
        onFailure: (String) -> Unit
    ) {
        GmsBarcodeScanning.getClient(context, options)
            .startScan()
            .addOnSuccessListener { barcode ->
                val id = normalizedRawafidId(barcode.rawValue)
                if (id == null) {
                    onFailure("رمز QR لا يحتوي على معرّف روافد صالح من نوع RFD.")
                } else {
                    onSuccess(id)
                }
            }
            .addOnCanceledListener { onCanceled() }
            .addOnFailureListener {
                onFailure("تعذر فتح قارئ QR الآن. يمكنك لصق معرّف RFD يدويًا.")
            }
    }
}
