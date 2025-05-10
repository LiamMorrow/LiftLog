package com.limajuice.liftlogreact

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.google.android.material.materialswitch.MaterialSwitch
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.uimanager.ViewProps
import com.facebook.react.uimanager.annotations.ReactPropGroup

class MaterialSwitchManager : SimpleViewManager<MaterialSwitch>() {
    override fun getName(): String {
        return "MaterialSwitch"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): MaterialSwitch {
        val switchView = MaterialSwitch(reactContext)

        // Emit event on change
        switchView.setOnCheckedChangeListener { _, isChecked ->
            val eventDispatcher = reactContext.getNativeModule(UIManagerModule::class.java)?.eventDispatcher
            eventDispatcher?.dispatchEvent(SwitchChangeEvent(switchView.id, isChecked))
        }

        return switchView
    }

    @ReactProp(name = "value")
    fun setValue(view: MaterialSwitch, value: Boolean) {
        view.isChecked = value
    }
}
