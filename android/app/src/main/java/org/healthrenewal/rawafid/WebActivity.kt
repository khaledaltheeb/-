package org.healthrenewal.rawafid

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

class WebActivity : ComponentActivity() {
    companion object { const val EXTRA_URL = "rawafid_url" }
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val initialUri = safeUri(intent.getStringExtra(EXTRA_URL)) ?: Uri.parse("https://healthrenewal.org/")
        if (isWomenCalendar(initialUri)) {
            startActivity(WomenPrivacyGate.intent(this, WomenPrivacyGate.TARGET_CALENDAR))
            finish()
            return
        }

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = false
            settings.allowContentAccess = false
            settings.javaScriptCanOpenWindowsAutomatically = false
            settings.setSupportMultipleWindows(false)
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            settings.safeBrowsingEnabled = true
            settings.userAgentString = settings.userAgentString + " RawafidAndroid/0.3"
            CookieManager.getInstance().setAcceptCookie(true)
            CookieManager.getInstance().setAcceptThirdPartyCookies(this, false)
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    val uri = request.url
                    if (isWomenCalendar(uri)) {
                        startActivity(WomenPrivacyGate.intent(this@WebActivity, WomenPrivacyGate.TARGET_CALENDAR))
                        return true
                    }
                    return if (isRawafid(uri)) false else {
                        runCatching { startActivity(Intent(Intent.ACTION_VIEW, uri)) }
                        true
                    }
                }

                override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
                    // The renderer is no longer usable. Tear down this activity instead
                    // of letting the process crash or retaining a broken WebView.
                    view.destroy()
                    finish()
                    return true
                }
            }
            loadUrl(initialUri.toString())
        }
        setContentView(webView)
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })
    }

    override fun onDestroy() {
        if (::webView.isInitialized) {
            runCatching { webView.stopLoading() }
            runCatching { webView.webViewClient = WebViewClient() }
            runCatching { webView.destroy() }
        }
        super.onDestroy()
    }

    private fun safeUri(raw: String?): Uri? {
        val uri = raw?.let { runCatching { Uri.parse(it) }.getOrNull() } ?: return null
        return if (isRawafid(uri)) uri else null
    }

    private fun isWomenCalendar(uri: Uri): Boolean =
        isRawafid(uri) && uri.path?.trimEnd('/') == "/sectors/calendars/women"

    private fun isRawafid(uri: Uri): Boolean {
        val host = uri.host?.lowercase() ?: return false
        return uri.scheme == "https" && (host == "healthrenewal.org" || host.endsWith(".healthrenewal.org"))
    }
}
