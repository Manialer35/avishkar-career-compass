
# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Capacitor Rules
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-keep class app.lovable.avishkar.** { *; }

# Supabase related rules
-keep class io.github.jan-tennert.supabase.** { *; }
-keepclassmembers class io.github.jan-tennert.supabase.** { *; }

# Kotlin coroutines
-keepclassmembernames class kotlinx.** {
    volatile <fields>;
}

# Image loading (Coil)
-keep class coil.** { *; }

# General Android rules
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
