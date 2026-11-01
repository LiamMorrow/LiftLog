package expo.modules.nativelib

import android.app.LocaleManager
import android.os.Build
import android.os.LocaleList
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LiftLogLocaleModule : Module() {
    private val localeManager: LocaleManager?
        get() = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            appContext.reactContext?.getSystemService(LocaleManager::class.java)
        } else {
            null
        }

    override fun definition() = ModuleDefinition {
        Name("LiftLogLocale")

        Function("getApplicationLanguage") {
            localeManager?.applicationLocales?.get(0)?.toLanguageTag()
        }

        Function("setApplicationLanguage") { languageTag: String? ->
            localeManager?.applicationLocales =
                if (languageTag == null) LocaleList.getEmptyLocaleList() else LocaleList.forLanguageTags(languageTag)
        }
    }
}
