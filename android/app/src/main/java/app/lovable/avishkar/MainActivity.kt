package app.lovable.avishkar

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin

class MainActivity : BridgeActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    registerPlugin(FirebaseAuthenticationPlugin::class.java)
    super.onCreate(savedInstanceState)
  }
}
