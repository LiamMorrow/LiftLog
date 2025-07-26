using LiftLog.Api.Utils;

namespace LiftLog.Tests.Api.Utils;

public class PartialJsonParserTests
{
    [Fact]
    public void TryParsePartialJson_WithCompleteValidJson_ShouldParseSuccessfully()
    {
        // Arrange
        var completeJson = """{"name": "John", "age": 30}""";

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(
            completeJson,
            out var parsed
        );

        // Assert
        result.Should().BeTrue();
        parsed.Should().NotBeNull();
        parsed!.Name.Should().Be("John");
        parsed.Age.Should().Be(30);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void TryParsePartialJson_WithEmptyOrWhitespaceInput_ShouldReturnFalse(string input)
    {
        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(input, out var parsed);

        // Assert
        result.Should().BeFalse();
        parsed.Should().BeNull();
    }

    [Fact]
    public void TryParsePartialJson_WithNullInput_ShouldReturnFalse()
    {
        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(null!, out var parsed);

        // Assert
        result.Should().BeFalse();
        parsed.Should().BeNull();
    }

    [Fact]
    public void TryParsePartialJson_WithMissingClosingBrace_ShouldCompleteAndParse()
    {
        // Arrange
        var incompleteJson = """{"name": "John", "age": 30""";

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(
            incompleteJson,
            out var parsed
        );

        // Assert
        result.Should().BeTrue();
        parsed.Should().NotBeNull();
        parsed!.Name.Should().Be("John");
        parsed.Age.Should().Be(30);
    }

    [Fact]
    public void TryParsePartialJson_WithMissingClosingQuoteAndBrace_ShouldCompleteAndParse()
    {
        // Arrange
        var incompleteJson = """
            {"name": "John", "age": 30, "city": "New York"
            """;

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(
            incompleteJson,
            out var parsed
        );

        // Assert
        result.Should().BeTrue();
        parsed.Should().NotBeNull();
        parsed!.Name.Should().Be("John");
        parsed.Age.Should().Be(30);
        parsed.City.Should().Be("New York");
    }

    [Fact]
    public void TryParsePartialJson_WithNestedObjectsMissingBraces_ShouldCompleteAndParse()
    {
        // Arrange
        var incompleteJson = """
            {"name": "John", "address": {"street": "123 Main St", "city": "Boston"
            """;

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObjectWithNested>(
            incompleteJson,
            out var parsed
        );

        // Assert
        result.Should().BeTrue();
        parsed.Should().NotBeNull();
        parsed!.Name.Should().Be("John");
        parsed.Address.Should().NotBeNull();
        parsed.Address!.Street.Should().Be("123 Main St");
        parsed.Address.City.Should().Be("Boston");
    }

    [Fact]
    public void TryParsePartialJson_WithArrayMissingClosingBracket_ShouldCompleteAndParse()
    {
        // Arrange
        var incompleteJson = """
            {"name": "John", "hobbies": ["reading", "gaming"
            """;

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObjectWithArray>(
            incompleteJson,
            out var parsed
        );

        // Assert
        result.Should().BeTrue();
        parsed.Should().NotBeNull();
        parsed!.Name.Should().Be("John");
        parsed.Hobbies.Should().NotBeNull();
        parsed.Hobbies.Should().HaveCount(2);
        parsed.Hobbies.Should().Contain("reading");
        parsed.Hobbies.Should().Contain("gaming");
    }

    [Fact]
    public void TryParsePartialJson_WithNestedArraysAndObjects_ShouldCompleteAndParse()
    {
        // Arrange
        var incompleteJson = """{"items": [{"id": 1, "data": [1, 2, 3""";

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObjectWithNestedArray>(
            incompleteJson,
            out var parsed
        );

        // Assert
        result.Should().BeTrue();
        parsed.Should().NotBeNull();
        parsed!.Items.Should().NotBeNull();
        parsed.Items.Should().HaveCount(1);
        parsed.Items![0].Id.Should().Be(1);
        parsed.Items[0].Data.Should().NotBeNull();
        parsed.Items[0].Data.Should().HaveCount(3);
        parsed.Items[0].Data.Should().Equal(1, 2, 3);
    }

    [Fact]
    public void TryParsePartialJson_WithEscapedQuotes_ShouldHandleCorrectly()
    {
        // Arrange
        var incompleteJson = "{\"name\": \"John \\\"The Great\\\"\", \"age\": 30";

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(
            incompleteJson,
            out var parsed
        );

        // Assert
        result.Should().BeTrue();
        parsed.Should().NotBeNull();
        parsed!.Name.Should().Be("John \"The Great\"");
        parsed.Age.Should().Be(30);
    }

    [Fact]
    public void TryParsePartialJson_WithEscapedBackslashes_ShouldHandleCorrectly()
    {
        // Arrange
        var incompleteJson = """
            {"path": "C:\\Users\\John", "name": "John"
            """;

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(
            incompleteJson,
            out var parsed
        );

        // Assert
        result.Should().BeTrue();
        parsed.Should().NotBeNull();
        parsed!.Path.Should().Be("C:\\Users\\John");
        parsed.Name.Should().Be("John");
    }

    [Theory]
    [InlineData("invalid json")]
    [InlineData("{{")]
    [InlineData("]}")]
    public void TryParsePartialJson_WithMalformedJson_ShouldReturnFalse(string invalidJson)
    {
        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(invalidJson, out var parsed);

        // Assert
        result.Should().BeFalse();
        parsed.Should().BeNull();
    }
}

// Test classes for deserialization
public class TestObject
{
    public string? Name { get; set; }
    public int Age { get; set; }
    public string? City { get; set; }
    public string? Path { get; set; }
}

public class TestObjectWithNested
{
    public string? Name { get; set; }
    public TestAddress? Address { get; set; }
}

public class TestAddress
{
    public string? Street { get; set; }
    public string? City { get; set; }
}

public class TestObjectWithArray
{
    public string? Name { get; set; }
    public List<string>? Hobbies { get; set; }
}

public class TestObjectWithNestedArray
{
    public List<TestItemWithArray>? Items { get; set; }
}

public class TestItemWithArray
{
    public int Id { get; set; }
    public List<int>? Data { get; set; }
}
