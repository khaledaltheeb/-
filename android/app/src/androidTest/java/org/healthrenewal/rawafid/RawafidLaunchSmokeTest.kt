package org.healthrenewal.rawafid

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class RawafidLaunchSmokeTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun homeShowsPrimaryNavigationAndHelpEntry() {
        composeRule.onNodeWithText("روافد").assertIsDisplayed()
        composeRule.onNodeWithText("ساعدني الآن").assertIsDisplayed()
        composeRule.onNodeWithText("اليوم").assertIsDisplayed()
        composeRule.onNodeWithText("صحتي").assertIsDisplayed()
        composeRule.onNodeWithText("الأمان").assertIsDisplayed()
    }
}
