package com.limajuice.liftlogreact  // Use the same package as your other Kotlin files

import com.facebook.react.bridge.Arguments
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter

class SwitchChangeEvent(private val viewId: Int, private val value: Boolean) :
    Event<SwitchChangeEvent>(viewId) {

    override fun getEventName(): String {
        return "topChange" // React Native expects this name for onChange
    }

    override fun dispatch(rctEventEmitter: RCTEventEmitter) {
        val eventData = Arguments.createMap().apply {
            putBoolean("value", value)
        }
        rctEventEmitter.receiveEvent(viewTag, eventName, eventData)
    }
}
