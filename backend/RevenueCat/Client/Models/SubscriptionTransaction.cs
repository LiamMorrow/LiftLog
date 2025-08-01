// <auto-generated/>
#pragma warning disable CS0618
using Microsoft.Kiota.Abstractions.Extensions;
using Microsoft.Kiota.Abstractions.Serialization;
using System.Collections.Generic;
using System.IO;
using System;
namespace RevenueCat.Client.Models
{
    [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
    #pragma warning disable CS1591
    public partial class SubscriptionTransaction : IAdditionalDataHolder, IParsable
    #pragma warning restore CS1591
    {
        /// <summary>Stores additional data not described in the OpenAPI description found when deserializing. Can be used for serialization as well.</summary>
        public IDictionary<string, object> AdditionalData { get; set; }
        /// <summary>The ID of the subscription transaction in the store</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public string? Id { get; set; }
#nullable restore
#else
        public string Id { get; set; }
#endif
        /// <summary>String representing the object&apos;s type. Objects of the same type share the same value.</summary>
        public global::RevenueCat.Client.Models.SubscriptionTransaction_object? Object { get; set; }
        /// <summary>The date of the transaction in ms since epoch</summary>
        public long? PurchasedAt { get; set; }
        /// <summary>
        /// Instantiates a new <see cref="global::RevenueCat.Client.Models.SubscriptionTransaction"/> and sets the default values.
        /// </summary>
        public SubscriptionTransaction()
        {
            AdditionalData = new Dictionary<string, object>();
        }
        /// <summary>
        /// Creates a new instance of the appropriate class based on discriminator value
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Models.SubscriptionTransaction"/></returns>
        /// <param name="parseNode">The parse node to use to read the discriminator value and create the object</param>
        public static global::RevenueCat.Client.Models.SubscriptionTransaction CreateFromDiscriminatorValue(IParseNode parseNode)
        {
            _ = parseNode ?? throw new ArgumentNullException(nameof(parseNode));
            return new global::RevenueCat.Client.Models.SubscriptionTransaction();
        }
        /// <summary>
        /// The deserialization information for the current model
        /// </summary>
        /// <returns>A IDictionary&lt;string, Action&lt;IParseNode&gt;&gt;</returns>
        public virtual IDictionary<string, Action<IParseNode>> GetFieldDeserializers()
        {
            return new Dictionary<string, Action<IParseNode>>
            {
                { "id", n => { Id = n.GetStringValue(); } },
                { "object", n => { Object = n.GetEnumValue<global::RevenueCat.Client.Models.SubscriptionTransaction_object>(); } },
                { "purchased_at", n => { PurchasedAt = n.GetLongValue(); } },
            };
        }
        /// <summary>
        /// Serializes information the current object
        /// </summary>
        /// <param name="writer">Serialization writer to use to serialize this model</param>
        public virtual void Serialize(ISerializationWriter writer)
        {
            _ = writer ?? throw new ArgumentNullException(nameof(writer));
            writer.WriteStringValue("id", Id);
            writer.WriteEnumValue<global::RevenueCat.Client.Models.SubscriptionTransaction_object>("object", Object);
            writer.WriteLongValue("purchased_at", PurchasedAt);
            writer.WriteAdditionalData(AdditionalData);
        }
    }
}
#pragma warning restore CS0618
