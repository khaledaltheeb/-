package org.healthrenewal.rawafid

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasScrollAction
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performScrollToNode
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class WhatNowScreenSmokeTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<WhatNowActivity>()

    @Test
    fun whatNowLoadsOfflineGuidanceShell() {
        composeRule.onNodeWithText("ماذا أفعل الآن؟").assertIsDisplayed()
        composeRule.onNodeWithText("مسارات قصيرة تعمل دون اتصال ولا تحاول تشخيص السبب").assertIsDisplayed()
    }
}

@RunWith(AndroidJUnit4::class)
class TravelSafeScreenSmokeTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<TravelSafeActivity>()

    @Test
    fun travelSafeLoadsEncryptedProfileAndOfflinePhraseShell() {
        composeRule.onNodeWithText("Travel Safe").assertIsDisplayed()
        composeRule.onNodeWithText("ملف الرحلة").assertIsDisplayed()

        composeRule.onNode(hasScrollAction()).performScrollToNode(hasText("عبارات جاهزة"))
        composeRule.onNodeWithText("عبارات جاهزة").assertIsDisplayed()
    }
}

@RunWith(AndroidJUnit4::class)
class AccessibilityProfileScreenSmokeTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<AccessibilityProfileActivity>()

    @Test
    fun accessibilitySettingsLoadWithPrivacyDisclosure() {
        composeRule.onNodeWithText("الإعدادات والوصولية").assertIsDisplayed()
        composeRule.onNodeWithText("معاينة مباشرة — غير محفوظة").assertIsDisplayed()

        composeRule.onNode(hasScrollAction()).performScrollToNode(hasText("الخصوصية"))
        composeRule.onNodeWithText("الخصوصية").assertIsDisplayed()
    }
}
