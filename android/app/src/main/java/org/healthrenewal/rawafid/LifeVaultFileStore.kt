package org.healthrenewal.rawafid

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.io.DataInputStream
import java.io.DataOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.CipherInputStream
import javax.crypto.CipherOutputStream
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

data class LifeVaultAttachment(
    val name: String,
    val mimeType: String,
    val sizeBytes: Long
)

/**
 * App-private encrypted binary storage for Life Vault attachments.
 *
 * Files are selected/exported through Android's Storage Access Framework, so
 * Rawafid does not request broad storage permissions. The encrypted payload
 * never leaves app-private storage unless the user explicitly exports it.
 */
object LifeVaultFileStore {
    const val MAX_FILE_BYTES: Long = 25L * 1024L * 1024L

    private const val DIRECTORY = "life_vault_files"
    private const val KEYSTORE = "AndroidKeyStore"
    private const val ALIAS = "rawafid_life_vault_files_aes_v1"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private val MAGIC = byteArrayOf('R'.code.toByte(), 'V'.code.toByte(), 'L'.code.toByte(), 'T'.code.toByte(), 1)

    fun describe(context: Context, uri: Uri): LifeVaultAttachment {
        var name = "attachment"
        var declaredSize = -1L
        context.contentResolver.query(
            uri,
            arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE),
            null,
            null,
            null
        )?.use { cursor ->
            if (cursor.moveToFirst()) {
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
                if (nameIndex >= 0) name = cursor.getString(nameIndex).orEmpty().ifBlank { name }
                if (sizeIndex >= 0 && !cursor.isNull(sizeIndex)) declaredSize = cursor.getLong(sizeIndex)
            }
        }
        name = name.replace(Regex("[\\\\/\\u0000-\\u001F]"), "_").take(160).ifBlank { "attachment" }
        return LifeVaultAttachment(
            name = name,
            mimeType = context.contentResolver.getType(uri) ?: "application/octet-stream",
            sizeBytes = declaredSize.coerceAtLeast(0L)
        )
    }

    fun importEncrypted(context: Context, uri: Uri, itemId: Long): LifeVaultAttachment {
        val declared = describe(context, uri)
        require(declared.sizeBytes <= MAX_FILE_BYTES || declared.sizeBytes == 0L) {
            "File exceeds Life Vault size limit"
        }

        val directory = directory(context)
        val temp = File(directory, "$itemId.tmp")
        val target = File(directory, "$itemId.rvlt")
        temp.delete()

        var copied = 0L
        try {
            val source = context.contentResolver.openInputStream(uri) ?: throw IOException("Unable to open selected file")
            source.use { input ->
                val cipher = Cipher.getInstance(TRANSFORMATION).apply { init(Cipher.ENCRYPT_MODE, secretKey()) }
                FileOutputStream(temp).use { fileOut ->
                    val header = DataOutputStream(fileOut)
                    header.write(MAGIC)
                    header.writeInt(cipher.iv.size)
                    header.write(cipher.iv)
                    header.flush()
                    CipherOutputStream(header, cipher).use { encryptedOut ->
                        val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
                        while (true) {
                            val read = input.read(buffer)
                            if (read < 0) break
                            copied += read
                            if (copied > MAX_FILE_BYTES) throw IOException("File exceeds Life Vault size limit")
                            encryptedOut.write(buffer, 0, read)
                        }
                    }
                }
            }

            if (target.exists() && !target.delete()) throw IOException("Unable to replace encrypted attachment")
            if (!temp.renameTo(target)) {
                temp.copyTo(target, overwrite = true)
                if (!temp.delete()) temp.deleteOnExit()
            }
            return declared.copy(sizeBytes = copied)
        } catch (error: Exception) {
            temp.delete()
            target.delete()
            throw error
        }
    }

    fun exportDecrypted(context: Context, itemId: Long, destination: Uri) {
        val encrypted = file(context, itemId)
        require(encrypted.isFile) { "Encrypted attachment is missing" }

        FileInputStream(encrypted).use { fileIn ->
            val header = DataInputStream(fileIn)
            val magic = ByteArray(MAGIC.size)
            header.readFully(magic)
            require(magic.contentEquals(MAGIC)) { "Invalid Life Vault attachment" }
            val ivLength = header.readInt()
            require(ivLength in 12..32) { "Invalid Life Vault IV" }
            val iv = ByteArray(ivLength)
            header.readFully(iv)

            val cipher = Cipher.getInstance(TRANSFORMATION).apply {
                init(Cipher.DECRYPT_MODE, secretKey(), GCMParameterSpec(128, iv))
            }
            val output = context.contentResolver.openOutputStream(destination, "w")
                ?: throw IOException("Unable to open export destination")
            output.use { out ->
                CipherInputStream(header, cipher).use { decryptedIn -> decryptedIn.copyTo(out) }
            }
        }
    }

    fun exists(context: Context, itemId: Long): Boolean = file(context, itemId).isFile

    fun delete(context: Context, itemId: Long) {
        file(context, itemId).delete()
        File(directory(context), "$itemId.tmp").delete()
    }

    private fun directory(context: Context): File = File(context.filesDir, DIRECTORY).apply {
        if (!exists() && !mkdirs()) throw IOException("Unable to create Life Vault directory")
    }

    private fun file(context: Context, itemId: Long): File = File(directory(context), "$itemId.rvlt")

    private fun secretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(KEYSTORE).apply { load(null) }
        val existing = keyStore.getKey(ALIAS, null) as? SecretKey
        if (existing != null) return existing

        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE)
        generator.init(
            KeyGenParameterSpec.Builder(
                ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()
        )
        return generator.generateKey()
    }
}
