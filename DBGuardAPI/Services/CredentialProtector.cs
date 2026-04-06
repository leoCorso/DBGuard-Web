using Microsoft.AspNetCore.DataProtection;

namespace DBGuardAPI.Services
{
    public class CredentialProtector
    {
        private readonly IDataProtector _protector;
        public CredentialProtector(IDataProtectionProvider dataProtectionProvider)
        {
            _protector = dataProtectionProvider.CreateProtector("DBGuardCredentials.v1");
        }
        public string Encrypt(string plaintext) => _protector.Protect(plaintext);
        public string Decrypt(string ciphertext) => _protector.Unprotect(ciphertext);
    }
}
