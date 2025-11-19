package app.lovable.avishkar

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    
    private lateinit var permissionsHelper: PermissionsHelper
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize runtime permissions helper
        permissionsHelper = PermissionsHelper(this)
        permissionsHelper.setupPermissions()
        permissionsHelper.checkAndRequestPermissions()
    }
}
