
package app.lovable.avishkar.models

data class ImageItem(
    val id: String,
    val title: String,
    val url: String,
    val category: String,
    val uploadDate: String = "",
    val fileName: String = "",
    val localPath: String? = null
)
