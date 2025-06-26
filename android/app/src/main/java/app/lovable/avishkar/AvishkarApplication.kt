package app.lovable.avishkar

import android.app.Application
import android.util.Log

class AvishkarApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Log.d("AvishkarApp", "Application started")
    }
}
