using System.Security.Cryptography;

namespace LiftLog.Lib.Services;

public class SignatureMismatchException(string message) : CryptographicException(message) { }
