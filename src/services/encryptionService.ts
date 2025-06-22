
import { supabase } from '@/integrations/supabase/client';

class EncryptionService {
  private async getEncryptionKey(): Promise<string> {
    // In a production environment, this would use a proper key management service
    // For now, we'll use a Supabase secret
    const { data, error } = await supabase.functions.invoke('get-encryption-key');
    if (error) throw new Error('Failed to get encryption key');
    return data.key;
  }

  async encryptApiKey(apiKey: string): Promise<string> {
    try {
      // Simple XOR encryption for demonstration
      // In production, use proper encryption like AES-256
      const key = await this.getEncryptionKey();
      let encrypted = '';
      for (let i = 0; i < apiKey.length; i++) {
        encrypted += String.fromCharCode(
          apiKey.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  async decryptApiKey(encryptedKey: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const encrypted = atob(encryptedKey);
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(
          encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt API key');
    }
  }
}

export const encryptionService = new EncryptionService();
