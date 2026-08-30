package com.moozy

import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import android.media.audiofx.Virtualizer
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import kotlin.math.abs

/**
 * Applies real audio processing (5-band EQ, bass boost, stereo widening) to
 * whatever Moozy is currently playing.
 *
 * react-native-track-player's underlying player (kotlin-audio's
 * QueuedAudioPlayer, wrapping ExoPlayer2) doesn't expose its own audio
 * session id through any public API reachable from this app, so per-session
 * effect attachment — what Gramophone does, since it owns its ExoPlayer
 * instance directly — isn't available to us here. Audio session id 0 is
 * Android's documented mechanism for exactly this situation: the effect
 * attaches to the device's output mix rather than one specific session, the
 * same technique standalone "system equalizer" apps use. In practice, for a
 * dedicated music player, that mix is Moozy's own playback.
 *
 * Every device exposes a different number of native EQ bands at different
 * center frequencies than Moozy's fixed UI set (60/230/910/3600/14000 Hz),
 * so each requested band is mapped to the closest one the device actually
 * has, with the requested gain clamped to what that device supports.
 */
// Virtualizer is marked deprecated in the Android SDK (Google steered apps
// away from it since OEM behavior varies a lot) but remains fully functional
// and is still what backs the "Spatialisation 3D" slider already in the UI.
@Suppress("DEPRECATION")
class EqualizerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "MoozyEqualizer"

  private var equalizer: Equalizer? = null
  private var bassBoost: BassBoost? = null
  private var virtualizer: Virtualizer? = null

  /** Lazily creates the effect instances; returns whether they're usable on this device. */
  private fun ensureEffects(): Boolean {
    if (equalizer != null) {
      return true
    }
    return try {
      equalizer = Equalizer(0, 0)
      try {
        bassBoost = BassBoost(0, 0)
      } catch (e: Exception) {
        bassBoost = null
      }
      try {
        virtualizer = Virtualizer(0, 0)
      } catch (e: Exception) {
        virtualizer = null
      }
      true
    } catch (e: Exception) {
      // Some OEMs/devices restrict global-session audio effects entirely —
      // report unsupported rather than crashing the Settings screen.
      equalizer = null
      bassBoost = null
      virtualizer = null
      false
    }
  }

  @ReactMethod
  fun isSupported(promise: Promise) {
    promise.resolve(ensureEffects())
  }

  @ReactMethod
  fun setEnabled(isEnabled: Boolean, promise: Promise) {
    if (!ensureEffects()) {
      promise.resolve(false)
      return
    }
    try {
      equalizer?.enabled = isEnabled
      bassBoost?.enabled = isEnabled
      virtualizer?.enabled = isEnabled
      promise.resolve(true)
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  private fun closestDeviceBand(eq: Equalizer, targetHz: Double, bandCount: Int): Short {
    var closest: Short = 0
    var closestDelta = Double.MAX_VALUE
    for (b in 0 until bandCount) {
      val band = b.toShort()
      val centerHz = eq.getCenterFreq(band) / 1000.0 // millihertz -> Hz
      val delta = abs(centerHz - targetHz)
      if (delta < closestDelta) {
        closestDelta = delta
        closest = band
      }
    }
    return closest
  }

  /** `bands` is an array of {hz: Number, gainDb: Number} entries. */
  @ReactMethod
  fun setBands(bands: ReadableArray, promise: Promise) {
    if (!ensureEffects()) {
      promise.resolve(false)
      return
    }
    val eq = equalizer
    if (eq == null) {
      promise.resolve(false)
      return
    }
    try {
      val deviceBandCount = eq.numberOfBands.toInt()
      val range = eq.bandLevelRange // [min, max] in millibels
      for (i in 0 until bands.size()) {
        val entry = bands.getMap(i) ?: continue
        val hz = entry.getDouble("hz")
        val gainDb = entry.getDouble("gainDb")
        val targetBand = closestDeviceBand(eq, hz, deviceBandCount)
        val millibels = (gainDb * 100).toInt().coerceIn(range[0].toInt(), range[1].toInt())
        eq.setBandLevel(targetBand, millibels.toShort())
      }
      promise.resolve(true)
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun setBassBoostStrength(percent: Int, promise: Promise) {
    if (!ensureEffects()) {
      promise.resolve(false)
      return
    }
    try {
      val bb = bassBoost
      if (bb != null && bb.strengthSupported) {
        bb.setStrength((percent * 10).coerceIn(0, 1000).toShort())
        promise.resolve(true)
      } else {
        promise.resolve(false)
      }
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun setVirtualizerStrength(percent: Int, promise: Promise) {
    if (!ensureEffects()) {
      promise.resolve(false)
      return
    }
    try {
      val vz = virtualizer
      if (vz != null && vz.strengthSupported) {
        vz.setStrength((percent * 10).coerceIn(0, 1000).toShort())
        promise.resolve(true)
      } else {
        promise.resolve(false)
      }
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun release(promise: Promise) {
    try {
      equalizer?.release()
      bassBoost?.release()
      virtualizer?.release()
    } catch (e: Exception) {
      // Already released or never created — nothing to clean up.
    }
    equalizer = null
    bassBoost = null
    virtualizer = null
    promise.resolve(true)
  }
}
