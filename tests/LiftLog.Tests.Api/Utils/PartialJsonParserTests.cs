using LiftLog.Api.Utils;

namespace LiftLog.Tests.Api.Utils;

public class PartialJsonParserTests
{
    [Test]
    public async Task TryParsePartialJson_WithCompleteValidJson_ShouldParseSuccessfully()
    {
        // Arrange
        var completeJson = """{"name": "John", "age": 30}""";

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(
            completeJson,
            out var parsed
        );

        // Assert
        await Assert.That(result).IsTrue();
        await Assert.That(parsed).IsNotNull();
        await Assert.That(parsed!.Name).IsEqualTo("John");
        await Assert.That(parsed.Age).IsEqualTo(30);
    }

    [Test]
    [Arguments("")]
    [Arguments("   ")]
    public async Task TryParsePartialJson_WithEmptyOrWhitespaceInput_ShouldReturnFalse(string input)
    {
        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(input, out var parsed);

        // Assert
        await Assert.That(result).IsFalse();
        await Assert.That(parsed).IsNull();
    }

    [Test]
    public async Task TryParsePartialJson_WithNullInput_ShouldReturnFalse()
    {
        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(null!, out var parsed);

        // Assert
        await Assert.That(result).IsFalse();
        await Assert.That(parsed).IsNull();
    }

    [Test]
    public async Task TryParsePartialJson_WithMissingClosingBrace_ShouldCompleteAndParse()
    {
        // Arrange
        var incompleteJson = """{"name": "John", "age": 30""";

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(
            incompleteJson,
            out var parsed
        );

        // Assert
        await Assert.That(result).IsTrue();
        await Assert.That(parsed).IsNotNull();
        await Assert.That(parsed!.Name).IsEqualTo("John");
        await Assert.That(parsed.Age).IsEqualTo(30);
    }

    [Test]
    public async Task TryParsePartialJson_WithMissingClosingQuoteAndBrace_ShouldCompleteAndParse()
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
        await Assert.That(result).IsTrue();
        await Assert.That(parsed).IsNotNull();
        await Assert.That(parsed!.Name).IsEqualTo("John");
        await Assert.That(parsed.Age).IsEqualTo(30);
        await Assert.That(parsed.City).IsEqualTo("New York");
    }

    [Test]
    public async Task TryParsePartialJson_WithNestedObjectsMissingBraces_ShouldCompleteAndParse()
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
        await Assert.That(result).IsTrue();
        await Assert.That(parsed).IsNotNull();
        await Assert.That(parsed!.Name).IsEqualTo("John");
        await Assert.That(parsed.Address).IsNotNull();
        await Assert.That(parsed.Address!.Street).IsEqualTo("123 Main St");
        await Assert.That(parsed.Address.City).IsEqualTo("Boston");
    }

    [Test]
    public async Task TryParsePartialJson_WithArrayMissingClosingBracket_ShouldCompleteAndParse()
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
        await Assert.That(result).IsTrue();
        await Assert.That(parsed).IsNotNull();
        await Assert.That(parsed!.Name).IsEqualTo("John");
        await Assert.That(parsed.Hobbies).IsNotNull();
        await Assert.That(parsed.Hobbies!.Count).IsEqualTo(2);
        await Assert.That(parsed.Hobbies).Contains("reading");
        await Assert.That(parsed.Hobbies).Contains("gaming");
    }

    [Test]
    public async Task TryParsePartialJson_WithNestedArraysAndObjects_ShouldCompleteAndParse()
    {
        // Arrange
        var incompleteJson = """{"items": [{"id": 1, "data": [1, 2, 3""";

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObjectWithNestedArray>(
            incompleteJson,
            out var parsed
        );

        // Assert
        await Assert.That(result).IsTrue();
        await Assert.That(parsed).IsNotNull();
        await Assert.That(parsed!.Items).IsNotNull();
        await Assert.That(parsed.Items!.Count).IsEqualTo(1);
        await Assert.That(parsed.Items![0].Id).IsEqualTo(1);
        await Assert.That(parsed.Items[0].Data).IsNotNull();
        await Assert.That(parsed.Items[0].Data!.Count).IsEqualTo(3);
        await Assert.That(parsed.Items[0].Data).IsEquivalentTo(new[] { 1, 2, 3 });
    }

    [Test]
    public async Task TryParsePartialJson_WithEscapedQuotes_ShouldHandleCorrectly()
    {
        // Arrange
        var incompleteJson = "{\"name\": \"John \\\"The Great\\\"\", \"age\": 30";

        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(
            incompleteJson,
            out var parsed
        );

        // Assert
        await Assert.That(result).IsTrue();
        await Assert.That(parsed).IsNotNull();
        await Assert.That(parsed!.Name).IsEqualTo("John \"The Great\"");
        await Assert.That(parsed.Age).IsEqualTo(30);
    }

    [Test]
    public async Task TryParsePartialJson_WithEscapedBackslashes_ShouldHandleCorrectly()
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
        await Assert.That(result).IsTrue();
        await Assert.That(parsed).IsNotNull();
        await Assert.That(parsed!.Path).IsEqualTo("C:\\Users\\John");
        await Assert.That(parsed.Name).IsEqualTo("John");
    }

    [Test]
    [Arguments("invalid json")]
    [Arguments("{{")]
    [Arguments("]}")]
    public async Task TryParsePartialJson_WithMalformedJson_ShouldReturnFalse(string invalidJson)
    {
        // Act
        var result = PartialJsonParser.TryParsePartialJson<TestObject>(invalidJson, out var parsed);

        // Assert
        await Assert.That(result).IsFalse();
        await Assert.That(parsed).IsNull();
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
