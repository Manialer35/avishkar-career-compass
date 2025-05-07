
package app.lovable.avishkar

import android.app.Application
import app.lovable.avishkar.services.ImageManager

class AvishkarApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize ImageManager with Supabase credentials
        val supabaseUrl = getString(R.string.supabase_url)
        val supabaseKey = getString(R.string.supabase_key)
        
        ImageManager.initialize(this, supabaseUrl, supabaseKey)
    }
}
