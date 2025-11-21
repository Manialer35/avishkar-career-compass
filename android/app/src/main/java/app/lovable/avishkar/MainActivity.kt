package app.lovable.avishkar

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Register Firebase plugins
        registerPlugin(io.capawesome.capacitorjs.plugins.firebase.app.FirebaseAppPlugin::class.java)
        registerPlugin(io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin::class.java)
    }
}
