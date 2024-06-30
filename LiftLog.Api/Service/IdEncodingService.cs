using Microsoft.Extensions.Options;
using Sqids;

namespace LiftLog.Api.Service;

public class IdEncodingServiceConfiguration
{
    public string Alphabet { get; set; } = null!;
}

public class IdEncodingService
{
    private readonly SqidsEncoder<int> encoder;

    public IdEncodingService(IOptions<IdEncodingServiceConfiguration> options)
    {
        var alphabet = options.Value.Alphabet;
        encoder = new SqidsEncoder<int>(new() { Alphabet = alphabet, MinLength = 6 });
    }

    public string EncodeId(int id)
    {
        return encoder.Encode(id);
    }

    public bool TryDecodeId(string encodedId, out int decodedId)
    {
        var decoded = encoder.Decode(encodedId);
        if (decoded.Count == 0)
        {
            decodedId = 0;
            return false;
        }
        decodedId = decoded[0];
        return true;
    }
}
