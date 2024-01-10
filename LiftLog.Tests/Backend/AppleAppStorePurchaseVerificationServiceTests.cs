using FluentAssertions;
using LiftLog.Api.Service;
using LiftLog.Api.Validators;
using Microsoft.Extensions.Logging;

namespace LiftLog.Tests.Backend;

public class AppleAppStorePurchaseVerificationServiceTests
{
    [Fact]
    public async Task IsValidPurchaseToken_WithInvalidToken_ReturnsFalse()
    {
        // Arrange
        var logger = Substitute.For<ILogger<AppleAppStorePurchaseVerificationService>>();
        var service = new AppleAppStorePurchaseVerificationService(
            new HttpClient(),
            new AppleAppStorePurchaseReceiptValidator(),
            logger
        );

        // Act
        var result = await service.IsValidPurchaseToken("invalid token");

        // Assert
        result.Should().BeFalse();
    }

    // Not sure how to provide a valid token for testing
    // [Fact]
    // public async Task IsValidPurchaseToken_WithValidToken_ReturnsTrue()
    // {
    //     // Arrange
    //     var logger = Substitute.For<ILogger<AppleAppStorePurchaseVerificationService>>();
    //     var service = new AppleAppStorePurchaseVerificationService(new HttpClient(), logger);

    //     // Act
    //     var result = await service.IsValidPurchaseToken(
    //         ""
    //     );

    //     // Assert
    //     result.Should().BeTrue();
    // }
}
