using System.Collections;
using System.ComponentModel.Design;
using System.Resources.NetStandard;

namespace LiftLog.Translator.Services;

public static class ResxEditor
{
    public static OrderedDictionary<string, ResxValue> ReadFromXml(string resxFileContents)
    {
        var dict = new OrderedDictionary<string, ResxValue>();

        using ResXResourceReader resxReader = ResXResourceReader.FromFileContents(resxFileContents);
        resxReader.UseResXDataNodes = true;
        foreach (var data in resxReader.Cast<DictionaryEntry>())
        {
            var resxDataNode = (ResXDataNode)data.Value!;
            // var comment = meta.Value as string;
            dict.Add(
                (string)data.Key,
                new(
                    (string)resxDataNode.GetValue((ITypeResolutionService)null!),
                    resxDataNode.Comment
                )
            );
        }

        return dict;
    }

    public static string WriteToXml(OrderedDictionary<string, ResxValue> dict)
    {
        using var memoryStream = new MemoryStream();
        using ResXResourceWriter resxWriter = new(memoryStream);
        foreach (var (key, value) in dict)
        {
            var resxDataNode = new ResXDataNode(key, value.Value) { Comment = value.Comment };
            resxWriter.AddResource(key, resxDataNode);
        }
        resxWriter.Close();
        return System.Text.Encoding.UTF8.GetString(memoryStream.ToArray());
    }
}

public record ResxValue(string Value, string Comment);
