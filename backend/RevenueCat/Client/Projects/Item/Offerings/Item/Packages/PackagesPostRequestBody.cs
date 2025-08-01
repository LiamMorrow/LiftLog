// <auto-generated/>
#pragma warning disable CS0618
using Microsoft.Kiota.Abstractions.Extensions;
using Microsoft.Kiota.Abstractions.Serialization;
using System.Collections.Generic;
using System.IO;
using System;
namespace RevenueCat.Client.Projects.Item.Offerings.Item.Packages
{
    [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
    #pragma warning disable CS1591
    public partial class PackagesPostRequestBody : IParsable
    #pragma warning restore CS1591
    {
        /// <summary>The display name of the package</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? DisplayName { get; set; }
#nullable restore
#else
        public string DisplayName { get; set; }
#endif
        /// <summary>The lookup_key of the package</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? LookupKey { get; set; }
#nullable restore
#else
        public string LookupKey { get; set; }
#endif
        /// <summary>The position of the package in the offering</summary>
        public int? Position { get; set; }
        /// <summary>
        /// Creates a new instance of the appropriate class based on discriminator value
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Projects.Item.Offerings.Item.Packages.PackagesPostRequestBody"/></returns>
        /// <param name="parseNode">The parse node to use to read the discriminator value and create the object</param>
        public static global::RevenueCat.Client.Projects.Item.Offerings.Item.Packages.PackagesPostRequestBody CreateFromDiscriminatorValue(IParseNode parseNode)
        {
            _ = parseNode ?? throw new ArgumentNullException(nameof(parseNode));
            return new global::RevenueCat.Client.Projects.Item.Offerings.Item.Packages.PackagesPostRequestBody();
        }
        /// <summary>
        /// The deserialization information for the current model
        /// </summary>
        /// <returns>A IDictionary&lt;string, Action&lt;IParseNode&gt;&gt;</returns>
        public virtual IDictionary<string, Action<IParseNode>> GetFieldDeserializers()
        {
            return new Dictionary<string, Action<IParseNode>>
            {
                { "display_name", n => { DisplayName = n.GetStringValue(); } },
                { "lookup_key", n => { LookupKey = n.GetStringValue(); } },
                { "position", n => { Position = n.GetIntValue(); } },
            };
        }
        /// <summary>
        /// Serializes information the current object
        /// </summary>
        /// <param name="writer">Serialization writer to use to serialize this model</param>
        public virtual void Serialize(ISerializationWriter writer)
        {
            _ = writer ?? throw new ArgumentNullException(nameof(writer));
            writer.WriteStringValue("display_name", DisplayName);
            writer.WriteStringValue("lookup_key", LookupKey);
            writer.WriteIntValue("position", Position);
        }
    }
}
#pragma warning restore CS0618
