
import { supabase } from '@/integrations/supabase/client';

class EncryptionService {
  private encryptionKey: string | null = null;

  private async getEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('get-encryption-key');
      
      if (error) {
        console.error('Failed to get encryption key:', error);
        throw new Error('Encryption service unavailable');
      }
      
      if (!data?.key) {
        throw new Error('Invalid encryption key received');
      }
      
      this.encryptionKey = data.key;
      return this.encryptionKey;
    } catch (error) {
      console.error('Encryption key retrieval failed:', error);
      throw new Error('Failed to initialize encryption');
    }
  }

  async encryptApiKey(apiKey: string): Promise<string> {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key provided');
    }

    try {
      const key = await this.getEncryptionKey();
      
      // Simple encryption implementation
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const keyData = encoder.encode(key);
      
      const encrypted = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        encrypted[i] = data[i] ^ keyData[i % keyData.length];
      }
      
      return btoa(String.fromCharCode(...encrypted));
    } catch (error) {
      console.error('API key encryption failed:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  async decryptApiKey(encryptedKey: string): Promise<string> {
    if (!encryptedKey || typeof encryptedKey !== 'string') {
      throw new Error('Invalid encrypted key provided');
    }

    try {
      const key = await this.getEncryptionKey();
      
      const encrypted = new Uint8Array(
        atob(encryptedKey).split('').map(char => char.charCodeAt(0))
      );
      
      const encoder = new TextEncoder();
      const keyData = encoder.encode(key);
      
      const decrypted = new Uint8Array(encrypted.length);
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyData[i % keyData.length];
      }
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('API key decryption failed:', error);
      throw new Error('Failed to decrypt API key');
    }
  }
}

export const encryptionService = new EncryptionService();
