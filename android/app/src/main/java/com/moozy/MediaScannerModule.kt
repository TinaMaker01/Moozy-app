package com.moozy

import android.provider.MediaStore
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray

/**
 * Bulk-lists the device's audio library straight from Android's MediaStore
 * index, instead of the JS side recursively walking the filesystem and
 * guessing title/artist from the file name. This is the same source of
 * truth every native Android music player (Gramophone included) reads
 * from — it's already indexed by the OS, so listing thousands of tracks is
 * a single fast query rather than one filesystem stat per file.
 *
 * Deliberately minimal: one method, plain data, no native UI. Genre is left
 * out — MediaStore's genre index is unreliable/empty on a large share of
 * real devices, so surfacing it here would mostly mean showing "Unknown"
 * anyway; not worth the extra native complexity for that.
 */
class MediaScannerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "MediaScanner"

  @ReactMethod
  fun scanAudioFiles(promise: Promise) {
    val results: WritableArray = Arguments.createArray()

    try {
      val collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
      val projection = arrayOf(
          MediaStore.Audio.Media._ID,
          MediaStore.Audio.Media.TITLE,
          MediaStore.Audio.Media.ARTIST,
          MediaStore.Audio.Media.ALBUM,
          MediaStore.Audio.Media.ALBUM_ID,
          MediaStore.Audio.Media.DURATION,
          MediaStore.Audio.Media.DATA,
          MediaStore.Audio.Media.DATE_ADDED,
          MediaStore.Audio.Media.SIZE,
      )
      // IS_MUSIC excludes ringtones/notifications/alarms; the duration floor
      // additionally filters out short voice-memo-like clips that are
      // technically flagged as music but aren't real tracks.
      val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0 AND " +
          "${MediaStore.Audio.Media.DURATION} >= ?"
      val selectionArgs = arrayOf("20000")

      val resolver = reactApplicationContext.contentResolver
      resolver.query(collection, projection, selection, selectionArgs, null)?.use { cursor ->
        val idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
        val titleCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
        val artistCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
        val albumCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
        val albumIdCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
        val durationCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
        val dataCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
        val dateAddedCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_ADDED)
        val sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)

        while (cursor.moveToNext()) {
          try {
            val id = cursor.getLong(idCol)
            val albumId = cursor.getLong(albumIdCol)
            val path = cursor.getString(dataCol)
            // A null/blank path means the file isn't reachable as a plain
            // local file (rare — e.g. some cloud-synced providers); skip it
            // rather than hand the player a URL that won't resolve.
            if (path.isNullOrBlank()) {
              continue
            }

            val track = Arguments.createMap()
            track.putString("id", id.toString())
            track.putString("title", cursor.getString(titleCol) ?: "")
            track.putString("artist", cursor.getString(artistCol) ?: "")
            track.putString("album", cursor.getString(albumCol) ?: "")
            track.putString("albumId", albumId.toString())
            track.putDouble("duration", cursor.getLong(durationCol) / 1000.0)
            track.putString("path", path)
            track.putDouble("dateAdded", cursor.getLong(dateAddedCol).toDouble())
            track.putDouble("size", cursor.getLong(sizeCol).toDouble())
            track.putString(
                "artworkUri",
                "content://media/external/audio/albumart/$albumId"
            )
            results.pushMap(track)
          } catch (rowError: Exception) {
            // One malformed row (corrupt tag, odd OEM column quirk) shouldn't
            // abort the whole scan — skip it and keep going.
          }
        }
      }

      promise.resolve(results)
    } catch (error: Exception) {
      // Resolve with whatever we collected rather than rejecting: a partial
      // library is much better UX than the scan silently throwing and the
      // caller having to special-case a rejected promise.
      promise.resolve(results)
    }
  }
}
